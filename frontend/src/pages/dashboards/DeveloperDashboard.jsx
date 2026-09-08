import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  HiArrowRight, HiUpload, HiCheckCircle, HiOutlineInformationCircle,
  HiChevronRight, HiChevronDown, HiPlus, HiDocumentText, HiTrash, HiExclamationCircle
} from 'react-icons/hi';
import { TbMap2, TbPlant2, TbFileReport, TbSatellite, TbWorldLatitude, TbLeaf, TbChartBar, TbMenu2 } from 'react-icons/tb';
import SylitheLeftNav from '../../components/chm/SylitheLeftNav';
import shp, { parseShp, parseDbf, combine } from 'shpjs';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { kml } from '@tmcw/togeojson';
import { consumeFeature } from '../../services/freeScanApi';

import LandEligibilityPage from './VerificationLandEligibility';
import CHMReportPage from './VerificationCHM';
import DynamicBaselinePage from './VerificationBaseline';
import BiomassEstimationPage from './VerificationBiomass';
import ReportsDashboard from './ReportsDashboard';
import FreeLandEligibility from './FreeLandEligibility';
import FreeLulcSnapshot from './FreeLulcSnapshot';
import FreeCarbonEstimate from './FreeCarbonEstimate';
import FreeTreeInventory from './FreeTreeInventory';
import { GeeAnalyticsPanel, GeeLandCoverPanel } from '../../components/chm/GeeAnalytics';
import * as api from '../../services/devProjectsApi';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { CircleCheck, ExternalLink, UploadCloud, CheckCircle2, FileText, Trash2, MapPin, Hash, FileCode2, Menu } from "lucide-react";

/* ─── DESIGN TOKENS ─── */
const s = { bg: '#F0EEE6', bgDark: '#08292F', accent: '#16a34a', text: '#191919', muted: '#64748B', border: '#E2E8F0' };

/* ─── GEODESIC AREA ─── */
const toRad = (d) => (d * Math.PI) / 180;
function ringArea(coords) {
  const R = 6378137; let total = 0; const len = coords.length;
  if (len <= 2) return 0;
  for (let i = 0; i < len; i++) {
    const [lng1] = coords[i]; const [, lat2] = coords[(i + 1) % len]; const [lng3] = coords[(i + 2) % len];
    total += (toRad(lng3) - toRad(lng1)) * Math.sin(toRad(lat2));
  }
  return Math.abs((total * R * R) / 2);
}
function geojsonArea(geojson) {
  if (!geojson) return 0; let total = 0;
  const proc = (geom) => {
    if (!geom) return;
    if (geom.type === 'Polygon') { total += ringArea(geom.coordinates[0]); for (let i = 1; i < geom.coordinates.length; i++) total -= ringArea(geom.coordinates[i]); }
    else if (geom.type === 'MultiPolygon') { geom.coordinates.forEach((p) => { total += ringArea(p[0]); for (let i = 1; i < p.length; i++) total -= ringArea(p[i]); }); }
  };
  if (geojson.type === 'FeatureCollection') (geojson.features || []).forEach((f) => proc(f.geometry));
  else if (geojson.type === 'Feature') proc(geojson.geometry);
  else proc(geojson);
  return total;
}
function computeGeoJSONStats(geojson) {
  if (!geojson) return null;
  const areaSqM = geojsonArea(geojson); const areaHa = areaSqM / 10000;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity, sumLat = 0, sumLng = 0, count = 0, featureCount = 0;
  const processCoords = (coords) => { if (typeof coords[0] === 'number') { const [lng, lat] = coords; if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat; if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng; sumLat += lat; sumLng += lng; count++; } else coords.forEach(processCoords); };
  const processFeature = (f) => { featureCount++; if (f.geometry?.coordinates) processCoords(f.geometry.coordinates); };
  if (geojson.type === 'FeatureCollection') (geojson.features || []).forEach(processFeature);
  else if (geojson.type === 'Feature') processFeature(geojson);
  else if (geojson.coordinates) { featureCount = 1; processCoords(geojson.coordinates); }
  return { areaHa: areaHa.toFixed(2), areaSqKm: (areaSqM / 1e6).toFixed(2), centroid: count > 0 ? { lat: (sumLat / count).toFixed(4), lng: (sumLng / count).toFixed(4) } : null, bbox: minLat < Infinity ? { minLat: minLat.toFixed(4), maxLat: maxLat.toFixed(4), minLng: minLng.toFixed(4), maxLng: maxLng.toFixed(4) } : null, featureCount };
}

/* ─── MAP COMPONENTS ─── */
const AdvancedMapLayer = ({ geojsonData, georasterData }) => {
  const map = useMap();
  // Cheap remount key: bumps only when the geojson reference changes (O(1)),
  // instead of JSON.stringify-ing the entire (possibly multi-MB) geometry on every render.
  const keyRef = useRef(0);
  const layerKey = useMemo(() => ++keyRef.current, [geojsonData]);
  useEffect(() => { 
    if (georasterData) { 
      const layer = new GeoRasterLayer({ georaster: georasterData, opacity: 0.7, resolution: 256 }); 
      layer.addTo(map); 
      try { 
        const bounds = layer.getBounds();
        if (bounds && bounds.isValid()) map.fitBounds(bounds, { maxZoom: 16 }); 
      } catch { } 
      return () => map.removeLayer(layer); 
    } 
  }, [georasterData, map]);
  useEffect(() => { 
    if (geojsonData) { 
      try { 
        const layer = L.geoJSON(geojsonData); 
        const bounds = layer.getBounds();
        if (bounds && bounds.isValid()) map.fitBounds(bounds, { maxZoom: 16 }); 
      } catch { } 
    } 
  }, [geojsonData, map]);
  // layerKey forces the GeoJSON layer to recreate when active AOI / boundary changes
  return geojsonData ? <GeoJSON key={layerKey} data={geojsonData} style={{ color: '#10b981', weight: 2, fillOpacity: 0.2 }} /> : null;
};
const MapZoomController = () => { const map = useMap(); useEffect(() => { const hi = () => map.zoomIn(); const ho = () => map.zoomOut(); window.addEventListener('zoom-in', hi); window.addEventListener('zoom-out', ho); return () => { window.removeEventListener('zoom-in', hi); window.removeEventListener('zoom-out', ho); }; }, [map]); return null; };
/* Fix: invalidate map size when parent container becomes visible (display:none → flex) and re-fit bounds */
const MapResizeHandler = ({ geojsonData }) => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;
    
    const fixMap = () => {
      if (container.offsetParent !== null) {
        map.invalidateSize({ animate: false });
        if (geojsonData) {
          try {
            const bounds = L.geoJSON(geojsonData).getBounds();
            if (bounds && bounds.isValid()) map.fitBounds(bounds, { maxZoom: 16, animate: false });
          } catch (e) { }
        }
      }
    };

    const observer = new ResizeObserver(() => { fixMap(); });
    observer.observe(container);
    const timers = [100, 300, 500, 1000, 2000].map(ms => setTimeout(fixMap, ms));
    return () => { observer.disconnect(); timers.forEach(clearTimeout); };
  }, [map, geojsonData]);
  return null;
};

/* ─── FORM COMPONENTS (Tabular Style) ─── */
const TableRowInput = ({ label, name, type = 'text', value, onChange, placeholder, required = false, badgeFormat = false }) => (
  <div className="flex items-center justify-between py-3.5 px-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors focus-within:bg-gray-50/80">
    <label className="text-[13px] text-gray-500 font-medium w-1/3 shrink-0 cursor-pointer" htmlFor={name}>{label}</label>
    <div className="flex-1 flex justify-end">
      <input
        id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full max-w-[300px] bg-transparent outline-none text-[13px] font-semibold text-[#191919] text-right placeholder-gray-300"
      />
    </div>
  </div>
);
const TableRowSelect = ({ label, name, value, onChange, options, required = false, placeholder = 'Select...' }) => (
  <div className="flex items-center justify-between py-3.5 px-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors focus-within:bg-gray-50/80">
    <label className="text-[13px] text-gray-500 font-medium w-1/3 shrink-0 cursor-pointer" htmlFor={name}>{label}</label>
    <div className="flex-1 flex justify-end">
      <select
        id={name} name={name} value={value} onChange={onChange} required={required}
        className={`w-full max-w-[300px] bg-transparent outline-none text-[13px] font-semibold text-right cursor-pointer appearance-none ${value ? 'text-[#191919]' : 'text-gray-400'}`}
        style={{ direction: 'rtl' }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value} style={{ direction: 'ltr' }}>{o.label}</option>)}
      </select>
    </div>
  </div>
);

/* ─── TABLE ROW (Carbon Direct style) ─── */
const TableRow = ({ label, value, badge = false }) => (
  <div className="flex items-center justify-between py-3.5 px-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
    <span className="text-[13px] text-gray-500 font-medium">{label}</span>
    {badge ? (
      <span className="px-3 py-1 bg-gray-100 text-[#191919] rounded-full text-[12px] font-bold">{value}</span>
    ) : (
      <span className="text-[13px] font-semibold text-[#191919] text-right max-w-[50%] truncate">{value || '—'}</span>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   DEVELOPER DASHBOARD
   ═══════════════════════════════════════════════════════════ */
const DeveloperDashboard = () => {
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('section') || 'land_eligibility';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // The left nav starts visible on every section, including Land Eligibility —
  // which is the landing section, so auto-collapsing here meant a developer saw
  // a bare map on login. Land Eligibility still offers a chevron to collapse it
  // manually when the analysis panel needs the extra room.
  const [navCollapsed, setNavCollapsed] = useState(false);
  // Helper to scope storage keys to the current user
  const getLsKey = (key) => {
    try {
      const ud = localStorage.getItem('sylithe_user');
      const email = ud ? JSON.parse(ud).email : 'default';
      return `${key}_${email}`;
    } catch { return `${key}_default`; }
  };

  const [step, setStep] = useState(() => Number(localStorage.getItem(getLsKey('syl_dev_step'))) || 1);
  const [projectData, setProjectData] = useState(() => {
    const saved = localStorage.getItem(getLsKey('syl_dev_data'));
    return saved ? JSON.parse(saved) : {
      name: '', type: '', area: '', country: '', state: '', district: '',
      creditingStandard: '', methodology: '', creditStart: '', creditEnd: '',
      description: '', proponent: '', proponentContact: '',
      ccpEligible: '', projectLength: '', startDate: '',
      landTenure: '', communityBenefit: '', biodiversityImpact: '',
      baselineScenario: '', monitoringPlan: '', leakageRisk: '',
    };
  });
  const [showResult, setShowResult] = useState(() => localStorage.getItem(getLsKey('syl_dev_result')) === 'true');
  const [file, setFile] = useState(null);
  const [geojsonData, setGeojsonData] = useState(() => { try { const s = localStorage.getItem(getLsKey('syl_dev_geojson')); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [georasterData, setGeorasterData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [fileFormat, setFileFormat] = useState(() => localStorage.getItem(getLsKey('syl_dev_filefmt')) || '');
  const [justUploaded, setJustUploaded] = useState(false);
  const [selectedFY, setSelectedFY] = useState('2026');
  const [activeAoiIndex, setActiveAoiIndex] = useState('all');
  const [hasRunAnalytics, setHasRunAnalytics] = useState(false);
  const [freeScanResult, setFreeScanResult] = useState(null);
  const [freeScanGeojson, setFreeScanGeojson] = useState(null);
  const [geeTileLayer, setGeeTileLayer] = useState({ url: null, type: null });
  const [mapStyle, setMapStyle] = useState('satellite');

  // Hydrate from cache first so the project selector never disappears on a
  // slow/cold backend; refresh from the API in the background.
  const [savedProjects, setSavedProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('syl_dev_saved_projects') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    const token = localStorage.getItem('sylithe_token');
    if (!token) return;
    api.getProjects(token)
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.projects)) {
          setSavedProjects(data.projects);
          try { localStorage.setItem('syl_dev_saved_projects', JSON.stringify(data.projects)); } catch { /* quota */ }
        }
      })
      .catch(console.error);
  }, []);

  const handleProjectSelect = async (projectId) => {
    const token = localStorage.getItem('sylithe_token');
    if (!token) return;
    try {
      const res = await api.getProject(token, projectId);
      if (res.status === 'success' && res.project.geojson) {
        setGeojsonData(res.project.geojson);
        setActiveAoiIndex('all');
        setFreeScanResult(null);
      }
    } catch (e) { console.error(e); }
  };

  const displayedGeojson = useMemo(() => {
    if (!geojsonData || activeAoiIndex === 'all') return geojsonData;
    if (geojsonData.type === 'FeatureCollection' && geojsonData.features) {
      return { ...geojsonData, features: [geojsonData.features[activeAoiIndex]] };
    }
    return geojsonData;
  }, [geojsonData, activeAoiIndex]);

  const aoiStats = useMemo(() => computeGeoJSONStats(displayedGeojson), [displayedGeojson]);

  // Persistence
  useEffect(() => localStorage.setItem(getLsKey('syl_dev_step'), step), [step]);
  useEffect(() => localStorage.setItem(getLsKey('syl_dev_data'), JSON.stringify(projectData)), [projectData]);
  useEffect(() => localStorage.setItem(getLsKey('syl_dev_result'), showResult), [showResult]);
  useEffect(() => {
    try {
      if (!geojsonData) { localStorage.removeItem(getLsKey('syl_dev_geojson')); return; }
      const str = JSON.stringify(geojsonData);
      // Skip persisting very large boundaries — serializing/storing MBs blocks the
      // main thread and can blow the localStorage quota. It re-fetches on select anyway.
      if (str.length > 1_000_000) { localStorage.removeItem(getLsKey('syl_dev_geojson')); return; }
      localStorage.setItem(getLsKey('syl_dev_geojson'), str);
    } catch { /* quota / serialization issues are non-critical */ }
  }, [geojsonData]);
  useEffect(() => localStorage.setItem(getLsKey('syl_dev_filefmt'), fileFormat), [fileFormat]);

  const handleInputChange = (e) => setProjectData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileUpload = async (e) => {
    const filesList = Array.from(e.target.files); if (!filesList.length) return;
    // Lifetime quota gate — 3 free AOI imports per user.
    const gate = await consumeFeature('aoi_import');
    if (gate.limitReached) {
      setParseError('You have used all 3 free AOI imports. Request Full dMRV access to continue.');
      e.target.value = '';
      return;
    }
    setFile(filesList.length > 1 ? { name: `${filesList.length} files selected` } : filesList[0]);
    setIsParsing(true); setGeojsonData(null); setGeorasterData(null); setParseError(''); setJustUploaded(false);
    try {
      if (filesList.length > 1) {
        setFileFormat('Shapefile (multi-file)');
        const shpParts = {}; let prjText = null;
        for (const f of filesList) { const ext = f.name.split('.').pop().toLowerCase(); if (ext === 'shp') shpParts.shp = await f.arrayBuffer(); else if (ext === 'dbf') shpParts.dbf = await f.arrayBuffer(); else if (ext === 'prj') prjText = await f.text(); }
        if (shpParts.shp) { const shapes = parseShp(shpParts.shp, prjText || false); const dbfRows = shpParts.dbf ? parseDbf(shpParts.dbf) : undefined; setGeojsonData(combine([shapes, dbfRows])); setJustUploaded(true); } else setParseError('No .shp file found.');
      } else {
        const uf = filesList[0]; const ext = uf.name.split('.').pop().toLowerCase();
        if (ext === 'zip') { setFileFormat('Shapefile (ZIP)'); setGeojsonData(await shp(await uf.arrayBuffer())); setJustUploaded(true); }
        else if (ext === 'shp') { setFileFormat('Shapefile (.shp)'); setGeojsonData(combine([parseShp(await uf.arrayBuffer(), false), undefined])); setJustUploaded(true); }
        else if (ext === 'geojson' || ext === 'json') { setFileFormat('GeoJSON'); setGeojsonData(JSON.parse(await uf.text())); setJustUploaded(true); }
        else if (ext === 'kml') { setFileFormat('KML'); const doc = new DOMParser().parseFromString(await uf.text(), 'text/xml'); setGeojsonData(kml(doc)); setJustUploaded(true); }
        else if (ext === 'tif' || ext === 'tiff') { setFileFormat('GeoTIFF'); setGeorasterData(await parseGeoraster(await uf.arrayBuffer())); setJustUploaded(true); }
        else setParseError(`Unsupported: .${ext}`);
      }
    } catch (err) { setParseError(`Parse error: ${err.message || 'Unknown'}`); } finally { setIsParsing(false); }
  };

  const clearPersistence = () => { ['syl_dev_step', 'syl_dev_data', 'syl_dev_result', 'syl_dev_geojson', 'syl_dev_filefmt'].forEach(k => localStorage.removeItem(getLsKey(k))); window.location.reload(); };
  const nextStep = () => setStep(p => p + 1);
  const prevStep = () => setStep(p => p - 1);
  const handleSubmit = () => { setIsSubmitting(true); setTimeout(() => { setIsSubmitting(false); setShowResult(true); }, 2000); };
  // Every field in the Add Project form is mandatory.
  // Baseline Scenario / Monitoring Plan and Project Description are optional.
  const REQUIRED_FIELDS = [
    'name', 'proponent', 'country', 'state', 'district', 'type', 'area',
    'creditingStandard', 'methodology', 'startDate', 'creditStart', 'creditEnd',
    'projectLength', 'ccpEligible', 'landTenure', 'communityBenefit',
    'biodiversityImpact', 'leakageRisk',
  ];
  const missingFields = REQUIRED_FIELDS.filter((f) => String(projectData[f] ?? '').trim() === '');
  const isStep1Valid = missingFields.length === 0;

  const handleGeeMapReady = (tileUrl, tileType) => {
    setGeeTileLayer({ url: tileUrl, type: tileType });
  };

  /* ═══ RENDER: POST-SUBMISSION VIEW (Carbon Direct style) ═══ */
  const renderProjectOverview = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Header with FY selector + status */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-[#191919]">{projectData.name || 'Untitled Project'}</h1>
            <span className="px-3 py-1 bg-[#B3542F] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedFY} onChange={(e) => setSelectedFY(e.target.value)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-semibold outline-none">
              <option value="2026">FY 2026</option><option value="2025">FY 2025</option><option value="2024">FY 2024</option>
            </select>
            <button onClick={() => { setShowResult(false); setStep(1); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-all">Edit Details</button>
            <button onClick={clearPersistence} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><HiTrash size={18} /></button>
          </div>
        </div>

        {/* Metadata badges row */}
        <div className="flex items-center gap-3 flex-wrap">
          {projectData.creditingStandard && <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded border border-gray-200">{projectData.creditingStandard}</span>}
          {projectData.country && <span className="text-[13px] text-gray-500 font-medium">{projectData.country}{projectData.state ? `, ${projectData.state}` : ''}</span>}
          {projectData.type && <><span className="text-gray-300">|</span><span className="text-[13px] text-gray-500 font-medium">{projectData.type}</span></>}
          {projectData.ccpEligible && <><span className="text-gray-300">|</span><span className="text-[13px] text-gray-500 font-medium">CCP Eligible: {projectData.ccpEligible}</span></>}
          {projectData.projectLength && <><span className="text-gray-300">|</span><span className="text-[13px] text-gray-500 font-medium">Project length: {projectData.projectLength}</span></>}
        </div>

      </div>

      {/* Overview Content (Unified) */}
      <div className="p-8">
        <div className="space-y-6">
          {/* 5-Column Project Summary Box (Carbon Direct style) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#191919]">Project Information</h2>
              <button onClick={() => { setStep(1); setShowResult(false); }} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 bg-white">
                Edit Details ↗
              </button>
            </div>

            <div className="grid grid-cols-5 divide-x divide-gray-100">
              {/* Est. Yield */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Total Area
                  </div>
                  <div className="text-[28px] font-bold text-[#191919] mb-2 leading-none">
                    {aoiStats?.areaHa ? Number(aoiStats.areaHa).toLocaleString() : 'TBD'} <span className="text-[18px]">ha</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-dotted border-gray-200 mt-6">
                  <div className="text-[13px] font-bold text-[#191919] mb-0.5">Verified Boundary</div>
                  <div className="text-[12px] text-gray-400 font-medium">{projectData?.country || 'Location TBD'}</div>
                </div>
              </div>

              {/* Est Carbon */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shrink-0" />
                    <span className="text-[11px] font-bold text-[#191919] uppercase tracking-widest">Est. Carbon</span>
                    <HiOutlineInformationCircle className="text-gray-400" size={14} />
                  </div>
                  <div className="text-[28px] font-bold text-[#191919] mb-2 leading-none">
                    {aoiStats?.areaHa ? (aoiStats.areaHa * 4.5).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'} <span className="text-[18px]">t</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-dotted border-gray-200 mt-6">
                  <div className="text-[13px] font-bold text-[#191919] mb-0.5">▲ +4.5 tCO₂e / ha</div>
                  <div className="text-[12px] text-gray-400 font-medium">Estimated average yield</div>
                </div>
              </div>

              {/* Standard */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shrink-0" />
                    <span className="text-[11px] font-bold text-[#191919] uppercase tracking-widest">Standard</span>
                    <HiOutlineInformationCircle className="text-gray-400" size={14} />
                  </div>
                  <div className="text-[24px] font-bold text-[#191919] mb-2 leading-tight">
                    {projectData.creditingStandard || 'VCS'}
                  </div>
                </div>
                <div className="pt-4 border-t border-dotted border-gray-200 mt-6">
                  <div className="text-[13px] font-bold text-[#191919] mb-0.5">CCP Eligible</div>
                  <div className="text-[12px] text-gray-400 font-medium">Under Review</div>
                </div>
              </div>

              {/* Methodology */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] shrink-0" />
                    <span className="text-[11px] font-bold text-[#191919] uppercase tracking-widest">Methodology</span>
                    <HiOutlineInformationCircle className="text-gray-400" size={14} />
                  </div>
                  <div className="text-[24px] font-bold text-[#191919] mb-2 leading-tight">
                    {projectData.type || 'ARR'}
                  </div>
                </div>
                <div className="pt-4 border-t border-dotted border-gray-200 mt-6">
                  <div className="text-[13px] font-bold text-[#191919] mb-0.5">Forestry Tracking</div>
                  <div className="text-[12px] text-gray-400 font-medium">Remote Sensing</div>
                </div>
              </div>

              {/* Project Length */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Crediting Period
                    <HiOutlineInformationCircle className="text-gray-400" size={14} />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[28px] font-bold text-[#191919] leading-none">{projectData.projectLength || '40'}</span>
                    <span className="text-[18px] text-[#191919] font-bold">yrs</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dotted border-gray-200 mt-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] text-gray-400 font-medium">Start:</span>
                    <div className="flex p-0.5 bg-gray-100 rounded border border-gray-200 text-[11px] font-bold overflow-hidden">
                      <button className="px-2 py-0.5 bg-white shadow-sm text-[#191919] rounded">2026</button>
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-400 font-medium mt-1">First issuance: 2031</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {projectData.description && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-[14px] font-bold text-[#191919]">Project Description</h3></div>
              <div className="px-6 py-4"><p className="text-[13px] text-gray-600 leading-relaxed">{projectData.description}</p></div>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 420 }}>
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} maxBounds={[[-90, -180], [90, 180]]} maxBoundsViscosity={1.0}>
              <MapResizeHandler geojsonData={geojsonData} />
              {mapStyle === 'street' ? (
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' maxNativeZoom={19} maxZoom={26} noWrap={true} />
              ) : (
                <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution="&copy; Google" maxNativeZoom={20} maxZoom={26} noWrap={true} />
              )}
              {/* This renders the KML/GeoJSON on the map and zooms to it */}
              <AdvancedMapLayer geojsonData={geojsonData} georasterData={georasterData} />
              {/* Custom Map Toggle */}
              <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-gray-100 flex items-center">
                <button
                  onClick={() => setMapStyle('street')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${mapStyle === 'street' ? 'bg-[#B3542F] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <TbMap2 size={16} />
                  Street
                </button>
                <button
                  onClick={() => setMapStyle('satellite')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${mapStyle === 'satellite' ? 'bg-[#B3542F] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <TbSatellite size={16} />
                  Satellite
                </button>
              </div>
              <AdvancedMapLayer geojsonData={displayedGeojson} georasterData={georasterData} />
              <MapZoomController />
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
                <button onClick={() => window.dispatchEvent(new CustomEvent('zoom-in'))} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center font-bold text-lg hover:bg-gray-50">+</button>
                <button onClick={() => window.dispatchEvent(new CustomEvent('zoom-out'))} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center font-bold text-lg hover:bg-gray-50">−</button>
              </div>
            </MapContainer>
          </div>



          {/* Satellite Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden pb-6 mt-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-bold text-[#191919]">Satellite Analytics (GEE)</h3>
              <div className="flex gap-4 items-center">
                {geojsonData?.type === "FeatureCollection" && geojsonData.features.length > 1 && (
                  <select
                    value={activeAoiIndex}
                    onChange={(e) => { setActiveAoiIndex(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setHasRunAnalytics(false); }}
                    className="border border-gray-300 rounded-[4px] px-2 py-1.5 text-[13px] font-bold text-[#191919] bg-white cursor-pointer hover:bg-gray-50 outline-none focus:border-[#16a34a] shadow-sm uppercase tracking-wider"
                  >
                    <option value="all">ALL AOIS ({geojsonData.features.length})</option>
                    {geojsonData.features.map((f, i) => (
                      <option key={i} value={i}>
                        AOI {i + 1} {f.properties?.name ? `(${f.properties.name})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[11px] font-bold text-[#191919] bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">FY {selectedFY}</span>
                <button
                  onClick={() => setHasRunAnalytics(true)}
                  className="px-4 py-1.5 bg-[#B3542F] text-white font-bold rounded-lg shadow-sm text-[12px] uppercase tracking-wider hover:bg-[#9A4626] transition-colors whitespace-nowrap"
                >
                  Run Analytics
                </button>
              </div>
            </div>
            <div className="px-6">
              {hasRunAnalytics ? (
                <GeeAnalyticsPanel selectedFY={selectedFY} projectGeojson={displayedGeojson} />
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
                  Select an AOI and click "Run Analytics" to fetch satellite data.
                </div>
              )}
            </div>
          </div>

          {/* Land Cover Summary */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-[14px] font-bold text-[#191919]">Land Cover Classification</h3></div>
            <div className="p-6">
              {hasRunAnalytics ? (
                <GeeLandCoverPanel
                  selectedFY={selectedFY}
                  projectGeojson={displayedGeojson}
                  onMapReady={handleGeeMapReady}
                />
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
                  Select an AOI and click "Run Analytics" above to fetch LULC data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══ RENDER: FORM STEPS ═══ */
  const renderFormSteps = () => (
    <div className="max-w-4xl mx-auto py-12 px-6">


      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-2">
            <div className="sm:mx-auto sm:max-w-7xl">
              <h3 className="text-xl font-semibold text-[#191919]">
                Project Details
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Provide comprehensive project information.
              </p>

              <div className="w-full">
                <div className="w-full">
                  <div className="space-y-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-medium text-gray-700">Project Name</Label>
                        <Input id="name" name="name" value={projectData.name} onChange={handleInputChange} placeholder="Amazon Reforestation Initiative" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="proponent" className="font-medium text-gray-700">Organization</Label>
                        <Input id="proponent" name="proponent" value={projectData.proponent} onChange={handleInputChange} placeholder="Sylithe Climate Tech" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="font-medium text-gray-700">Country</Label>
                        <Input id="country" name="country" value={projectData.country} onChange={handleInputChange} placeholder="India" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="font-medium text-gray-700">State / Region</Label>
                        <Input id="state" name="state" value={projectData.state} onChange={handleInputChange} placeholder="Maharashtra" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district" className="font-medium text-gray-700">District</Label>
                        <Input id="district" name="district" value={projectData.district} onChange={handleInputChange} placeholder="Pune" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="type" className="font-medium text-gray-700">Project Type</Label>
                        <Select value={projectData.type} onValueChange={(val) => handleInputChange({ target: { name: 'type', value: val } })}>
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REDD+">REDD+</SelectItem>
                            <SelectItem value="ARR">ARR</SelectItem>
                            <SelectItem value="IFM">IFM</SelectItem>
                            <SelectItem value="Blue Carbon">Blue Carbon</SelectItem>
                            <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                            <SelectItem value="Mangrove Restoration">Mangrove Restoration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="area" className="font-medium text-gray-700">Estimated Area (ha)</Label>
                        <Input id="area" name="area" type="number" value={projectData.area} onChange={handleInputChange} placeholder="5000" />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Certifications and Methodologies */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="creditingStandard" className="font-medium text-gray-700">Crediting Standard</Label>
                        <Select value={projectData.creditingStandard} onValueChange={(val) => handleInputChange({ target: { name: 'creditingStandard', value: val } })}>
                          <SelectTrigger id="creditingStandard">
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Verra VCS">Verra VCS</SelectItem>
                            <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                            <SelectItem value="Plan Vivo">Plan Vivo</SelectItem>
                            <SelectItem value="ICVCM">ICVCM</SelectItem>
                            <SelectItem value="CDM">CDM</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="methodology" className="font-medium text-gray-700">Methodology</Label>
                        <Input id="methodology" name="methodology" value={projectData.methodology} onChange={handleInputChange} placeholder="VM0007, AR-ACM0003" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="font-medium text-gray-700">Start Date</Label>
                        <Input id="startDate" name="startDate" type="date" value={projectData.startDate} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="creditStart" className="font-medium text-gray-700">Crediting Start</Label>
                        <Input id="creditStart" name="creditStart" type="date" value={projectData.creditStart} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="creditEnd" className="font-medium text-gray-700">Crediting End</Label>
                        <Input id="creditEnd" name="creditEnd" type="date" value={projectData.creditEnd} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="projectLength" className="font-medium text-gray-700">Length (years)</Label>
                        <Input id="projectLength" name="projectLength" value={projectData.projectLength} onChange={handleInputChange} placeholder="30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ccpEligible" className="font-medium text-gray-700">CCP Eligible</Label>
                        <Select value={projectData.ccpEligible} onValueChange={(val) => handleInputChange({ target: { name: 'ccpEligible', value: val } })}>
                          <SelectTrigger id="ccpEligible">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Pending">Pending Assessment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landTenure" className="font-medium text-gray-700">Land Tenure</Label>
                        <Select value={projectData.landTenure} onValueChange={(val) => handleInputChange({ target: { name: 'landTenure', value: val } })}>
                          <SelectTrigger id="landTenure">
                            <SelectValue placeholder="Select tenure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Private">Private</SelectItem>
                            <SelectItem value="Government">Government</SelectItem>
                            <SelectItem value="Community">Community</SelectItem>
                            <SelectItem value="Leased">Leased</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Impact and Risk */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="communityBenefit" className="font-medium text-gray-700">Community Benefit</Label>
                        <Select value={projectData.communityBenefit} onValueChange={(val) => handleInputChange({ target: { name: 'communityBenefit', value: val } })}>
                          <SelectTrigger id="communityBenefit">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="biodiversityImpact" className="font-medium text-gray-700">Biodiversity</Label>
                        <Select value={projectData.biodiversityImpact} onValueChange={(val) => handleInputChange({ target: { name: 'biodiversityImpact', value: val } })}>
                          <SelectTrigger id="biodiversityImpact">
                            <SelectValue placeholder="Select impact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High Positive">High Positive</SelectItem>
                            <SelectItem value="Moderate Positive">Moderate</SelectItem>
                            <SelectItem value="Neutral">Neutral</SelectItem>
                            <SelectItem value="Negative Risk">Negative Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leakageRisk" className="font-medium text-gray-700">Leakage Risk</Label>
                        <Select value={projectData.leakageRisk} onValueChange={(val) => handleInputChange({ target: { name: 'leakageRisk', value: val } })}>
                          <SelectTrigger id="leakageRisk">
                            <SelectValue placeholder="Select risk" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Not Assessed">Not Assessed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="baselineScenario" className="font-medium text-gray-700">Baseline Scenario / Monitoring Plan <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input id="baselineScenario" name="baselineScenario" value={projectData.baselineScenario} onChange={handleInputChange} placeholder="Baseline scenario description" />
                          <Input id="monitoringPlan" name="monitoringPlan" value={projectData.monitoringPlan} onChange={handleInputChange} placeholder="Monitoring plan summary" />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="description" className="font-medium text-gray-700">Project Description <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={projectData.description}
                          onChange={handleInputChange}
                          placeholder="Briefly describe the project: objectives, location, expected impact, and methodology notes."
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <Separator className="my-10" />
              <div className="flex items-center justify-end space-x-4">
                {!isStep1Valid && (
                  <p className="text-[12px] font-medium text-amber-600 mr-auto">All fields are required — {missingFields.length} field{missingFields.length === 1 ? '' : 's'} left to complete.</p>
                )}
                <Button variant="ghost" onClick={clearPersistence} className="text-gray-500 font-bold hover:text-red-600">Cancel</Button>
                <Button onClick={nextStep} disabled={!isStep1Valid} className="px-8 shadow-lg bg-[#B3542F] hover:bg-[#9A4626] text-white rounded-xl font-bold">Next Step <HiChevronRight strokeWidth={2} className="ml-1" /></Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-2">
            <div className="sm:mx-auto sm:max-w-7xl">
              <h3 className="text-xl font-semibold text-[#191919]">Project Boundary (AOI)</h3>
              <p className="text-muted-foreground text-sm mb-6">Upload your project area of interest.</p>

              {/* ── Upload Card (FileUploadCard style) ── */}
              <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                    <UploadCloud className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-semibold text-[#191919] leading-tight">Upload boundary file</h4>
                    <p className="text-[13px] text-gray-400 mt-0.5">Select and upload the spatial file for your project area</p>
                  </div>
                </div>

                {/* Supported Formats */}
                <div className="px-6 pt-5 flex flex-wrap gap-2">
                  {[{ label: 'KML', ext: '.kml' }, { label: 'GeoJSON', ext: '.geojson' }, { label: 'Shapefile', ext: '.shp+.dbf+.prj' }, { label: 'ZIP', ext: '.zip' }, { label: 'GeoTIFF', ext: '.tif/.tiff' }].map(f => (
                    <span key={f.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      {f.label}
                      <span className="font-normal text-gray-400 normal-case">{f.ext}</span>
                    </span>
                  ))}
                </div>

                {/* Drop Zone */}
                <div className="px-6 pt-4 pb-6">
                  <div
                    className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${isParsing
                      ? 'border-gray-300 bg-gray-50/50'
                      : justUploaded && (geojsonData || georasterData) && !parseError
                        ? 'border-gray-300 bg-gray-50/30 cursor-pointer'
                        : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/40 cursor-pointer'
                      }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".kml,.geojson,.json,.tiff,.tif,.zip,.shp,.shx,.dbf,.prj"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-4 transition-all ${isParsing ? 'bg-gray-100' :
                        justUploaded && (geojsonData || georasterData) ? 'bg-gray-100' : 'bg-gray-100'
                        }`}>
                        {isParsing
                          ? <div className="w-6 h-6 border-[3px] border-gray-400 border-t-[#08292F] rounded-full animate-spin" />
                          : justUploaded && (geojsonData || georasterData) && !parseError
                            ? <CheckCircle2 className="w-7 h-7 text-[#191919]" />
                            : <UploadCloud className="w-7 h-7 text-gray-400" />
                        }
                      </div>
                      <p className="text-[14px] font-semibold text-[#191919] mb-1">
                        {isParsing
                          ? 'Analyzing file…'
                          : justUploaded && (geojsonData || georasterData) && !parseError
                            ? 'File uploaded — click or drag to replace'
                            : 'Choose a file or drag & drop it here'
                        }
                      </p>
                      <p className="text-[12px] text-gray-400 mb-4">
                        {isParsing
                          ? 'Please wait while we parse your boundary data'
                          : 'KML, GeoJSON, Shapefile (ZIP), GeoTIFF — up to 100 MB'
                        }
                      </p>
                      {!isParsing && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 shadow-sm pointer-events-none">
                          Browse File
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parse Error */}
                  {parseError && (
                    <div className="mt-3 flex items-start gap-2.5 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                      <HiExclamationCircle size={17} className="shrink-0 mt-0.5" />
                      <span className="text-[13px] font-medium">{parseError}</span>
                    </div>
                  )}
                </div>

                {/* File Row + Stats — shown only after fresh upload */}
                {justUploaded && !isParsing && (geojsonData || georasterData) && !parseError && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-gray-100"
                    >
                      {/* File row */}
                      <div className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 shrink-0">
                          <FileCode2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#191919] truncate">{file?.name}</p>
                          <p className="text-[12px] text-gray-400 mt-0.5">
                            {fileFormat} &nbsp;·&nbsp; Parsed successfully
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#191919] shrink-0" />
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100">
                        <div className="px-6 py-4 flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Area
                          </span>
                          <span className="text-[16px] font-bold text-[#191919] leading-snug tracking-tight">
                            {aoiStats ? `${Number(aoiStats.areaHa).toLocaleString()} ha` : 'Raster loaded'}
                          </span>
                        </div>
                        <div className="px-6 py-4 flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Hash className="w-3 h-3" /> Features
                          </span>
                          <span className="text-[16px] font-bold text-[#191919] leading-snug tracking-tight">
                            {aoiStats?.featureCount ?? '—'}
                          </span>
                        </div>
                        <div className="px-6 py-4 flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileCode2 className="w-3 h-3" /> Format
                          </span>
                          <span className="text-[16px] font-bold text-[#191919] leading-snug tracking-tight">
                            {fileFormat || '—'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              <Separator className="my-10" />
              <div className="flex items-center justify-end space-x-4">
                <Button variant="ghost" onClick={prevStep} className="text-gray-500 font-bold hover:text-[#191919]">Back</Button>
                <Button onClick={nextStep} disabled={!file || isParsing} className="px-8 shadow-lg bg-[#B3542F] hover:bg-[#9A4626] text-white rounded-xl font-bold">Proceed to Review <HiChevronRight strokeWidth={2} className="ml-1" /></Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-2">
            <div className="sm:mx-auto sm:max-w-7xl">
              <h3 className="text-xl font-semibold text-[#191919]">Final Review</h3>
              <p className="text-muted-foreground text-sm mb-6">Review your project details before submitting.</p>

              <div className="space-y-4">

                {/* ── Project Information Card ── */}
                <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                      <FileText className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-semibold text-[#191919] leading-tight">Project Information</h4>
                      <p className="text-[13px] text-gray-400 mt-0.5">Summary of all entered project details</p>
                    </div>
                  </div>

                  {/* Two-column detail grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    {/* Left column */}
                    <div className="divide-y divide-gray-100">
                      {[
                        { l: 'Project Name', v: projectData.name },
                        { l: 'Project Type', v: projectData.type },
                        { l: 'Crediting Standard', v: projectData.creditingStandard },
                        { l: 'Methodology', v: projectData.methodology },
                        { l: 'Proponent', v: projectData.proponent },
                        { l: 'Start Date', v: projectData.startDate },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                          <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wide shrink-0 w-2/5">{r.l}</span>
                          <span className="text-[13px] font-semibold text-[#191919] text-right truncate max-w-[55%]">{r.v || '—'}</span>
                        </div>
                      ))}
                    </div>
                    {/* Right column */}
                    <div className="divide-y divide-gray-100">
                      {[
                        { l: 'Country', v: projectData.country },
                        { l: 'State / Region', v: projectData.state },
                        { l: 'District', v: projectData.district },
                        { l: 'CCP Eligible', v: projectData.ccpEligible },
                        { l: 'Land Tenure', v: projectData.landTenure },
                        { l: 'Project Length', v: projectData.projectLength ? `${projectData.projectLength} years` : '—' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                          <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wide shrink-0 w-2/5">{r.l}</span>
                          <span className="text-[13px] font-semibold text-[#191919] text-right truncate max-w-[55%]">{r.v || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Boundary File Card ── */}
                <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                      <FileCode2 className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-semibold text-[#191919] leading-tight">Boundary File</h4>
                      <p className="text-[13px] text-gray-400 mt-0.5">Uploaded spatial boundary for the project area</p>
                    </div>
                  </div>

                  {/* File row */}
                  <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 shrink-0">
                      <FileCode2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#191919] truncate">{file?.name || 'From previous session'}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        {fileFormat || 'Spatial file'}&nbsp;·&nbsp;Ready for submission
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#191919] shrink-0" />
                  </div>

                  {/* AOI Stats row */}
                  {aoiStats && (
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                      <div className="px-6 py-4 flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> Area
                        </span>
                        <span className="text-[16px] font-bold text-[#191919] leading-snug tracking-tight">
                          {Number(aoiStats.areaHa).toLocaleString()} ha
                        </span>
                      </div>
                      <div className="px-6 py-4 flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Hash className="w-3 h-3" /> Features
                        </span>
                        <span className="text-[16px] font-bold text-[#191919] leading-snug tracking-tight">
                          {aoiStats.featureCount}
                        </span>
                      </div>
                      <div className="px-6 py-4 flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <FileCode2 className="w-3 h-3" /> Format
                        </span>
                        <span className="text-[16px] font-bold text-[#191919] leading-snug tracking-tight">
                          {fileFormat || '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <Separator className="my-10" />
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={prevStep} className="text-gray-500 font-bold hover:text-[#191919]">Back</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 shadow-lg bg-[#B3542F] hover:bg-[#9A4626] text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {isSubmitting ? 'Processing…' : 'Submit Project'}
                  <HiArrowRight strokeWidth={2} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Evaluate on each render so it reflects any local storage changes
  const isAllowed = true;
  // ── Helpers: is a known section key? ──
  const SECTIONS = ['land_eligibility', 'lulc_snapshot', 'carbon_estimate', 'tree_inventory', 'chm_report', 'dynamic_baseline', 'biomass_estimation', 'reports_dashboard'];
  const isProjectDetails = !SECTIONS.includes(activeSection);

  return (
    <div className="flex min-h-screen bg-[#F0EEE6] font-sans">
      <SylitheLeftNav activeSection={activeSection} onSectionChange={setActiveSection} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} forceHidden={navCollapsed} />

      <div className={`flex-1 ${navCollapsed ? '' : 'md:ml-[260px]'} flex flex-col min-w-0 transition-[margin] duration-300`}>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-md">
              <TbPlant2 className="text-emerald-600 text-lg" />
            </div>
            <span className="font-bold text-[#191919] text-sm">Developer Tools</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <TbMenu2 size={20} />
          </button>
        </div>

        {/* ── Project Details / Onboarding Redirect ── */}
        <div className="flex-1 flex flex-col" style={{ display: isProjectDetails ? undefined : 'none' }}>
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm text-center">
              <div className="w-16 h-16 bg-[#B3542F]/10 text-[#191919] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h2 className="text-[18px] font-bold text-[#191919] mb-2">Project Registration Moved</h2>
              <p className="text-[13px] text-gray-500 mb-6">
                Project registration and management has been integrated into the new unified Project Hub.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/project-hub'}
                className="w-full bg-[#B3542F] text-white font-semibold py-2.5 rounded-xl hover:bg-[#9A4626] transition-colors text-[13px]"
              >
                Go to Project Hub
              </button>
            </div>
          </div>
        </div>

        {/* ── Free Features ── */}
        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'land_eligibility' ? undefined : 'none' }}>
          <FreeLandEligibility
            projectData={projectData}
            geojsonData={geojsonData}
            activeAoiIndex={activeAoiIndex}
            onAoiChange={setActiveAoiIndex}
            onSectionChange={setActiveSection}
            onScanComplete={(result, gj) => { setFreeScanResult(result); if (gj) setFreeScanGeojson(gj); }}
            savedProjects={savedProjects}
            onProjectSelect={handleProjectSelect}
            onToggleNav={() => setNavCollapsed((c) => !c)}
            navCollapsed={navCollapsed}
          />
        </div>
        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'lulc_snapshot' ? undefined : 'none' }}>
          <FreeLulcSnapshot freeScanResult={freeScanResult} freeScanGeojson={freeScanGeojson || geojsonData} onSectionChange={setActiveSection} projectData={projectData} />
        </div>
        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'carbon_estimate' ? undefined : 'none' }}>
          <FreeCarbonEstimate freeScanResult={freeScanResult} onSectionChange={setActiveSection} />
        </div>
        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'tree_inventory' ? undefined : 'none' }}>
          <FreeTreeInventory savedProjects={savedProjects} onSectionChange={setActiveSection} />
        </div>

        {/* ── Paid Verification sections ── */}
        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'land_eligibility_paid' ? undefined : 'none' }}>
          <LandEligibilityPage projectData={projectData} geojsonData={geojsonData} activeAoiIndex={activeAoiIndex} onAoiChange={setActiveAoiIndex} onReturn={() => setActiveSection('project_details')} savedProjects={savedProjects} onProjectSelect={handleProjectSelect} />
        </div>

        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'chm_report' ? undefined : 'none' }}>
          <CHMReportPage projectData={projectData} geojsonData={geojsonData} activeAoiIndex={activeAoiIndex} onAoiChange={setActiveAoiIndex} onReturn={() => setActiveSection('project_details')} savedProjects={savedProjects} onProjectSelect={handleProjectSelect} />
        </div>

        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'dynamic_baseline' ? undefined : 'none' }}>
          <DynamicBaselinePage />
        </div>

        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'biomass_estimation' ? undefined : 'none' }}>
          <BiomassEstimationPage />
        </div>

        <div className="flex-1 flex flex-col" style={{ display: activeSection === 'reports_dashboard' ? undefined : 'none' }}>
          <ReportsDashboard projectData={projectData} />
        </div>

      </div>
    </div>
  );
};

export default DeveloperDashboard;
