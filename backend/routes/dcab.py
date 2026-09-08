"""
DCAB — Dynamic Carbon Accounting Baseline.

Implements the dynamic performance benchmark that Verra VM0047 v1.1 makes
mandatory for the area-based approach: instead of a baseline negotiated once
at validation and then frozen for a decade, the counterfactual is re-derived
from what comparable land actually did over the same period.

The procedure follows VM0047 and the published Pachama approach:

  1. Donor pool   — a ring around the project (Pachama searches a 100 km
                    buffer), excluding the project itself and a leakage belt
                    so the project cannot be matched against its own edge.
  2. Stocking index — NDFI, the index VM0047 names, from a Sentinel-2
                    spectral mixture analysis. NDFI separates green
                    vegetation from bare soil and dead material, so it tracks
                    degradation that NDVI saturates through.
  3. Matching     — each candidate carries the stocking index at three time
                    points before the project start, plus elevation and
                    slope. Candidates are matched to the project by k-nearest
                    neighbour on standardised Euclidean distance.
  4. Benchmark    — ordinary least squares through the project series and
                    through the matched control series over the crediting
                    period; the contrast of the two slopes IS the benchmark.
                    Project slope above control slope is the additional
                    signal.

Matching and regression run in Python on small arrays rather than server-side
in Earth Engine: the whole donor pool is fetched in a single sampled call, so
the expensive part is one round trip rather than a per-candidate loop.
"""
import logging
import math
import threading
import time

import ee
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
dcab_bp = Blueprint("dcab", __name__)

# ── Defaults ─────────────────────────────────────────────────────────────
DEFAULT_BUFFER_KM = 25.0      # donor-pool search radius
DEFAULT_EXCLUSION_KM = 2.0    # leakage belt excluded from the donor pool
DEFAULT_K = 20                # matched controls retained
DEFAULT_CANDIDATES = 300      # candidate points sampled from the donor pool
MATCH_SCALE_M = 100           # Pachama matches at 100 m
PRE_YEARS = 3                 # SI time points before start used for matching

# Sentinel-2 endmembers for spectral unmixing (Souza et al. / CLASlite),
# on B2 B3 B4 B8 B11 B12 at native 0-10000 scaling.
ENDMEMBERS = {
    "gv":    [500, 900, 400, 6100, 3000, 1000],
    "npv":   [1400, 1700, 2200, 3000, 5500, 3000],
    "soil":  [2000, 3000, 3400, 5800, 6000, 5800],
    "shade": [0, 0, 0, 0, 0, 0],
}
SMA_BANDS = ["B2", "B3", "B4", "B8", "B11", "B12"]

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


def _ndfi_for_year(year, region):
    """Annual NDFI from a Sentinel-2 median composite.

    NDFI = (GVshade - NPV - Soil) / (GVshade + NPV + Soil), where GV is
    shade-normalised. Ranges from about -1 (bare) to +1 (intact canopy).
    """
    col = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
           .filterBounds(region)
           .filterDate(f"{year}-01-01", f"{year}-12-31")
           .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 40)))
    img = col.median().select(SMA_BANDS)
    frac = img.unmix(
        [ENDMEMBERS["gv"], ENDMEMBERS["npv"], ENDMEMBERS["soil"], ENDMEMBERS["shade"]],
        True, True,
    ).rename(["gv", "npv", "soil", "shade"])
    gv_shade = frac.select("gv").divide(ee.Image(1).subtract(frac.select("shade")))
    npv_soil = frac.select("npv").add(frac.select("soil"))
    ndfi = (gv_shade.subtract(npv_soil)
            .divide(gv_shade.add(npv_soil).add(1e-6))
            .rename(f"si_{year}"))
    return ndfi.unmask(0)


def _covariate_image(years, region):
    """Stocking index per year plus terrain, as one multi-band image."""
    bands = [_ndfi_for_year(y, region) for y in years]
    glo = ee.ImageCollection("COPERNICUS/DEM/GLO30").select("DEM")
    dem = glo.mosaic().setDefaultProjection(glo.first().projection())
    bands.append(dem.rename("elevation").unmask(0))
    bands.append(ee.Terrain.slope(dem).rename("slope").unmask(0))
    return ee.Image.cat(bands)


# ── Small statistics helpers (arrays here are tens of points) ────────────
def _ols_slope(xs, ys):
    """Least-squares slope and intercept of y on x."""
    n = len(xs)
    if n < 2:
        return 0.0, (ys[0] if ys else 0.0)
    mx = sum(xs) / n
    my = sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    if sxx == 0:
        return 0.0, my
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    slope = sxy / sxx
    return slope, my - slope * mx


def _stdev(vals):
    n = len(vals)
    if n < 2:
        return 0.0
    m = sum(vals) / n
    return math.sqrt(sum((v - m) ** 2 for v in vals) / (n - 1))


@dcab_bp.route("/run", methods=["POST", "OPTIONS"])
def run_dcab():
    """Build a dynamic baseline for a project polygon."""
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
        start_year = int(body.get("project_start_year") or 0)
    except (TypeError, ValueError):
        start_year = 0
    if not start_year:
        return jsonify({"status": "error", "message": "project_start_year is required"}), 400

    buffer_km = float(body.get("buffer_km") or DEFAULT_BUFFER_KM)
    k = max(1, int(body.get("k") or DEFAULT_K))
    n_candidates = max(50, min(600, int(body.get("candidates") or DEFAULT_CANDIDATES)))

    this_year = time.gmtime().tm_year
    first_year = max(2018, start_year - PRE_YEARS)      # Sentinel-2 SR begins 2017
    years = list(range(first_year, this_year))
    pre_years = [y for y in years if y < start_year]
    post_years = [y for y in years if y >= start_year]

    if len(pre_years) < 2:
        return jsonify({"status": "error",
                        "message": (f"Need at least two pre-project years of Sentinel-2 data. "
                                    f"With a {start_year} start only {len(pre_years)} are available "
                                    f"(imagery begins 2018).")}), 400
    if len(post_years) < 2:
        return jsonify({"status": "error",
                        "message": "Need at least two years since the project start to measure a trend."}), 400

    try:
        aoi = _aoi_from_geojson(gj)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

    # ── Donor pool: ring around the project, leakage belt removed ────────
    outer = aoi.buffer(buffer_km * 1000)
    inner = aoi.buffer(DEFAULT_EXCLUSION_KM * 1000)
    donor = outer.difference(inner, maxError=50)

    covar = _covariate_image(years, outer)

    started = time.time()
    try:
        project_stats = covar.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=aoi,
            scale=MATCH_SCALE_M, maxPixels=1e9, bestEffort=True)
        candidates = covar.sample(
            region=donor, scale=MATCH_SCALE_M, numPixels=n_candidates,
            geometries=True, seed=42, dropNulls=True)
        payload = ee.Dictionary({
            "project": project_stats,
            "candidates": candidates.toList(n_candidates),
            "area_ha": aoi.area(maxError=5).divide(10000),
        }).getInfo()
    except Exception as e:
        logger.error("dcab run failed: %s", e)
        return jsonify({"status": "error", "message": f"Baseline run failed: {e}"}), 502
    elapsed = round(time.time() - started, 2)

    proj = payload.get("project") or {}
    proj_si = {y: proj.get(f"si_{y}") for y in years}
    if any(proj_si[y] is None for y in pre_years):
        return jsonify({"status": "error",
                        "message": "Could not compute the stocking index over the project area."}), 502

    # ── Matching covariates: SI at the pre-project time points + terrain ──
    match_keys = [f"si_{y}" for y in pre_years[-PRE_YEARS:]] + ["elevation", "slope"]
    proj_vec = [float(proj.get(kk) or 0) for kk in match_keys]

    raw = []
    for feat in payload.get("candidates") or []:
        p = (feat or {}).get("properties") or {}
        if any(p.get(kk) is None for kk in match_keys):
            continue
        if any(p.get(f"si_{y}") is None for y in years):
            continue
        coords = ((feat.get("geometry") or {}).get("coordinates")) or [None, None]
        raw.append({"props": p, "lon": coords[0], "lat": coords[1]})

    if len(raw) < k:
        return jsonify({"status": "error",
                        "message": (f"Only {len(raw)} usable control candidates in a {buffer_km:g} km "
                                    f"radius; {k} required. Try a larger search radius.")}), 422

    # Standardise each covariate so elevation (metres) cannot dominate the
    # stocking index (a ratio) purely through its scale.
    scales = {}
    for i, kk in enumerate(match_keys):
        sd = _stdev([float(r["props"][kk]) for r in raw])
        scales[kk] = sd if sd > 1e-9 else 1.0

    for r in raw:
        d2 = 0.0
        for i, kk in enumerate(match_keys):
            d2 += ((float(r["props"][kk]) - proj_vec[i]) / scales[kk]) ** 2
        r["distance"] = math.sqrt(d2)

    raw.sort(key=lambda r: r["distance"])
    matched = raw[:k]

    # ── Series: project vs matched-control mean, per year ────────────────
    series = []
    for y in years:
        ctrl_vals = [float(m["props"][f"si_{y}"]) for m in matched]
        series.append({
            "year": y,
            "project_si": round(float(proj_si[y] or 0), 4),
            "control_si": round(sum(ctrl_vals) / len(ctrl_vals), 4),
            "control_sd": round(_stdev(ctrl_vals), 4),
            "period": "baseline" if y < start_year else "crediting",
        })

    # ── The benchmark: contrast of the two OLS slopes ────────────────────
    post = [s for s in series if s["period"] == "crediting"]
    xs = [s["year"] for s in post]
    p_slope, _ = _ols_slope(xs, [s["project_si"] for s in post])
    c_slope, _ = _ols_slope(xs, [s["control_si"] for s in post])
    benchmark = p_slope - c_slope

    pre = [s for s in series if s["period"] == "baseline"]
    pre_gap = (sum(s["project_si"] - s["control_si"] for s in pre) / len(pre)) if pre else 0.0

    # ── Match quality ────────────────────────────────────────────────────
    dists = [m["distance"] for m in matched]
    pre_bias = abs(pre_gap)
    quality = "strong" if pre_bias < 0.02 else "moderate" if pre_bias < 0.05 else "weak"

    # ── Verdict ──────────────────────────────────────────────────────────
    additional = benchmark > 0
    if abs(benchmark) < 0.002:
        verdict = "Project is tracking its control area — no additional signal yet."
    elif additional:
        verdict = ("Project is gaining stocking faster than comparable land — "
                   "an additional signal over the dynamic baseline.")
    else:
        verdict = ("Comparable land is outperforming the project — the crediting "
                   "baseline would absorb these gains.")

    return jsonify({
        "status": "success",
        "elapsed_s": elapsed,
        "config": {
            "project_start_year": start_year,
            "buffer_km": buffer_km,
            "exclusion_km": DEFAULT_EXCLUSION_KM,
            "k": k,
            "candidates_sampled": len(payload.get("candidates") or []),
            "candidates_usable": len(raw),
            "match_scale_m": MATCH_SCALE_M,
            "stocking_index": "NDFI (Sentinel-2 spectral mixture analysis)",
            "match_covariates": match_keys,
        },
        "project": {
            "area_ha": round(float(payload.get("area_ha") or 0), 2),
            "baseline_years": pre_years,
            "crediting_years": post_years,
        },
        "series": series,
        "benchmark": {
            "project_slope": round(p_slope, 5),
            "control_slope": round(c_slope, 5),
            "benchmark": round(benchmark, 5),
            "units": "stocking index per year",
            "additional": additional,
            "verdict": verdict,
        },
        "match_quality": {
            "pre_project_bias": round(pre_gap, 4),
            "rating": quality,
            "mean_distance": round(sum(dists) / len(dists), 4),
            "max_distance": round(max(dists), 4),
            "note": ("Pre-project bias is the mean stocking-index gap between project and "
                     "controls before the start date. Near zero means like was matched with "
                     "like; a large gap means the benchmark is carrying that difference."),
        },
        "controls": [
            {"lat": m["lat"], "lon": m["lon"], "distance": round(m["distance"], 4)}
            for m in matched
        ],
    }), 200
