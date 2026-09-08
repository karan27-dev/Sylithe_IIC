import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapContainer, TileLayer, GeoJSON, useMap, WMSTileLayer
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { kml } from '@tmcw/togeojson';
import shp, { parseShp, parseDbf, combine } from 'shpjs';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, UploadCloud, FileCode2, AlertCircle,
  Leaf, TreePine, Flame, Droplets, Layers, ArrowRight,
  RefreshCw, Info, MapPin, TrendingUp, BarChart3,
  ChevronRight, Zap, Shield, Lock
} from 'lucide-react';
import treeLogo from '../assets/treee13.png';
import { runFreeScan } from '../services/freeScanApi';

/* ─── Geodesic area helper ─────────────────────────────── */
const toRad = d => d * Math.PI / 180;
function ringArea(coords) {
  const R = 6378137; let t = 0; const n = coords.length;
  if (n <= 2) return 0;
  for (let i = 0; i < n; i++) {
    const [lng1] = coords[i];
    const [, lat2] = coords[(i + 1) % n];
    const [lng3] = coords[(i + 2) % n];
    t += (toRad(lng3) - toRad(lng1)) * Math.sin(toRad(lat2));
  }
  return Math.abs(t * R * R / 2);
}
function geojsonAreaHa(gj) {
  if (!gj) return 0; let t = 0;
  const proc = g => {
    if (!g) return;
    if (g.type === 'Polygon') { t += ringArea(g.coordinates[0]); for (let i = 1; i < g.coordinates.length; i++) t -= ringArea(g.coordinates[i]); }
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => { t += ringArea(p[0]); for (let i = 1; i < p.length; i++) t -= ringArea(p[i]); });
  };
  if (gj.type === 'FeatureCollection') (gj.features || []).forEach(f => proc(f.geometry));
  else if (gj.type === 'Feature') proc(gj.geometry);
  else proc(gj);
  return t / 10000;
}

/* ─── Map components ───────────────────────────────────── */
const FitBounds = ({ geojson }) => {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    try {
      const bounds = L.geoJSON(geojson).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } catch { }
  }, [geojson, map]);
  return null;
};

const LulcTileLayer = ({ url }) => {
  if (!url) return null;
  return <TileLayer url={url} opacity={0.75} />;
};

/* ─── Numeric formatter ────────────────────────────────── */
const fmt = n => Number(n).toLocaleString('en-IN');
const inrLakhs = tco2e => {
  const val = tco2e * 300 / 100000;
  return val < 1 ? `₹${(val * 100).toFixed(0)}K` : `₹${val.toFixed(1)}L`;
};

/* ─── Eligibility config ───────────────────────────────── */
const VERDICT_CONFIG = {
  eligible: {
    label: 'Eligible',
    sub: 'Strong carbon project potential',
    bg: 'bg-emerald-50', border: 'border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    icon: <CheckCircle2 size={28} className="text-emerald-600" />,
    dot: 'bg-emerald-500'
  },
  potentially_eligible: {
    label: 'Potentially Eligible',
    sub: 'Moderate carbon project potential',
    bg: 'bg-amber-50', border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    icon: <CheckCircle2 size={28} className="text-amber-500" />,
    dot: 'bg-amber-400'
  },
  low_potential: {
    label: 'Low Potential',
    sub: 'Limited carbon project suitability',
    bg: 'bg-slate-50', border: 'border-slate-200',
    badge: 'bg-slate-500 text-white',
    icon: <Info size={28} className="text-slate-500" />,
    dot: 'bg-slate-400'
  },
  not_eligible: {
    label: 'Not Eligible',
    sub: 'Land type not suitable',
    bg: 'bg-red-50', border: 'border-red-200',
    badge: 'bg-red-600 text-white',
    icon: <AlertCircle size={28} className="text-red-500" />,
    dot: 'bg-red-500'
  },
};

/* ─── Deforestation risk badge ─────────────────────────── */
const DeforBadge = ({ risk }) => {
  const map = { high: ['High Risk', 'bg-red-100 text-red-700'], medium: ['Medium Risk', 'bg-amber-100 text-amber-700'], low: ['Low Risk', 'bg-emerald-100 text-emerald-700'] };
  const [label, cls] = map[risk] || map.low;
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cls}`}>{label} Deforestation</span>;
};

/* ─── Loading steps ────────────────────────────────────── */
const STEPS = [
  { icon: <Layers size={18} />,   label: 'Fetching satellite imagery…' },
  { icon: <TreePine size={18} />, label: 'Classifying land cover (Dynamic World 10 m)…' },
  { icon: <Flame size={18} />,    label: 'Checking forest cover & deforestation (Hansen 2023)…' },
  { icon: <Leaf size={18} />,     label: 'Estimating carbon stock (NASA Biomass)…' },
  { icon: <BarChart3 size={18} />,label: 'Generating readiness report…' },
];

/* ═══════════════════════════════════════════════════════
   FREE SCAN PAGE
   ═══════════════════════════════════════════════════════ */
export default function FreeScan() {
  const navigate = useNavigate();

  /* ── state ── */
  const [phase, setPhase]         = useState('idle');   // idle | scanning | results | error
  const [geojson, setGeojson]     = useState(null);
  const [areaHa, setAreaHa]       = useState(0);
  const [file, setFile]           = useState(null);
  const [fileFormat, setFileFormat] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [loadStep, setLoadStep]   = useState(0);
  const [results, setResults]     = useState(null);
  const [scanError, setScanError] = useState('');
  const [showLulcTile, setShowLulcTile] = useState(true);

  const stepTimers = useRef([]);

  /* ── area computation ── */
  useEffect(() => {
    if (geojson) setAreaHa(geojsonAreaHa(geojson));
    else setAreaHa(0);
  }, [geojson]);

  /* ── file upload handler ── */
  const handleFile = useCallback(async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setFile(files.length > 1 ? { name: `${files.length} files` } : files[0]);
    setIsParsing(true); setGeojson(null); setParseError('');
    try {
      let gj;
      if (files.length > 1) {
        const parts = {}; let prj = null;
        for (const f of files) {
          const ext = f.name.split('.').pop().toLowerCase();
          if (ext === 'shp') parts.shp = await f.arrayBuffer();
          else if (ext === 'dbf') parts.dbf = await f.arrayBuffer();
          else if (ext === 'prj') prj = await f.text();
        }
        if (!parts.shp) throw new Error('No .shp file found');
        gj = combine([parseShp(parts.shp, prj || false), parts.dbf ? parseDbf(parts.dbf) : undefined]);
        setFileFormat('Shapefile');
      } else {
        const f = files[0];
        const ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'zip') { gj = await shp(await f.arrayBuffer()); setFileFormat('Shapefile (ZIP)'); }
        else if (ext === 'shp') { gj = combine([parseShp(await f.arrayBuffer(), false), undefined]); setFileFormat('Shapefile'); }
        else if (ext === 'geojson' || ext === 'json') { gj = JSON.parse(await f.text()); setFileFormat('GeoJSON'); }
        else if (ext === 'kml') { const doc = new DOMParser().parseFromString(await f.text(), 'text/xml'); gj = kml(doc); setFileFormat('KML'); }
        else throw new Error(`Unsupported format: .${ext}`);
      }
      setGeojson(gj);
    } catch (err) {
      setParseError(err.message || 'Parse failed');
    } finally {
      setIsParsing(false);
    }
  }, []);

  /* ── run scan ── */
  const runScan = useCallback(async () => {
    if (!geojson) return;
    setPhase('scanning');
    setScanError('');
    setLoadStep(0);

    // Animate loading steps
    const delays = [0, 2000, 5500, 9000, 13000];
    stepTimers.current = delays.map((ms, i) =>
      setTimeout(() => setLoadStep(i), ms)
    );

    try {
      let email = '';
      try {
        const ud = localStorage.getItem('sylithe_user');
        if (ud) email = JSON.parse(ud).email || '';
      } catch { }

      const data = await runFreeScan(geojson, email);
      stepTimers.current.forEach(clearTimeout);
      setResults(data.results);
      setPhase('results');
    } catch (err) {
      stepTimers.current.forEach(clearTimeout);
      if (err.status === 429) {
        setScanError(err.data?.message || 'Monthly scan limit reached. Upgrade for unlimited access.');
      } else if (err.status === 400 && err.data?.status === 'area_exceeded') {
        setScanError(err.data.message);
      } else {
        setScanError(err.message || 'Scan failed. Please try again.');
      }
      setPhase('error');
    }
  }, [geojson]);

  const reset = () => {
    setPhase('idle'); setGeojson(null); setFile(null);
    setFileFormat(''); setParseError(''); setResults(null); setScanError('');
    setAreaHa(0); setLoadStep(0);
  };

  const AREA_LIMIT = 500;
  const areaOk = areaHa > 0 && areaHa <= AREA_LIMIT;
  const canScan = geojson && areaOk && !isParsing;

  /* ═══ RENDER ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans">

      {/* ── Minimal header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={treeLogo} alt="Sylithe" className="w-8 h-8 object-contain" />
          <span className="text-[18px] font-bold text-[#08292F] tracking-tight">Sylithe</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[12px] font-bold uppercase tracking-wide">Free Tool</span>
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors">Log in</button>
          <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-[#08292F] text-white text-[13px] font-bold rounded-lg hover:bg-[#062125] transition-colors">Sign up free</button>
        </div>
      </header>

      <AnimatePresence mode="wait">

        {/* ══════════════ IDLE ══════════════ */}
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-6 py-12">

            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[12px] font-bold text-emerald-700 uppercase tracking-wide mb-5">
                <Zap size={13} /> Free · No credit card required
              </div>
              <h1 className="text-[38px] font-black text-[#0F172A] leading-tight mb-4">
                Is your land eligible for a<br />
                <span className="text-[#16a34a]">carbon project?</span>
              </h1>
              <p className="text-[17px] text-gray-500 max-w-xl mx-auto leading-relaxed">
                Upload your project boundary and get a satellite-based readiness report in under 2 minutes — completely free.
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 text-[13px] text-gray-500 font-medium">
                {[['Land Eligibility', <CheckCircle2 size={14} className="text-emerald-500" />],
                  ['LULC Classification', <Layers size={14} className="text-blue-500" />],
                  ['Carbon Estimate', <Leaf size={14} className="text-emerald-500" />]
                ].map(([label, icon]) => (
                  <div key={label} className="flex items-center gap-1.5">{icon}{label}</div>
                ))}
              </div>
            </div>

            {/* Upload card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">

              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <UploadCloud size={22} className="text-gray-500" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#0F172A]">Upload your project boundary</h2>
                  <p className="text-[13px] text-gray-400 mt-0.5">KML, GeoJSON, or Shapefile — max 500 ha free</p>
                </div>
              </div>

              {/* Formats */}
              <div className="px-6 pt-4 flex flex-wrap gap-2">
                {['.kml', '.geojson', '.shp + .dbf', '.zip (shapefile)', '.json'].map(f => (
                  <span key={f} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{f}</span>
                ))}
              </div>

              {/* Drop zone */}
              <div className="px-6 pb-6 pt-4">
                <div className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${isParsing ? 'border-gray-300 bg-gray-50/50' : geojson && !parseError ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/40 cursor-pointer'}`}>
                  <input
                    type="file" multiple
                    accept=".kml,.geojson,.json,.zip,.shp,.shx,.dbf,.prj"
                    onChange={handleFile}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      {isParsing
                        ? <div className="w-6 h-6 border-[3px] border-gray-300 border-t-[#08292F] rounded-full animate-spin" />
                        : geojson && !parseError
                          ? <CheckCircle2 size={28} className="text-emerald-600" />
                          : <UploadCloud size={28} className="text-gray-400" />
                      }
                    </div>
                    <p className="text-[14px] font-semibold text-[#0F172A] mb-1">
                      {isParsing ? 'Parsing file…' : geojson ? 'File loaded — drag to replace' : 'Choose a file or drag & drop here'}
                    </p>
                    <p className="text-[12px] text-gray-400">KML, GeoJSON, Shapefile — up to 100 MB</p>
                  </div>
                </div>
                {parseError && (
                  <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="text-[13px] font-medium">{parseError}</span>
                  </div>
                )}
              </div>

              {/* File stats row */}
              {geojson && !parseError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileCode2 size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#0F172A] truncate">{file?.name}</p>
                      <p className="text-[12px] text-gray-400">{fileFormat} · Parsed successfully</p>
                    </div>
                    <CheckCircle2 size={18} className="text-[#08292F] shrink-0" />
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <div className="px-6 py-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><MapPin size={12} />Area</p>
                      <p className={`text-[18px] font-black leading-snug ${areaHa > AREA_LIMIT ? 'text-red-600' : 'text-[#0F172A]'}`}>
                        {fmt(Math.round(areaHa))} ha
                      </p>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Limit</p>
                      <p className="text-[18px] font-black text-[#0F172A] leading-snug">{AREA_LIMIT} ha</p>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Format</p>
                      <p className="text-[18px] font-black text-[#0F172A] leading-snug">{fileFormat}</p>
                    </div>
                  </div>
                  {areaHa > AREA_LIMIT && (
                    <div className="mx-6 mb-4 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span className="text-[13px] font-medium">Area exceeds the 500 ha free limit. <button onClick={() => navigate('/signup')} className="underline font-bold">Upgrade</button> to analyse unlimited areas.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Map preview */}
            {geojson && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6"
                style={{ height: 320 }}
              >
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution="&copy; Google" maxZoom={22} />
                  <GeoJSON key={JSON.stringify(geojson)} data={geojson} style={{ color: '#16a34a', weight: 2.5, fillOpacity: 0.15, fillColor: '#16a34a' }} />
                  <FitBounds geojson={geojson} />
                </MapContainer>
              </motion.div>
            )}

            {/* CTA */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={runScan}
                disabled={!canScan}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-[15px] shadow-lg transition-all duration-200 ${canScan ? 'bg-[#08292F] hover:bg-[#062125] text-white hover:shadow-xl hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Zap size={18} />
                Run Free Scan
                <ArrowRight size={18} />
              </button>
              <p className="text-[12px] text-gray-400">Takes ~90 seconds · Powered by Google Earth Engine</p>
            </div>
          </motion.div>
        )}

        {/* ══════════════ SCANNING ══════════════ */}
        {phase === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-lg mx-auto px-6 py-20 flex flex-col items-center">

            {/* Satellite pulse animation */}
            <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-10 animate-ping" />
              <div className="absolute inset-2 bg-emerald-400 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.4s' }} />
              <div className="w-24 h-24 bg-[#08292F] rounded-full flex items-center justify-center">
                <Layers size={32} className="text-emerald-400" />
              </div>
            </div>

            <h2 className="text-[22px] font-black text-[#0F172A] mb-2 text-center">Analysing your land…</h2>
            <p className="text-[14px] text-gray-400 mb-10 text-center">Running satellite analysis on {fmt(Math.round(areaHa))} ha</p>

            <div className="w-full space-y-3">
              {STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-500 ${
                  i < loadStep  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  i === loadStep ? 'bg-[#08292F] border-[#08292F] text-white shadow-lg' :
                  'bg-white border-gray-100 text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    i < loadStep  ? 'bg-emerald-200' :
                    i === loadStep ? 'bg-white/20' :
                    'bg-gray-100'
                  }`}>
                    {i < loadStep
                      ? <CheckCircle2 size={16} className="text-emerald-600" />
                      : i === loadStep
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <span className="text-[12px] font-bold">{i + 1}</span>
                    }
                  </div>
                  <span className="text-[13px] font-semibold">{step.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════ ERROR ══════════════ */}
        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-lg mx-auto px-6 py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-2">Scan failed</h2>
            <p className="text-[14px] text-gray-500 mb-8 max-w-sm">{scanError}</p>
            <div className="flex gap-3">
              <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-[#08292F] text-white font-bold rounded-xl hover:bg-[#062125] transition-colors text-[13px]">
                <RefreshCw size={15} /> Try Again
              </button>
              <button onClick={() => navigate('/signup')} className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-[13px]">
                Upgrade Plan
              </button>
            </div>
          </motion.div>
        )}

        {/* ══════════════ RESULTS ══════════════ */}
        {phase === 'results' && results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto px-6 py-10">

            {/* Report header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[26px] font-black text-[#0F172A]">Project Readiness Report</h1>
                  <span className="px-3 py-1 bg-[#08292F] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">Free Scan</span>
                </div>
                <p className="text-[14px] text-gray-400">{fmt(results.area_ha)} ha analysed · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                <RefreshCw size={14} /> New Scan
              </button>
            </div>

            {/* ── 1. ELIGIBILITY CARD ── */}
            {(() => {
              const cfg = VERDICT_CONFIG[results.eligibility.verdict] || VERDICT_CONFIG.low_potential;
              return (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-8 mb-6`}>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-5">
                      {cfg.icon}
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-[24px] font-black text-[#0F172A]">{cfg.label}</h2>
                          <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${cfg.badge}`}>
                            Score {results.eligibility.score}/100
                          </span>
                          <DeforBadge risk={results.eligibility.defor_risk} />
                        </div>
                        <p className="text-[14px] text-gray-600 mb-4">{results.eligibility.reason}</p>
                        {results.eligibility.eligible_types.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[12px] font-semibold text-gray-500 mr-1">Suitable for:</span>
                            {results.eligibility.eligible_types.map(t => (
                              <span key={t} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[12px] font-bold text-[#0F172A] shadow-sm">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Area</div>
                      <div className="text-[32px] font-black text-[#0F172A] leading-none">{fmt(results.area_ha)}</div>
                      <div className="text-[14px] text-gray-400 font-semibold">hectares</div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* ── 2+3. LULC + CARBON row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* LULC card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-gray-500" />
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Land Cover Classification</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Dynamic World · 10 m
                  </div>
                </div>

                {/* Map */}
                <div style={{ height: 220 }} className="relative">
                  <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
                    <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" maxZoom={22} />
                    {showLulcTile && results.lulc_tile_url && <TileLayer url={results.lulc_tile_url} opacity={0.75} />}
                    <GeoJSON key="lulc-aoi" data={geojson} style={{ color: '#fff', weight: 2, fillOpacity: 0 }} />
                    <FitBounds geojson={geojson} />
                  </MapContainer>
                  <button
                    onClick={() => setShowLulcTile(v => !v)}
                    className="absolute top-2 right-2 z-[1000] px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200 shadow-sm hover:bg-white transition-colors"
                  >
                    {showLulcTile ? 'Hide LULC' : 'Show LULC'}
                  </button>
                </div>

                {/* Bars */}
                <div className="px-6 py-4 space-y-2.5">
                  {Object.entries(results.lulc)
                    .filter(([, v]) => v.pct > 0.5)
                    .sort(([, a], [, b]) => b.pct - a.pct)
                    .slice(0, 6)
                    .map(([name, v]) => (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: v.color }} />
                            <span className="text-[13px] font-semibold text-[#0F172A]">{name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] text-gray-400 font-medium">{fmt(v.ha)} ha</span>
                            <span className="text-[13px] font-bold text-[#0F172A] w-12 text-right">{v.pct}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${v.pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ background: v.color }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Forest cover stat */}
                <div className="mx-6 mb-5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                    <TreePine size={15} className="text-emerald-600" />
                    Forest cover (Hansen 2023)
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-black text-[#0F172A]">{results.forest.cover_pct}%</span>
                    {results.forest.loss_ha_10yr > 0 && (
                      <span className="text-[11px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                        −{fmt(results.forest.loss_ha_10yr)} ha loss (10yr)
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Carbon card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf size={16} className="text-gray-500" />
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Carbon Estimate</h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">NASA Biomass · Spawn 2020</span>
                </div>

                <div className="px-6 py-8">
                  {/* Main carbon range */}
                  <div className="text-center mb-8">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Estimated Carbon Stock</p>
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-[42px] font-black text-[#0F172A] leading-none">{fmt(results.carbon.total_co2_mid)}</span>
                      <span className="text-[18px] font-bold text-gray-400">tCO₂e</span>
                    </div>
                    <p className="text-[13px] text-gray-400">Range: {fmt(results.carbon.total_co2_low)} – {fmt(results.carbon.total_co2_high)} tCO₂e</p>
                  </div>

                  {/* Range bar */}
                  <div className="relative mb-8">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1, delay: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #bbf7d0 0%, #16a34a 50%, #166534 100%)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[11px] text-gray-400 font-medium">{fmt(results.carbon.total_co2_low)}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{fmt(results.carbon.total_co2_high)}</span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Per Hectare</p>
                      <p className="text-[20px] font-black text-[#0F172A]">{results.carbon.co2_per_ha}</p>
                      <p className="text-[12px] text-gray-400">tCO₂e / ha</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Annual Sequestration</p>
                      <p className="text-[20px] font-black text-[#0F172A]">{fmt(results.carbon.annual_seq_low)}–{fmt(results.carbon.annual_seq_high)}</p>
                      <p className="text-[12px] text-gray-400">tCO₂e / year (potential)</p>
                    </div>
                  </div>

                  {/* Market value hint */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-bold text-emerald-800 mb-1">Estimated market value</p>
                        <p className="text-[22px] font-black text-emerald-700">
                          {inrLakhs(results.carbon.total_co2_low)} – {inrLakhs(results.carbon.total_co2_high)}
                        </p>
                        <p className="text-[11px] text-emerald-600 mt-1">Based on ₹300/tCO₂e (India VCM rate) · indicative only</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── UPGRADE CTA ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-[#08292F] rounded-2xl p-8 text-white">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock size={16} className="text-emerald-400" />
                    <span className="text-[12px] font-bold text-emerald-400 uppercase tracking-wide">Unlock Full Verification</span>
                  </div>
                  <h3 className="text-[22px] font-black mb-3">Get your project registry-ready</h3>
                  <p className="text-[14px] text-gray-300 max-w-lg leading-relaxed mb-5">
                    This free scan gives you a snapshot. Full verification includes precise AGB calculation, dynamic baseline assessment, canopy height modelling, and audit-ready reports accepted by Verra, Gold Standard, and CCTS.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Precise AGB Calculation', 'Canopy Height Model', 'Dynamic Baseline', 'Deforestation Alerts', 'Audit-ready Reports', 'Registry Submission Support'].map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-[13px] text-gray-200 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 shrink-0">
                  <button onClick={() => navigate('/signup')}
                    className="flex items-center gap-2 px-7 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-[14px] shadow-lg transition-all hover:-translate-y-0.5">
                    Get Full Access <ArrowRight size={16} />
                  </button>
                  <button onClick={() => window.location.href = 'mailto:info@sylithe.com?subject=Full Verification - Sylithe'}
                    className="px-7 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-xl text-[13px] transition-all text-center">
                    Talk to our team
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <p className="mt-6 text-center text-[11px] text-gray-400 max-w-2xl mx-auto">
              Estimates are based on satellite data and IPCC Tier-1 defaults. Results are indicative and not a substitute for full project verification. Carbon values use ₹300/tCO₂e as an indicative reference rate.
            </p>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
