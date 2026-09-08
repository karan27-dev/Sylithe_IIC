# Sylithe IIC

**AI-Powered Monitoring of Agriculture & Agroforestry for Carbon Credit Verification**

A carbon dMRV (digital Measurement, Reporting & Verification) platform that decides
whether land can carry a carbon project, derives its baseline from comparable land
observed by satellite, and quantifies the stock with an uncertainty deduction applied
before anything is called creditable.

---

## The problem

Agriculture is the largest carbon opportunity in India and the least verifiable:

- Agricultural credits depend on **practices, not stocks** — did the farmer really go
  zero-till, skip the burn, dry the paddy? Today that is largely self-declared.
- Practice evidence has a **7–21 day satellite window**. Annual audits arrive after it
  is gone.
- Verification cost is fixed per project, while smallholder plots are **0.5–2 ha**, so
  the economics collapse without aggregation.
- Baselines are negotiated once at validation and frozen for a decade, even as the
  surrounding landscape changes.

India's Carbon Credit Trading Scheme (CCTS) begins trading in 2026, and the BEE
approved offset sectors include **agroforestry, biochar and rice methane** — so this
becomes a compliance problem, not only a voluntary-market one.

## The approach

Verification, not estimation. Every number is traceable to a public dataset, and the
figure presented as creditable is always the conservative one.

| Principle | How it shows up |
|---|---|
| Prove the event, don't assume it | Burn detection dates residue fires per parcel |
| Baseline from observation | Control plots matched from the surrounding landscape |
| Disagreement is information | Three independent biomass retrievals; their spread becomes the deduction |
| Never credit the flattering number | Headline stock is post-deduction, not the mean |

---

## Repository layout

| Path | Stack | Contents |
|---|---|---|
| `frontend/` | React 19 · Vite · Tailwind · Leaflet · Recharts | Role dashboards, map plot drawing, KML/SHP/GeoJSON import, verification screens, PDF reports |
| `backend/` | Flask · Google Earth Engine · MongoDB | Geospatial analysis, carbon quantification, AI analysis, auth |

> **Provenance.** The platform this builds on (`frontend/`, `backend/` core, LULC / CHM
> / reporting) is prior work by the Sylithe team. The modules listed under *Built for
> this challenge* below are the agriculture, baseline and biomass work added here.

---

## Built for this challenge

### `POST /api/agri/screen` — parcel eligibility screening
`backend/routes/agri.py`

Answers, in about a second, whether a smallholder parcel can carry a census-based
agroforestry project.

Encodes the Verra **VM0047 v1.1 census-based** rules rather than restating them:

- Planting capacity is `min(area × 50/ha, bund_length ÷ 5 m spacing)`, and the response
  names which constraint binds. The 50 trees/ha ceiling is the threshold above which
  the activity counts as land-use change and must use the heavier area-based approach.
- Existing canopy is returned with `creditable: false` — VM0047 credits only trees
  planted by the project, so pre-existing farm trees can never leak into the count.
- Biochar feedstock is capped at 40% of residue, because removing all of it lowers soil
  carbon input and over-credits against the soil pool.

Measured **1.2 s** on a clean parcel, 10.8 s on one with five seasons of burn
detections, against ~115 s for the equivalent full-diligence pipeline. The gain comes
from making no `getMapId()` tile calls and collapsing every statistic into a single
Earth Engine round trip.

### `POST /api/dcab/run` — dynamic carbon accounting baseline
`backend/routes/dcab.py`

The dynamic performance benchmark VM0047 v1.1 makes mandatory for the area-based
approach: the counterfactual is re-derived from what comparable land actually did,
rather than fixed at validation.

| Step | Implementation |
|---|---|
| Donor pool | Ring around the project, minus a 2 km leakage belt so it cannot match its own edge |
| Stocking index | **NDFI** from Sentinel-2 spectral mixture analysis (Souza/CLASlite endmembers) — the index VM0047 names, and one that tracks degradation NDVI saturates through |
| Matching | Stocking index at three pre-project time points plus elevation and slope; k-nearest neighbour on **standardised** Euclidean distance |
| Benchmark | OLS through project and matched-control series; the slope contrast is the benchmark |

Reports **pre-project bias** as an explicit match-quality rating: if project and
controls already differed before the start date, the benchmark is carrying that
difference rather than measuring project effect.

### `POST /api/biomass/estimate` — carbon stock with uncertainty deduction
`backend/routes/biomass.py`

Three independent above-ground biomass retrievals over the same polygon:

| Source | Physics |
|---|---|
| GEDI L4B | Spaceborne lidar, 1 km gridded AGBD with published standard error |
| ESA CCI v6 | SAR — Sentinel-1 C-band + ALOS-2 L-band at 100 m |
| CHM allometry | Meta 1 m canopy height through `AGB = 3.836 × H^1.18` |

They rest on different physics, so their disagreement measures **structural model
uncertainty**, not noise inside one product. Accounting follows VM0047 and IPCC
defaults — carbon fraction 0.47, ecozone root-to-shoot ratio selected from rainfall and
canopy height, CO₂ = C × 44/12 — and applies the `(1 − UNC)` deduction where UNC is the
90% confidence interval as a percentage of the mean.

On Punjab cropland the sources disagree fivefold, uncertainty saturates, and the
creditable stock returns **zero** rather than a flattering 14.8 t/ha. Refusing to credit
cropland biomass is the correct answer, and the deduction reaches it unaided.

### Farmer enrolment
`frontend/src/pages/dashboards/FarmerEnrolSection.jsx`

Project Management asks who is adding land — **Project Developer** (the existing
wizard) or **Farmer**. The farmer path asks real questions rather than project
paperwork: name, mobile, village, district, land record number, tenure, current crop,
and what happens to the residue after harvest. That last question sets the biochar
baseline, and *"I burn it"* is the strongest one. Boundary comes in as KML, GeoJSON or
shapefile, is screened through `/api/agri/screen`, and only an eligible parcel can be
enrolled.

---

## Pipeline

```
KML / SHP / GeoJSON upload,  or  farmer draws the bund
   │
   ├─ Eligibility screen      land cover, capacity at ≤50 trees/ha, burn history
   ├─ Land eligibility        LULC classification, suitable vs ineligible area
   ├─ Canopy height           1 m CHM, tree points, height distribution
   ├─ Dynamic baseline        NDFI, matched controls, slope contrast  (DCAB)
   ├─ Biomass                 3-source ensemble → uncertainty deduction → creditable
   └─ Reports                 diligence PDF, AI analysis, project rating
```

## Earth observation datasets

Sentinel-1 · Sentinel-2 · GEDI L4B · Meta Canopy Height · ESA CCI Biomass v6 ·
Dynamic World · ESA WorldCover · Hansen Global Forest Change · MODIS MCD64A1 ·
VIIRS · CHIRPS · Copernicus GLO-30 · OpenLandMap · JRC GHSL / GSW / GFC2020 · WDPA

## Methodology references

Verra **VM0047 v1.1** (ARR, area-based and census-based) · Verra **VM0042** (improved
agricultural land management) · IPCC carbon fraction and root-to-shoot defaults ·
BEE **CCTS** offset sectors.

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

Google Earth Engine credentials are required for all satellite analysis — see
[`backend/README_GEE_SETUP.md`](backend/README_GEE_SETUP.md).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # sets VITE_API_URL
npm run dev               # http://localhost:5173
```

> **`VITE_API_URL` is required.** Without it every `fetch()` resolves to
> `undefined/api/…` and the UI reports *"Could not connect to server."* Vite reads
> `.env` only at startup, so restart the dev server after changing it.

### Health check
```bash
curl http://127.0.0.1:5001/health
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/agri/screen` | Parcel eligibility, planting capacity, burn history |
| `POST` | `/api/dcab/run` | Dynamic baseline, matched controls, benchmark |
| `POST` | `/api/biomass/estimate` | 3-source AGB ensemble with uncertainty deduction |
| `POST` | `/api/chm/predict` | Canopy height model, LULC, tree points |
| `POST` | `/api/chm/land-history` | Multi-year land history and site profile |
| `GET`/`POST` | `/api/dev/projects` | Project CRUD |
| `POST` | `/api/login` · `/api/signup` | Authentication |

Example:
```bash
curl -X POST http://127.0.0.1:5001/api/agri/screen \
  -H 'Content-Type: application/json' \
  -d '{"crop":"rice","residue_today":"burn","geojson":{"type":"Polygon","coordinates":[[[75.42,30.55],[75.424,30.55],[75.424,30.5535],[75.42,30.5535],[75.42,30.55]]]}}'
```

## Configuration and secrets

No credentials are committed. Everything is read from environment variables — see
`backend/config.py`, `backend/.env.example` and `frontend/.env.example`.

## Limitations

Stated plainly, because they matter for how the outputs should be read:

- Carbon figures are **planning estimates**, not a quantification. Issuance requires a
  field census, locally fitted allometry and an accredited verifier.
- The CHM allometry is a generalised pantropical form and is the weakest of the three
  biomass sources; the response labels it as such.
- GEDI covers 51°N–51°S only; outside that band the ensemble drops to two sources and
  uncertainty rises accordingly.
- Sentinel-2 begins in 2018, so a dynamic baseline needs a project start year leaving at
  least two years of imagery on each side.
