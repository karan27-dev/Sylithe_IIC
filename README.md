# Sylithe IIC

**AI-Powered Monitoring of Agriculture & Agroforestry for Carbon Credit Verification**

A digital MRV (Measurement, Reporting & Verification) platform that decides whether land
can carry a carbon project, derives its baseline from comparable land observed by
satellite, and quantifies the carbon stock with an uncertainty deduction applied before
anything is called creditable.

```
                          ┌──────────────────────────┐
   KML / SHP / GeoJSON ──▶│                          │
   Farmer bund polygon ──▶│      Sylithe dMRV        │──▶ Creditable tCO₂e
   Drone / satellite   ──▶│                          │    + evidence trail
   scene                  └──────────────────────────┘
```

---

## Table of contents

- [The problem](#the-problem)
- [Design principles](#design-principles)
- [System architecture](#system-architecture)
- [The verification pipeline](#the-verification-pipeline)
- [Subsystems](#subsystems)
  - [1. Parcel screening](#1-parcel-screening--apiagriscreen)
  - [2. Dynamic baseline (DCAB)](#2-dynamic-baseline-dcab--apidcabrun)
  - [3. Biomass ensemble](#3-biomass-ensemble--apibiomassestimate)
  - [4. Sylithe CHM v2](#4-sylithe-chm-v2--apichminfer-image)
  - [5. Farmer enrolment](#5-farmer-enrolment)
- [Data layer](#data-layer)
- [Earth observation datasets](#earth-observation-datasets)
- [Performance engineering](#performance-engineering)
- [API reference](#api-reference)
- [Repository layout](#repository-layout)
- [Local setup](#local-setup)
- [Deploying the inference Space](#deploying-the-inference-space)
- [Methodology references](#methodology-references)
- [Provenance](#provenance)
- [Known limitations](#known-limitations)

---

## The problem

Agriculture is the largest carbon opportunity in India and the least verifiable.

| Failure | Why it happens |
|---|---|
| **Practices are self-declared** | Credits depend on whether a farmer went zero-till, skipped the burn, dried the paddy — none of which leaves a durable paper record |
| **Evidence expires** | A residue burn is visible for 7–21 days. Annual audits arrive long after the signal is gone |
| **Economics collapse at smallholder scale** | Verification cost is fixed per project; plots are 0.5–2 ha |
| **Baselines are frozen** | Negotiated once at validation and held for a decade while the surrounding landscape changes |
| **One number, no error bars** | A single remote-sensing estimate presented as fact, with no measure of how wrong it might be |

India's Carbon Credit Trading Scheme begins trading in 2026, and the BEE's approved
offset sectors include agroforestry, biochar and rice methane — so this becomes a
compliance problem, not only a voluntary-market one.

## Design principles

Four rules that decided most of the architecture.

**1 · Prove the event, don't assume it.**
Burn detection dates residue fires per parcel from NBR drop and thermal anomalies. A
biochar claim is only as good as the evidence that the residue was *not* burned.

**2 · Derive the baseline, don't negotiate it.**
The counterfactual comes from statistically matched control plots observed over the same
period, re-derived at every verification.

**3 · Disagreement is information, not noise.**
Where several independent measurements exist, their spread is reported and converted
into a deduction. A number that changes when you measure it differently is a number that
needs a caveat.

**4 · Never present the flattering figure.**
Headline values are post-deduction. Where the evidence does not support a claim, the
system returns zero rather than something defensible-looking.

---

## System architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│  BROWSER — React 19 · Vite · Tailwind · Leaflet · Recharts                  │
│                                                                            │
│  Role dashboards        Developer · Corporate · Investor · Government       │
│  Verification wizard    Eligibility → CHM → Baseline → Biomass → Reports    │
│  Geometry input         Draw on map · KML / SHP / GeoJSON import            │
│  Per-user caches        userStorage.js — scoped, cleared on logout          │
└───────────────────────────────┬────────────────────────────────────────────┘
                                │  JSON / multipart over HTTPS
                                │  JWT bearer, 7-day expiry
┌───────────────────────────────▼────────────────────────────────────────────┐
│  API — Flask, 14 blueprints                                                │
│                                                                            │
│   auth · projects · dev_projects · tree_inventory · admin · free_tier       │
│   reports · newsletter · analytics                                         │
│   ├── agri        POST /api/agri/screen        parcel eligibility           │
│   ├── dcab        POST /api/dcab/run           dynamic baseline             │
│   ├── biomass     POST /api/biomass/estimate   3-source carbon stock        │
│   ├── chm         POST /api/chm/predict        canopy height, LULC          │
│   │               POST /api/chm/land-history   multi-year land record       │
│   │               POST /api/chm/land-summary   AI diligence rating          │
│   └── chm_image   POST /api/chm/infer-image    Sylithe CHM v2               │
└───────┬──────────────────────┬─────────────────────┬───────────────────────┘
        │                      │                     │
┌───────▼────────┐   ┌─────────▼────────┐   ┌────────▼─────────────────────┐
│ Google Earth   │   │ MongoDB          │   │ Hugging Face Space (GPU)     │
│ Engine         │   │                  │   │                              │
│ 18 datasets    │   │ 11 collections   │   │ Meta CHMv2                   │
│ server-side    │   │ projects, trees, │   │ DINOv3 ViT-L/16 + DPT        │
│ reduction      │   │ users, quotas    │   │ gated weights, GPU inference │
└────────────────┘   └──────────────────┘   └──────────────────────────────┘
                                                       │
                                            ┌──────────▼─────────┐
                                            │ DeepSeek           │
                                            │ diligence narrative │
                                            │ + project rating    │
                                            └────────────────────┘
```

### Why the model is not in the API process

Meta CHMv2 is a ViT-L/16 behind a gated licence and wants a GPU. Embedding it in Flask
would put a 1.2 GB model and a CUDA dependency into a process whose job is request
routing, and would tie API deploys to model deploys. It lives behind an inference
endpoint; Flask stays a thin client that prepares geometry and converts predictions into
ground units.

---

## The verification pipeline

```
   ENTRY                    SCREENING                 BASELINE
   ┌──────────────┐         ┌──────────────┐          ┌──────────────┐
   │ Developer    │         │ Land cover   │          │ Donor pool   │
   │ uploads AOI  │────────▶│ Tree cover   │─────────▶│ k-NN match   │
   │              │         │ Burn history │          │ NDFI trend   │
   │ Farmer draws │         │ Capacity at  │          │ OLS slope    │
   │ a bund       │         │ ≤50 trees/ha │          │ contrast     │
   └──────────────┘         └──────────────┘          └──────┬───────┘
                                                             │
   REPORTING                QUANTIFICATION                   │
   ┌──────────────┐         ┌────────────────────────────┐   │
   │ Diligence    │◀────────│ GEDI L4B    ┐              │◀──┘
   │ PDF          │         │ ESA CCI v6  ├─ ensemble    │
   │ AI narrative │         │ CHM allom.  ┘      │       │
   │ AAA–D rating │         │                    ▼       │
   └──────────────┘         │        (1 − UNC) deduction │
                            │                    │       │
                            │                    ▼       │
                            │           CREDITABLE tCO₂e │
                            └────────────────────────────┘
```

Each stage can reject. A parcel that is 69% canopy is not an ARR case; a project whose
matched controls outperform it has no additional signal; a scene whose biomass sources
disagree fivefold yields zero creditable stock. **The pipeline is designed to say no.**

---

## Subsystems

### 1 · Parcel screening — `POST /api/agri/screen`

`backend/routes/agri.py` · 339 lines

Decides in about a second whether a smallholder parcel can carry a census-based
agroforestry project.

```
     parcel polygon
          │
          ├─▶ geometry ──────────▶ area, perimeter (= plantable bund length)
          ├─▶ Dynamic World ─────▶ land-cover composition, eligible fraction
          ├─▶ Meta CHM ──────────▶ existing canopy      ⚠ baseline, NOT creditable
          └─▶ MODIS MCD64A1 ─────▶ burn history, 5 seasons
                    │
                    ▼
     ┌──────────────────────────────────────────────┐
     │ plantable = min(area × 50/ha,                │
     │                 bund_length ÷ 5 m spacing)   │
     │ binding constraint is named in the response  │
     └──────────────────────────────────────────────┘
```

**Methodology encoded, not described.** VM0047's census approach caps planting at
**50 units/ha** — above that the activity is land-use change and needs the heavier
area-based approach. Only trees planted *by the project* are creditable, so existing
canopy is returned with `creditable: false` and can never leak into the count. Biochar
feedstock is capped at **40% of residue**, because removing all of it lowers soil carbon
input and over-credits against the soil pool.

Verified behaviour:

| Parcel | Result |
|---|---|
| Maharashtra cropland | ✅ 98.7% croppable, 257 trees, bund-limited |
| Western Ghats forest | ❌ 69.4% canopy — *"not an ARR case"* |
| Ludhiana built-up | ❌ 0% croppable |
| Punjab rice farmland | ✅ eligible, **burned 5 of 5 seasons** → strong biochar baseline |

### 2 · Dynamic baseline (DCAB) — `POST /api/dcab/run`

`backend/routes/dcab.py` · 363 lines

The dynamic performance benchmark VM0047 v1.1 makes mandatory for the area-based
approach. The counterfactual is re-derived from what comparable land actually did.

```
  ┌─ project ─┐
  │           │      donor pool = ring(radius) − ring(2 km leakage belt)
  │    ███    │      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  │    ███    │      ░  ·  ·   ·  ·    ·   ·  ·   ·  ░   ← candidate plots
  └───────────┘      ░    ·  ·   ·   ·  ·    ·   ·   ░
                     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   1. Stocking index — NDFI from Sentinel-2 spectral unmixing (GV / NPV / soil / shade)
   2. Match on SI at three pre-project time points + elevation + slope
   3. k-NN on STANDARDISED Euclidean distance
   4. OLS through project and control series over the crediting period
   5. benchmark = project slope − control slope
```

**Why NDFI and not NDVI.** VM0047 names NDFI. It separates green vegetation from bare
soil and non-photosynthetic material, so it tracks degradation that NDVI saturates
straight through.

**Why covariates are standardised.** Elevation in metres and a ratio bounded at 1 cannot
share a distance metric untransformed — elevation would dominate the match entirely.

**Pre-project bias is reported as a match-quality rating.** If project and controls
already differed *before* the start date, the benchmark carries that difference rather
than measuring project effect. Most tools hide this.

Live result — 470 ha Western Ghats plot, 2021 start:

```
project slope    0.01016
control slope    0.01251
BENCHMARK       −0.00235      additional: No
match quality    strong (pre-project bias −0.012)
26.3 s · 300 candidates · 20 matched controls
```

It returned *not additional*. That is the algorithm working.

### 3 · Biomass ensemble — `POST /api/biomass/estimate`

`backend/routes/biomass.py` · 359 lines

Three independent retrievals over the same polygon, reconciled with a real deduction.

```
   GEDI L4B          spaceborne lidar, 1 km gridded, published SE
   ESA CCI v6        SAR — Sentinel-1 C-band + ALOS-2 L-band, 100 m
   CHM allometry     Meta 1 m canopy height, AGB = 3.836 · H^1.18
        │
        ├── between-source SD ──┐
        ├── within-source SE  ──┼──▶ combined SE ──▶ 90% CI ──▶ UNC %
        └── ensemble mean ──────┘                                 │
                    │                                             ▼
                    └──────────────────────────▶ × (1 − UNC) ──▶ CREDITABLE
```

They rest on **different physics** — lidar, radar, photogrammetric height — so their
spread measures structural model uncertainty rather than noise inside one product. That
is what makes the deduction meaningful.

```
carbon fraction   0.47                     IPCC
root-to-shoot     ecozone-selected         IPCC, from rainfall + canopy height
CO₂e              C × 44/12
deduction         (1 − UNC), UNC = 90% CI as % of mean    VM0047 live-tree pool
```

| Plot | Sources | Uncertainty | Gross | Creditable |
|---|---|---|---|---|
| Western Ghats forest | 28.7 / 39.9 / 42.9 t/ha | 42.4% | 37,372 tCO₂e | **21,509** |
| Punjab cropland | 5.2 / 24.4 t/ha (fivefold disagreement) | saturated | — | **0** |

Returning zero for cropland is the correct answer, and the deduction reaches it unaided.

### 4 · Sylithe CHM v2 — `POST /api/chm/infer-image`

`backend/routes/chm_image.py` · 311 lines · Space in `backend/hf_space/`

Canopy height from a dropped drone or satellite scene, predicted at **every resolution
the capture supports** and compared.

```
   capture 10 cm/px                    ladder = rungs ≥ capture
        │
        ├──▶ 10 cm   2000×2000 px  ┐
        ├──▶ 20 cm   1000×1000 px  ├─  same 200 × 200 m of ground
        ├──▶ 50 cm     400×400 px  │   throughout
        └──▶  1 m      200×200 px  ┘
```

| Capture | Predicts at |
|---|---|
| 3 cm / 10 cm | 10 · 20 · 50 cm · 1 m |
| 20 cm | 20 · 50 cm · 1 m |
| 50 cm | 50 cm · 1 m |

**Resampling is the substantive step, not a convenience.** CHMv2 is trained on satellite
imagery near 1 m, so a 3 cm drone mosaic is far outside its training distribution — at
that scale individual leaves fill the receptive field. Downsampling with LANCZOS
*integrates* the merged pixels, synthesising what a coarser sensor would have recorded.

The model's processor sets `do_resize: false` and only pads to a multiple of 16, so the
image reaches the ViT at its own pixel size. **Nothing downstream washes out the
resolution choice** — which is what makes the ladder meaningful rather than cosmetic.

Two things the endpoint refuses rather than fudges:

- **Upsampling.** 50 cm → 20 cm would invent ground detail that was never observed.
- **Distorting aspect ratio.** A scene too small at the chosen target is refused with its
  real dimensions, instead of being padded square and then reported as covering land it
  does not.

**Why compare at all.** If canopy cover swings between 10 cm and 1 m, the figure is a
property of the resolution it was measured at, not of the trees. Agreement across scales
is the evidence that a number is real, and the UI leads with that spread.

### 5 · Farmer enrolment

`frontend/src/pages/dashboards/FarmerEnrolSection.jsx` · 421 lines

Project Management asks **who is adding land** — Project Developer (the full wizard) or
Farmer (a three-step path).

```
  Step 1  name · mobile · village · district · state
          land record no. · tenure · current crop
          ▸ what happens to the residue after harvest   ← sets the biochar baseline
  Step 2  boundary — KML / GeoJSON / shapefile
  Step 3  screened through /api/agri/screen; only an eligible parcel enrols
```

The residue question is the one everyone forgets. *"I burn it"* is the strongest possible
biochar baseline, and the UI says so.

**Structural note.** The FPO is the project proponent on the registry; the farmer is a
participant. A smallholder cannot carry per-project validation cost, and the registry
requires a proponent with demonstrable land tenure.

---

## Data layer

MongoDB, 11 collections:

```
users · otp_tokens · access_requests          identity, auth, gating
developer_projects · dev_activity             projects and audit trail
tree_inventory                                per-tree census records
projects_cache                                scraped registry projects
free_scans · feature_usage · lulc_reports     quota accounting
newsletter
```

**Per-user cache scoping.** Dashboard caches are keyed by account
(`frontend/src/lib/userStorage.js`) and cleared on logout. These caches exist only so the
UI paints before the API responds — MongoDB is the source of truth — but an unscoped
cache showed one user's project list to the next person on a shared browser.

---

## Earth observation datasets

18 datasets, all reduced server-side in Earth Engine.

| Domain | Dataset |
|---|---|
| Land cover | Dynamic World V1 · ESA WorldCover v200 · JRC GFC2020 V3 |
| Canopy | Meta Canopy Height (1 m) · Meta CHMv2 via DINOv3 |
| Biomass | GEDI L4B · ESA CCI Biomass V6 (2022) · NASA/ORNL biomass carbon density |
| Change | Hansen GFC 2025 v1.13 (2023 v1.11 fallback) |
| Fire | MODIS MCD64A1 · VIIRS DNB |
| Optical | Sentinel-2 SR Harmonized |
| Climate | CHIRPS daily |
| Terrain | Copernicus DEM GLO-30 |
| Soil | OpenLandMap organic carbon |
| Context | JRC GHSL population · JRC Global Surface Water · WCMC WDPA |

---

## Performance engineering

Earth Engine cost is dominated by **round trips**, not computation. Every `getInfo()` is
a network call.

**One round trip per request.** Statistics are assembled into a single `ee.Dictionary`
and fetched once, rather than a `getInfo()` per metric.

**No tile generation on hot paths.** `getMapId()` is a large share of the cost in the
full CHM pipeline and nothing in screening needs a rendered layer.

**Reduce at the scale the answer needs.** The 1 m canopy model is reduced at 5–10 m where
only a polygon mean is consumed. `scale=1` is the single most expensive operation in the
stack.

**Match and regress in Python.** DCAB fetches the whole donor pool in one sampled call,
then does k-NN and OLS locally on small arrays instead of per-candidate server-side calls.

Measured:

| Operation | Time |
|---|---|
| `/api/chm/land-history` (pre-existing) | ~115 s |
| `/api/agri/screen` — clean parcel | **1.2 s** |
| `/api/agri/screen` — 5 seasons of burn data | 10.8 s |
| `/api/biomass/estimate` | **0.6–0.9 s** |
| `/api/dcab/run` — 300 candidates, 470 ha | 26 s |
| CHM v2 inference — 320×240 on ZeroGPU | 3.7 s |

A ~95× improvement on the interactive path is what makes a farmer drawing a boundary on
a phone viable.

---

## API reference

### `POST /api/agri/screen`
```jsonc
// request
{ "geojson": { … }, "crop": "rice", "residue_today": "burn" }

// response (abridged)
{ "status": "success", "elapsed_s": 1.22,
  "verdict":  { "eligible": true, "approach": "census-based (VM0047 v1.1)",
                "biochar_case": "strong", "reasons": [ … ] },
  "parcel":   { "area_ha": 14.9, "bund_length_m": 1543.6, "eligible_land_pct": 100 },
  "planting": { "max_trees": 308, "density_cap": 745, "bund_cap": 308,
                "binding_constraint": "bund length", "max_per_ha": 50 },
  "existing_trees": { "estimated_trees": 76, "creditable": false },
  "burn_history":   { "seasons_burned": 5, "of_seasons": 5 },
  "estimates":      { "biochar": { … }, "trees": { … } } }
```

### `POST /api/dcab/run`
```jsonc
{ "geojson": { … }, "project_start_year": 2021, "buffer_km": 25, "k": 20 }
→ { "series": [ { "year", "project_si", "control_si", "control_sd", "period" } ],
    "benchmark": { "project_slope", "control_slope", "benchmark", "additional" },
    "match_quality": { "pre_project_bias", "rating" },
    "controls": [ { "lat", "lon", "distance" } ] }
```

### `POST /api/biomass/estimate`
```jsonc
{ "geojson": { … } }
→ { "sources":  [ { "id", "name", "sensor", "agb_t_ha", "se_t_ha" } ],
    "ensemble": { "mean_agb_t_ha", "uncertainty_pct", "uncertainty_band" },
    "gross":    { "tco2e_per_ha", "total_tco2e" },
    "net":      { "tco2e_per_ha", "total_tco2e" },   // ← creditable
    "accounting": { "carbon_fraction", "root_to_shoot", "ecozone" } }
```

### `POST /api/chm/infer-image` · multipart
```
image             file
source_gsd_cm     capture resolution
target_gsd_cm     10 | 20 | 50 | 100
→ { "model": "Sylithe CHM v2", "base_model": "facebook/dinov3-vitl16-chmv2-dpt-head",
    "ground": { "input_px", "ground_coverage_m", "resampled" },
    "stats":  { "mean_height_m", "max_height_m", "canopy_pixels" },
    "derived": { "canopy_pct", "estimated_trees" },
    "height_map_png": "<base64>" }
```

Other blueprints: `auth` · `projects` · `dev_projects` · `tree_inventory` · `admin` ·
`free_tier` · `reports` · `analytics` · `newsletter`.

---

## Repository layout

```
Sylithe_IIC/
├── backend/                        Flask · Earth Engine · MongoDB   (~6.0k LOC)
│   ├── app.py                      14 blueprints
│   ├── config.py                   env-only secrets
│   ├── db.py                       collections + indexes
│   ├── routes/
│   │   ├── agri.py                 parcel screening
│   │   ├── dcab.py                 dynamic baseline
│   │   ├── biomass.py              3-source ensemble
│   │   ├── chm_image.py            Sylithe CHM v2 client
│   │   ├── chm.py                  canopy height, LULC, land history, AI
│   │   └── …                       auth, projects, admin, reports, quotas
│   ├── services/                   gee_init · registry scraper · email
│   └── hf_space/                   GPU inference Space (app.py, requirements)
│
└── frontend/                       React 19 · Vite · Tailwind
    ├── src/pages/dashboards/       role dashboards + verification screens
    ├── src/components/chm/         map, sidebar, CHM v2 panels
    ├── src/services/               typed API clients
    └── src/lib/userStorage.js      per-user cache scoping
```

---

## Local setup

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # MONGO_URI, JWT_SECRET, DEEPSEEK_API_KEY, GEE credentials
python app.py             # http://localhost:5001
```

Earth Engine credentials are required for all satellite analysis — see
[`backend/README_GEE_SETUP.md`](backend/README_GEE_SETUP.md).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # sets VITE_API_URL
npm run dev               # http://localhost:5173
```

> **`VITE_API_URL` is required.** Without it every `fetch()` resolves to `undefined/api/…`
> and the UI reports *"Could not connect to server."* Vite reads `.env` only at startup,
> so restart the dev server after changing it.

```bash
curl http://127.0.0.1:5001/health     # {"status":"ok"}
```

## Deploying the inference Space

1. **Accept the licence** on `facebook/dinov3-vitl16-chmv2-dpt-head` — the weights are
   gated and `from_pretrained` returns 401 without it.
2. **Create a Gradio Space.** CPU basic is workable because callers resample to a few
   hundred pixels a side; a GPU only helps at full mosaic scale.
3. **Upload** `backend/hf_space/{app.py,requirements.txt,README.md}`.
4. **Add the `HF_TOKEN` secret** (read scope is sufficient — the Space only downloads).
5. **Point the backend at it:**
   ```
   CHM_INFERENCE_URL=https://<user>-<space>.hf.space    # base URL, no path
   ```
   Gradio 5+ serves its REST API under `/gradio_api`; the backend appends
   `/call/predict` and handles the two-step event-stream protocol.

Without `CHM_INFERENCE_URL` the endpoint reports that inference is not configured and
returns the prepared image geometry. **It never fabricates a height map.**

---

## Methodology references

| Standard | Used for |
|---|---|
| **Verra VM0047 v1.1** — ARR | Census approach (≤50 units/ha), dynamic performance benchmark, `(1 − UNC)` deduction, NDFI stocking index |
| **Verra VM0042** — agricultural land management | Soil carbon pool, residue-removal constraint |
| **IPCC** | Carbon fraction 0.47, ecozone root-to-shoot ratios |
| **BEE CCTS** | India offset sectors — agroforestry, biochar, rice methane |

## Provenance

The platform this builds on — `frontend/`, the backend core, LULC, canopy height and
reporting — is prior work by the Sylithe team. Built for this challenge:

```
backend/routes/agri.py                    339    parcel screening
backend/routes/dcab.py                    363    dynamic baseline
backend/routes/biomass.py                 359    biomass ensemble
backend/routes/chm_image.py               311    CHM v2 client
backend/hf_space/                          ~90    GPU inference Space
frontend/.../FarmerEnrolSection.jsx        421    farmer enrolment
frontend/.../VerificationBaseline.jsx      452    DCAB screen
frontend/.../VerificationBiomass.jsx       423    biomass screen
frontend/.../ImageInference*.jsx +hook     ~550   CHM v2 UI
```

Attribution is stated rather than implied: an unattributed foundation model costs a
reviewer's trust in everything else on the page.

## Known limitations

Stated plainly, because they affect how the outputs should be read.

- **Carbon figures are planning estimates, not a quantification.** Issuance requires a
  field census, locally fitted allometry and an accredited verifier.
- **CHM allometry is a generalised pantropical form** and the weakest of the three
  biomass sources; the response labels it as such.
- **GEDI covers 51°N–51°S only.** Outside that band the ensemble drops to two sources and
  uncertainty rises accordingly.
- **Sentinel-2 begins in 2018**, which bounds the dynamic baseline: a project start year
  needs at least two years of imagery on each side.
- **CHM v2 output units are unresolved.** The model card documents the call but not the
  units or range, and observed values are not plausible canopy heights. The Space returns
  the raw distribution so the correct interpretation can be established from real output
  rather than assumed. Until that is settled the *comparison* across resolutions is
  sound but the *absolute heights* are not.
