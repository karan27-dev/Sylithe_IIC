"""
Agroforestry + biochar programme — fast parcel screening.

`POST /api/agri/screen` answers, in a few seconds, whether a smallholder
parcel can carry a census-based agroforestry project and roughly what it is
worth. It is deliberately a separate endpoint from /api/chm/*: those build
map tiles and reduce the 1 m canopy model at scale=1 over a decade of burn
masks, which is the right thing for a full diligence report and far too slow
to sit behind a farmer drawing a boundary on a phone.

Two things keep this fast:

  1. No tile generation at all. getMapId() is a large part of the cost in
     run_chm_inference() and nothing here needs a rendered layer.
  2. One round trip. Every statistic is assembled into a single
     ee.Dictionary and fetched with one getInfo(), instead of a getInfo()
     per metric — each is a network call to Earth Engine, and that count is
     what actually drives wall-clock time.

Methodology (Verra VM0047 v1.1, census-based approach):
  • <= 50 planting units per hectare, above which the activity counts as
    land-use change and must use the area-based approach instead.
  • Only trees planted BY the project are creditable. Trees already on the
    parcel are baseline and earn nothing — so they are reported separately
    and never added to the plantable count.
"""
import logging
import threading
import time

import ee
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
agri_bp = Blueprint("agri", __name__)

# ── Methodology constants ────────────────────────────────────────────────
CENSUS_MAX_TREES_PER_HA = 50      # VM0047 v1.1 census-based ceiling
BUND_TREE_SPACING_M = 5.0         # typical boundary planting interval
MIN_TREE_HEIGHT_M = 2.0           # below this the canopy model is not a tree

# ── Estimation constants (indicative only — see _estimate_carbon) ────────
# Mean crown area used to turn canopy cover into a tree count. Farm/bund
# trees are smaller than closed-forest crowns; ~5.5 m diameter.
MEAN_CROWN_AREA_M2 = 25.0
# Residue produced per hectare per season, oven-dry tonnes, by crop.
RESIDUE_T_PER_HA = {"rice": 4.0, "wheat": 3.5, "maize": 3.0, "cotton": 2.5,
                    "sugarcane": 5.0, "other": 3.0}
# Fraction of residue that may leave the field. The rest must stay to
# maintain soil carbon input — removing all of it is how a biochar claim
# quietly over-credits against the soil pool.
REMOVABLE_RESIDUE_FRACTION = 0.4
BIOCHAR_YIELD_FROM_RESIDUE = 0.25   # dry residue -> biochar, slow pyrolysis
TCO2E_PER_T_BIOCHAR = 2.5           # carbon retained, as CO2e
# Sequestration per surviving planted tree in early years (tCO2e/tree/yr).
TCO2E_PER_TREE_YEAR = 0.035

DW_CLASSES = {0: "water", 1: "trees", 2: "grass", 3: "flooded", 4: "crops",
              5: "shrub", 6: "built", 7: "bare", 8: "snow"}
# Land cover a census agroforestry project can be established on.
ELIGIBLE_DW = {"crops", "grass", "shrub", "bare"}

_gee_ready = False


def _init_gee():
    global _gee_ready
    from services.gee_init import init_gee as _shared_init
    if _shared_init():
        _gee_ready = True


threading.Thread(target=_init_gee, daemon=True).start()


def _ensure_gee():
    """True when Earth Engine is usable; probes and retries if our flag is
    unset (the init thread can lose a startup race against other blueprints)."""
    global _gee_ready
    if _gee_ready:
        return True
    try:
        ee.Number(1).getInfo()
        _gee_ready = True
        return True
    except Exception:
        pass
    _init_gee()
    return _gee_ready


def _strip_z(coords):
    if not isinstance(coords, list):
        return coords
    if coords and isinstance(coords[0], (int, float)):
        return coords[:2]
    return [_strip_z(c) for c in coords]


def _aoi_from_geojson(geojson):
    """GeoJSON (FeatureCollection / Feature / Geometry) -> ee.Geometry."""
    if not isinstance(geojson, dict):
        raise ValueError("geojson must be an object")
    gtype = geojson.get("type")
    if gtype == "FeatureCollection":
        feats = []
        for feat in geojson.get("features") or []:
            g = (feat or {}).get("geometry") or {}
            if g.get("type") and "coordinates" in g:
                feats.append(ee.Feature(ee.Geometry({
                    "type": g["type"], "coordinates": _strip_z(g["coordinates"]),
                })))
        if not feats:
            raise ValueError("No valid geometries in FeatureCollection")
        return ee.FeatureCollection(feats).geometry()
    if gtype == "Feature":
        g = geojson.get("geometry") or {}
        if not g.get("type"):
            raise ValueError("Feature has no geometry")
        return ee.Geometry({"type": g["type"], "coordinates": _strip_z(g["coordinates"])})
    if not gtype or "coordinates" not in geojson:
        raise ValueError("Unrecognised GeoJSON")
    return ee.Geometry({"type": gtype, "coordinates": _strip_z(geojson["coordinates"])})


def _build_request(aoi, burn_years):
    """Assemble every statistic into ONE ee.Dictionary.

    Everything below is lazy — no network traffic happens until the caller
    runs .getInfo() on the returned dictionary, which is the single round
    trip this endpoint spends.
    """
    # ── Geometry: area and perimeter (perimeter == usable bund length) ──
    area_m2 = aoi.area(maxError=1)
    perimeter_m = aoi.perimeter(maxError=1)

    # ── Land cover: most recent full-year Dynamic World mode ────────────
    dw = (ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1")
          .filterBounds(aoi)
          .filterDate(f"{burn_years[-1] - 1}-01-01", f"{burn_years[-1] + 1}-01-01")
          .select("label"))
    lc_hist = dw.mode().clip(aoi).reduceRegion(
        reducer=ee.Reducer.frequencyHistogram(), geometry=aoi,
        scale=10, maxPixels=1e9, bestEffort=True,
    ).get("label")

    # ── Existing canopy (baseline, NOT creditable) ──────────────────────
    # Reduced at 5 m rather than the 1 m native resolution: this only needs
    # to answer "how much canopy is already here", and scale=1 is the single
    # most expensive operation in the full CHM pipeline.
    chm = ee.ImageCollection(
        "projects/meta-forest-monitoring-okw37/assets/CanopyHeight").mosaic().clip(aoi)
    tree_mask = chm.gt(MIN_TREE_HEIGHT_M)
    canopy_m2 = tree_mask.multiply(ee.Image.pixelArea()).reduceRegion(
        reducer=ee.Reducer.sum(), geometry=aoi, scale=5,
        maxPixels=1e9, bestEffort=True,
    ).values().get(0)
    canopy_mean_h = chm.updateMask(tree_mask).reduceRegion(
        reducer=ee.Reducer.mean(), geometry=aoi, scale=5,
        maxPixels=1e9, bestEffort=True,
    ).values().get(0)

    # ── Burn history: all years in one multi-band reduction ─────────────
    px_area = ee.Image.pixelArea()

    def burn_band(y):
        return (ee.ImageCollection("MODIS/061/MCD64A1")
                .filterDate(f"{y}-01-01", f"{y}-12-31")
                .select("BurnDate").max().gt(0).unmask(0)
                .multiply(px_area).rename(str(y)))

    burn = ee.Image([burn_band(y) for y in burn_years]).reduceRegion(
        reducer=ee.Reducer.sum(), geometry=aoi, scale=500,
        maxPixels=1e9, bestEffort=True,
    )

    return ee.Dictionary({
        "area_m2": area_m2,
        "perimeter_m": perimeter_m,
        "lc": lc_hist,
        "canopy_m2": canopy_m2,
        "canopy_mean_h": canopy_mean_h,
        "burn": burn,
    })


def _estimate_carbon(plantable_trees, area_ha, crop):
    """Indicative annual volumes. These are planning figures from published
    averages, not a quantification — a real claim needs the census, the
    baseline and a verified kiln record."""
    residue_t = RESIDUE_T_PER_HA.get((crop or "other").lower(), RESIDUE_T_PER_HA["other"]) * area_ha
    removable_t = residue_t * REMOVABLE_RESIDUE_FRACTION
    biochar_t = removable_t * BIOCHAR_YIELD_FROM_RESIDUE
    return {
        "biochar": {
            "residue_t_per_season": round(residue_t, 2),
            "removable_t": round(removable_t, 2),
            "retained_t": round(residue_t - removable_t, 2),
            "biochar_t": round(biochar_t, 2),
            "tco2e_per_year": round(biochar_t * TCO2E_PER_T_BIOCHAR, 2),
            "note": (f"Only {int(REMOVABLE_RESIDUE_FRACTION * 100)}% of residue may leave the "
                     "field; the rest stays to maintain soil carbon input."),
        },
        "trees": {
            "plantable_trees": plantable_trees,
            "tco2e_per_year_at_maturity": round(plantable_trees * TCO2E_PER_TREE_YEAR, 2),
            "note": "Tree credits accrue from roughly year five; biochar pays from season one.",
        },
        "basis": "Indicative planning estimate from published averages, not a quantification.",
    }


@agri_bp.route("/screen", methods=["POST", "OPTIONS"])
def screen_parcel():
    """Fast eligibility screen for a single smallholder parcel."""
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if not _ensure_gee():
        return jsonify({"status": "error",
                        "message": "Analysis engine is still warming up. Try again in a moment."}), 503

    data = request.get_json(silent=True) or {}
    geojson = data.get("geojson")
    if not geojson:
        return jsonify({"status": "error", "message": "Missing geojson"}), 400
    crop = data.get("crop", "other")
    residue_today = data.get("residue_today")  # burn | sell | plough_back

    try:
        aoi = _aoi_from_geojson(geojson)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

    this_year = time.gmtime().tm_year
    burn_years = list(range(this_year - 5, this_year))

    started = time.time()
    try:
        raw = _build_request(aoi, burn_years).getInfo()   # the one round trip
    except Exception as e:
        logger.error("agri screen failed: %s", e)
        return jsonify({"status": "error", "message": f"Screening failed: {e}"}), 502
    elapsed = round(time.time() - started, 2)

    # ── Geometry ────────────────────────────────────────────────────────
    area_ha = round(float(raw.get("area_m2") or 0) / 10000, 3)
    perimeter_m = round(float(raw.get("perimeter_m") or 0), 1)
    if area_ha <= 0:
        return jsonify({"status": "error", "message": "Parcel has no area."}), 400

    # ── Land cover composition ──────────────────────────────────────────
    lc_raw = raw.get("lc") or {}
    total_px = sum(float(v) for v in lc_raw.values()) or 1
    lulc, eligible_pct = {}, 0.0
    for cid, key in DW_CLASSES.items():
        pct = float(lc_raw.get(str(cid), 0)) / total_px * 100
        if pct > 0:
            lulc[key] = round(pct, 1)
        if key in ELIGIBLE_DW:
            eligible_pct += pct
    eligible_pct = round(eligible_pct, 1)

    # ── Existing canopy — baseline, deliberately NOT creditable ─────────
    canopy_m2 = float(raw.get("canopy_m2") or 0)
    existing_trees = int(round(canopy_m2 / MEAN_CROWN_AREA_M2))
    existing = {
        "canopy_ha": round(canopy_m2 / 10000, 3),
        "canopy_pct": round(canopy_m2 / (area_ha * 10000) * 100, 1),
        "estimated_trees": existing_trees,
        "mean_height_m": round(float(raw.get("canopy_mean_h") or 0), 1),
        "creditable": False,
        "note": ("Baseline. VM0047 credits only trees planted by the project, so these "
                 "are excluded from the plantable count. Tree estimate is derived from "
                 "canopy area and is approximate."),
    }

    # ── Planting capacity: density ceiling vs. available bund ───────────
    density_cap = int(area_ha * CENSUS_MAX_TREES_PER_HA)
    bund_cap = int(perimeter_m / BUND_TREE_SPACING_M)
    plantable = max(0, min(density_cap, bund_cap))
    binding = "bund length" if bund_cap < density_cap else "density ceiling"

    # ── Burn history ────────────────────────────────────────────────────
    burn_raw = raw.get("burn") or {}
    burn_by_year = [{"year": y, "burn_ha": round(float(burn_raw.get(str(y)) or 0) / 10000, 2)}
                    for y in burn_years]
    seasons_burned = sum(1 for b in burn_by_year if b["burn_ha"] > 0)

    # ── Verdict ─────────────────────────────────────────────────────────
    reasons = []
    eligible = True
    if eligible_pct < 50:
        eligible = False
        reasons.append(f"Only {eligible_pct}% of the parcel is croppable land cover.")
    if plantable < 5:
        eligible = False
        reasons.append("Parcel is too small to carry a meaningful census planting.")
    if existing["canopy_pct"] > 50:
        eligible = False
        reasons.append("Parcel is already largely under canopy — this is not an ARR case.")
    if eligible:
        reasons.append(f"{eligible_pct}% croppable, {plantable} trees plantable "
                       f"(limited by {binding}).")

    # A parcel that is currently burned is the strongest biochar baseline.
    biochar_case = "strong" if (residue_today == "burn" or seasons_burned >= 2) else "moderate"

    return jsonify({
        "status": "success",
        "elapsed_s": elapsed,
        "verdict": {
            "eligible": eligible,
            "reasons": reasons,
            "approach": "census-based (VM0047 v1.1)",
            "biochar_case": biochar_case,
        },
        "parcel": {
            "area_ha": area_ha,
            "bund_length_m": perimeter_m,
            "eligible_land_pct": eligible_pct,
            "lulc_pct": lulc,
        },
        "planting": {
            "max_trees": plantable,
            "density_cap": density_cap,
            "bund_cap": bund_cap,
            "binding_constraint": binding,
            "max_per_ha": CENSUS_MAX_TREES_PER_HA,
            "spacing_m": BUND_TREE_SPACING_M,
        },
        "existing_trees": existing,
        "burn_history": {
            "years": burn_by_year,
            "seasons_burned": seasons_burned,
            "of_seasons": len(burn_years),
            "residue_today": residue_today,
        },
        "estimates": _estimate_carbon(plantable, area_ha, crop),
    }), 200
