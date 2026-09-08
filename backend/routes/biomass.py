"""
Biomass estimation — above- and below-ground carbon stock with a real
uncertainty deduction.

Three independent estimates of above-ground biomass density are computed over
the same polygon and reconciled into an ensemble:

  GEDI L4B      spaceborne lidar, 1 km gridded mean AGBD, carries its own
                published standard error
  ESA CCI v6    SAR retrieval (Sentinel-1 C-band + ALOS-2 L-band) at 100 m,
                also with a per-pixel standard error band
  CHM allometry Meta 1 m canopy height through a height-to-biomass power law

They are genuinely independent — lidar, radar, and optical/photogrammetric
height — so their spread measures structural model uncertainty, not just
sampling noise within one product. That spread is what makes the deduction
meaningful rather than decorative.

Accounting follows VCS/VM0047 and the IPCC defaults:

  AGB  -> carbon      x 0.47 carbon fraction (IPCC)
  AGB  -> BGB         x root-to-shoot ratio (IPCC, ecozone dependent)
  C    -> CO2e        x 44/12
  credit deduction    x (1 - UNC), UNC being the 90% confidence interval
                      expressed as a percentage of the mean, which is the
                      form VM0047 requires for the live-tree pool

The headline figure this endpoint returns is the DEDUCTED stock, not the
ensemble mean. Reporting the mean as if it were creditable is how remote
sensing over-credits.
"""
import logging
import math
import threading
import time

import ee
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
biomass_bp = Blueprint("biomass", __name__)

# ── Conversion factors ───────────────────────────────────────────────────
CARBON_FRACTION = 0.47        # IPCC default, dry biomass -> carbon
CO2_PER_C = 44.0 / 12.0       # 3.667
Z90 = 1.645                   # normal quantile for a 90% CI

# IPCC root-to-shoot ratios by broad ecozone. Selected from mean annual
# rainfall and canopy height rather than asked of the user, who will not know.
ROOT_SHOOT = {
    "tropical_moist": 0.24,
    "tropical_dry": 0.28,
    "tropical_shrub": 0.40,
    "subtropical": 0.27,
    "default": 0.26,
}

# Pantropical height-to-biomass power law, AGB = a * TCH^b (Asner & Mascaro
# style). A generalised form: it is the weakest of the three estimates and is
# flagged as such in the response, because real projects fit local allometry
# against field plots.
ALLOM_A = 3.836
ALLOM_B = 1.18

_gee_ready = False


def _init_gee():
    global _gee_ready
    from services.gee_init import init_gee as _shared_init
    if _shared_init():
        _gee_ready = True


threading.Thread(target=_init_gee, daemon=True).start()


def _ensure_gee():
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


def _strip_z(c):
    if not isinstance(c, list):
        return c
    if c and isinstance(c[0], (int, float)):
        return c[:2]
    return [_strip_z(x) for x in c]


def _aoi_from_geojson(gj):
    if not isinstance(gj, dict):
        raise ValueError("geojson must be an object")
    t = gj.get("type")
    if t == "FeatureCollection":
        feats = []
        for f in gj.get("features") or []:
            g = (f or {}).get("geometry") or {}
            if g.get("type") and "coordinates" in g:
                feats.append(ee.Feature(ee.Geometry({"type": g["type"],
                                                     "coordinates": _strip_z(g["coordinates"])})))
        if not feats:
            raise ValueError("No valid geometries in FeatureCollection")
        return ee.FeatureCollection(feats).geometry()
    if t == "Feature":
        g = gj.get("geometry") or {}
        return ee.Geometry({"type": g["type"], "coordinates": _strip_z(g["coordinates"])})
    return ee.Geometry({"type": t, "coordinates": _strip_z(gj["coordinates"])})


def _build_request(aoi):
    """Every statistic in one ee.Dictionary, fetched in a single round trip."""
    stats = {"area_m2": aoi.area(maxError=5)}

    # ── GEDI L4B: gridded mean AGBD with its own standard error ──────────
    try:
        gedi = ee.Image("LARSE/GEDI/GEDI04_B_002")
        stats["gedi"] = gedi.select(["MU", "SE"]).reduceRegion(
            reducer=ee.Reducer.mean(), geometry=aoi, scale=1000,
            maxPixels=1e9, bestEffort=True)
    except Exception as e:
        logger.warning("GEDI L4B unavailable: %s", e)

    # ── ESA CCI Biomass v6 (2022) with its standard error band ───────────
    cci = ee.Image("ESA/CCI/Above_Ground_Biomass/V6_0/2022")
    stats["cci"] = cci.select(["agb", "agb_sd"]).reduceRegion(
        reducer=ee.Reducer.mean(), geometry=aoi, scale=100,
        maxPixels=1e9, bestEffort=True)

    # ── Meta canopy height -> allometric AGB ─────────────────────────────
    # Reduced at 10 m rather than 1 m: the mean over a polygon is what the
    # allometry consumes, and scale=1 is the dominant cost in the CHM stack.
    chm = ee.ImageCollection(
        "projects/meta-forest-monitoring-okw37/assets/CanopyHeight").mosaic().clip(aoi)
    treed = chm.updateMask(chm.gt(2))
    stats["chm"] = treed.reduceRegion(
        reducer=ee.Reducer.mean().combine(ee.Reducer.stdDev(), sharedInputs=True)
                 .combine(ee.Reducer.percentile([95]), sharedInputs=True),
        geometry=aoi, scale=10, maxPixels=1e9, bestEffort=True)
    stats["canopy_m2"] = chm.gt(2).multiply(ee.Image.pixelArea()).reduceRegion(
        reducer=ee.Reducer.sum(), geometry=aoi, scale=10,
        maxPixels=1e9, bestEffort=True).values().get(0)

    # ── Height histogram, for the distribution chart ─────────────────────
    stats["chm_hist"] = treed.reduceRegion(
        reducer=ee.Reducer.fixedHistogram(0, 50, 25), geometry=aoi,
        scale=20, maxPixels=1e9, bestEffort=True).values().get(0)

    # ── Context used to choose a root-to-shoot ratio ─────────────────────
    stats["rain_mm"] = (ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                        .filterDate("2020-01-01", "2023-01-01").sum().divide(3)
                        .reduceRegion(reducer=ee.Reducer.mean(), geometry=aoi,
                                      scale=5000, maxPixels=1e9, bestEffort=True)
                        .values().get(0))
    return ee.Dictionary(stats)


def _pick_ecozone(rain_mm, mean_h):
    """IPCC ecozone class from rainfall and canopy height."""
    if rain_mm is None:
        return "default"
    if rain_mm >= 2000:
        return "tropical_moist"
    if rain_mm >= 1000:
        return "tropical_moist" if (mean_h or 0) >= 12 else "tropical_dry"
    if rain_mm >= 500:
        return "tropical_dry" if (mean_h or 0) >= 6 else "tropical_shrub"
    return "tropical_shrub"


@biomass_bp.route("/estimate", methods=["POST", "OPTIONS"])
def estimate_biomass():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if not _ensure_gee():
        return jsonify({"status": "error",
                        "message": "Analysis engine is still warming up. Try again in a moment."}), 503

    body = request.get_json(silent=True) or {}
    gj = body.get("geojson")
    if not gj:
        return jsonify({"status": "error", "message": "Missing geojson"}), 400

    try:
        aoi = _aoi_from_geojson(gj)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

    started = time.time()
    try:
        raw = _build_request(aoi).getInfo()
    except Exception as e:
        logger.error("biomass estimate failed: %s", e)
        return jsonify({"status": "error", "message": f"Estimation failed: {e}"}), 502
    elapsed = round(time.time() - started, 2)

    area_ha = round(float(raw.get("area_m2") or 0) / 10000, 2)
    if area_ha <= 0:
        return jsonify({"status": "error", "message": "Polygon has no area."}), 400

    canopy_ha = round(float(raw.get("canopy_m2") or 0) / 10000, 2)
    canopy_pct = round(canopy_ha / area_ha * 100, 1) if area_ha else 0.0

    chm = raw.get("chm") or {}
    def _chm(suffix):
        for kk, v in chm.items():
            if kk.endswith(suffix):
                return None if v is None else float(v)
        return None
    mean_h = _chm("_mean")
    sd_h = _chm("_stdDev")
    p95_h = _chm("_p95")

    rain_mm = float(raw.get("rain_mm") or 0) or None
    ecozone = _pick_ecozone(rain_mm, mean_h)
    r2s = ROOT_SHOOT[ecozone]

    # ── The three independent estimates ──────────────────────────────────
    sources = []

    gedi = raw.get("gedi") or {}
    g_mu, g_se = gedi.get("MU"), gedi.get("SE")
    if g_mu is not None and float(g_mu) > 0:
        sources.append({
            "id": "gedi_l4b", "name": "GEDI L4B",
            "sensor": "Spaceborne lidar, 1 km gridded",
            "agb_t_ha": round(float(g_mu), 1),
            "se_t_ha": round(float(g_se), 1) if g_se is not None else None,
            "note": "Mission weeks 19–223 (2019–2023). Published standard error.",
        })

    cci = raw.get("cci") or {}
    # CCI publishes a per-pixel standard deviation rather than a standard error.
    c_agb, c_se = cci.get("agb"), cci.get("agb_sd")
    if c_agb is not None and float(c_agb) > 0:
        sources.append({
            "id": "esa_cci", "name": "ESA CCI Biomass v6",
            "sensor": "SAR — Sentinel-1 C-band + ALOS-2 L-band, 100 m",
            "agb_t_ha": round(float(c_agb), 1),
            "se_t_ha": round(float(c_se), 1) if c_se is not None else None,
            "note": "2022 epoch, BIOMASAR retrieval. Error term is a per-pixel standard deviation.",
        })

    if mean_h and mean_h > 0:
        allom = ALLOM_A * (mean_h ** ALLOM_B)
        sources.append({
            "id": "chm_allometry", "name": "CHM allometry",
            "sensor": "Meta canopy height 1 m",
            "agb_t_ha": round(allom, 1),
            "se_t_ha": None,
            "note": (f"AGB = {ALLOM_A} x H^{ALLOM_B} on mean canopy height {round(mean_h, 1)} m. "
                     "Generalised pantropical form — replace with locally fitted allometry "
                     "before this figure is used for issuance."),
        })

    if not sources:
        return jsonify({"status": "error",
                        "message": ("No biomass source returned data for this polygon. "
                                    "It may be non-forest, or outside GEDI coverage (51°N–51°S).")}), 422

    # ── Ensemble and uncertainty ─────────────────────────────────────────
    vals = [s["agb_t_ha"] for s in sources]
    n = len(vals)
    mean_agb = sum(vals) / n

    # Between-source spread — structural disagreement between independent
    # retrievals, and usually the dominant term.
    between_sd = math.sqrt(sum((v - mean_agb) ** 2 for v in vals) / (n - 1)) if n > 1 else 0.0

    # Within-source error, averaged over sources that publish one.
    within = [s["se_t_ha"] for s in sources if s["se_t_ha"] is not None]
    within_se = (sum(w ** 2 for w in within) / len(within)) ** 0.5 if within else 0.0

    combined_se = math.sqrt((between_sd ** 2) / n + (within_se ** 2) / max(1, len(within) or 1))
    ci90 = Z90 * combined_se
    unc_pct = (ci90 / mean_agb * 100) if mean_agb > 0 else 100.0
    unc_pct = min(unc_pct, 100.0)

    # VM0047 applies (1 - UNC) to the woody biomass pool.
    deduction = unc_pct / 100.0
    agb_deducted = mean_agb * (1 - deduction)

    def _pool(agb_t_ha):
        bgb = agb_t_ha * r2s
        c = (agb_t_ha + bgb) * CARBON_FRACTION
        return {
            "agb_t_ha": round(agb_t_ha, 1),
            "bgb_t_ha": round(bgb, 1),
            "carbon_tc_ha": round(c, 1),
            "tco2e_per_ha": round(c * CO2_PER_C, 1),
            "total_tco2e": round(c * CO2_PER_C * area_ha),
        }

    gross = _pool(mean_agb)
    net = _pool(agb_deducted)

    # ── Height distribution ──────────────────────────────────────────────
    hist = []
    for row in (raw.get("chm_hist") or []):
        try:
            lo, count = float(row[0]), float(row[1])
            if count > 0:
                hist.append({"height_m": round(lo, 1), "pixels": int(count)})
        except (TypeError, IndexError, ValueError):
            continue

    if unc_pct < 10:
        band = "low"
    elif unc_pct < 20:
        band = "moderate"
    elif unc_pct < 35:
        band = "high"
    else:
        band = "very high"

    return jsonify({
        "status": "success",
        "elapsed_s": elapsed,
        "area": {"area_ha": area_ha, "canopy_ha": canopy_ha, "canopy_pct": canopy_pct},
        "canopy": {
            "mean_height_m": round(mean_h, 1) if mean_h else None,
            "sd_height_m": round(sd_h, 1) if sd_h else None,
            "p95_height_m": round(p95_h, 1) if p95_h else None,
            "histogram": hist,
        },
        "sources": sources,
        "ensemble": {
            "mean_agb_t_ha": round(mean_agb, 1),
            "between_source_sd": round(between_sd, 1),
            "within_source_se": round(within_se, 1),
            "combined_se": round(combined_se, 2),
            "ci90_half_width": round(ci90, 1),
            "uncertainty_pct": round(unc_pct, 1),
            "uncertainty_band": band,
            "sources_used": n,
        },
        "gross": gross,
        "net": net,
        "accounting": {
            "carbon_fraction": CARBON_FRACTION,
            "root_to_shoot": r2s,
            "ecozone": ecozone,
            "mean_annual_rainfall_mm": round(rain_mm) if rain_mm else None,
            "co2_per_c": round(CO2_PER_C, 3),
            "deduction_applied_pct": round(unc_pct, 1),
            "basis": ("VM0047 applies (1 - UNC) to the woody biomass pool, with UNC the 90% "
                      "confidence interval as a percentage of the mean. The creditable figure "
                      "is the deducted one, not the ensemble mean."),
        },
    }), 200
