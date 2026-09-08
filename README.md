# Sylithe IIC

**AI-Powered Monitoring of Agriculture & Agroforestry for Carbon Credit Verification**

Carbon dMRV (digital Measurement, Reporting & Verification) intelligence platform —
Geospatial / Earth Observation + AI.

## Repository layout

| Path | Stack | Description |
|---|---|---|
| `frontend/` | React 19 · Vite · Tailwind · Leaflet · Recharts | Dashboards, map-based plot drawing (KML/SHP/GeoJSON), verification wizard, PDF reports |
| `backend/` | Flask · Google Earth Engine · MongoDB | Geospatial analysis engine, carbon quantification, AI analysis, auth |

## dMRV pipeline

```
KML / SHP / GeoJSON upload
   ├─ Onboarding        project + plot inventory
   ├─ Land Eligibility  LULC classification → suitable vs unsuitable area
   ├─ Carbon Estimate   above/below-ground biomass → tCO2e
   ├─ Canopy Height     1 m canopy height model → tree points & height distribution
   ├─ Dynamic Baseline  matched-control counterfactual (DCAB)
   ├─ Biomass           creditable volume
   └─ Reports           diligence PDF + AI analysis + project rating
```

## Earth Observation datasets

Dynamic World · ESA WorldCover · Meta Canopy Height · Hansen Global Forest Change ·
MODIS MCD64A1 · Sentinel-1 / Sentinel-2 · ESA CCI Biomass · CHIRPS · Copernicus GLO-30 ·
OpenLandMap · JRC GHSL / GSW / GFC2020 · WDPA

## Local setup

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, DEEPSEEK_API_KEY, ...
python app.py             # http://localhost:5001
```

Google Earth Engine credentials are required for satellite analytics — see
[`backend/README_GEE_SETUP.md`](backend/README_GEE_SETUP.md).

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## Configuration

No credentials are committed to this repository. All secrets are read from
environment variables (see `backend/config.py` and `backend/.env.example`).
