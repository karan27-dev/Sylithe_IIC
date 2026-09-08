import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers, TreePine, Flame, Zap, ArrowLeft, ChevronRight,
  Info, AlertTriangle, CheckCircle2, Eye, EyeOff, Lock, ArrowRight,
  FileText, Loader2, Download
} from 'lucide-react';
import UpgradeModal from '../../components/UpgradeModal';
import { useAuth } from '../../context/AuthContext';
import { getLulcReportQuota, requestLulcReport } from '../../services/freeScanApi';
import { generateLulcReportPdf } from '../../services/lulcReportPdf';

/* ─── Map helpers ──────────────────────────────────── */
const MapResizer = ({ gj }) => {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    if (!el) return;
    const run = () => {
      map.invalidateSize({ animate: false });
      if (gj) {
        try {
          const b = L.geoJSON(gj).getBounds();
          if (b.isValid()) map.fitBounds(b, { padding: [60, 60], maxZoom: 15, animate: false });
        } catch { }
      }
    };
    const obs = new ResizeObserver(run);
    obs.observe(el);
    const ts = [60, 250, 600, 1200].map(ms => setTimeout(run, ms));
    return () => { obs.disconnect(); ts.forEach(clearTimeout); };
  }, [map, gj]);
  return null;
};

/* ─── Helpers ──────────────────────────────────────── */
const fmt = n => Number(n).toLocaleString('en-IN');
const fmtN = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n));

const RISK = {
  low: { label: 'Low Risk', bg: 'bg-emerald-500', text: 'text-emerald-700', pill: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium Risk', bg: 'bg-amber-400', text: 'text-amber-700', pill: 'bg-amber-100 text-amber-700' },
  high: { label: 'High Risk', bg: 'bg-red-500', text: 'text-red-700', pill: 'bg-red-100 text-red-700' },
};

const ELIGIBLE_CLASSES = new Set(['Crops', 'Grass', 'Shrub & Scrub', 'Bare Ground']);
const INELIGIBLE_CLASSES = new Set(['Built Area', 'Snow & Ice']);

/* ═══════════════════════════════════════════════════
   LULC SNAPSHOT — full page
   ═══════════════════════════════════════════════════ */
export default function FreeLulcSnapshot({ freeScanResult, freeScanGeojson, onSectionChange, projectData = {} }) {
  const [showTile, setShowTile] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { token } = useAuth();
  const res = freeScanResult;

  // ── LULC report (lifetime quota of 3) ──
  const [remaining, setRemaining] = useState(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    if (!token) return;
    let alive = true;
    getLulcReportQuota(token)
      .then((q) => { if (alive) setRemaining(q.remaining); })
      .catch(() => {});
    return () => { alive = false; };
  }, [token]);

  const handleDownloadReport = async () => {
    if (!res || reportBusy) return;
    setReportBusy(true);
    setReportError('');
    try {
      const out = await requestLulcReport(token, {
        geojson: freeScanGeojson,
        project_name: projectData?.name || 'Untitled Project',
        area_ha: res.area_ha,
      });
      generateLulcReportPdf({
        project: projectData,
        scan: res,
        geojson: freeScanGeojson,
        images: out.images || {},
      });
      setRemaining(out.remaining);
    } catch (err) {
      if (err.status === 429) {
        setRemaining(0);
        setReportError('You have used all 3 free reports. Upgrade for unlimited reports.');
      } else if (err.status === 503) {
        setReportError('Report engine is warming up — please try again in a moment.');
      } else {
        setReportError(err.message || 'Could not generate the report. Please try again.');
      }
    } finally {
      setReportBusy(false);
    }
  };

  /* ── Empty state ── */
  if (!res) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F8FAFB]">
        <Header area={null} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Layers size={34} className="text-blue-500" />
            </div>
            <h2 className="text-[18px] font-black text-[#0F172A] mb-2">No scan results yet</h2>
            <p className="text-[13px] text-gray-400 mb-7 max-w-xs leading-relaxed mx-auto">
              Run a Land Eligibility scan first to see your land use &amp; land cover classification.
            </p>
            <button onClick={() => onSectionChange?.('land_eligibility')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#08292F] text-white font-bold rounded-xl text-[13px] hover:bg-[#062125] transition-colors shadow-sm">
              <ArrowLeft size={14} /> Run Land Eligibility
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lulcAll = Object.entries(res.lulc).sort(([, a], [, b]) => b.pct - a.pct);
  const lulcVis = lulcAll.filter(([, v]) => v.pct > 0.3);

  const eligibleHa = lulcVis.filter(([n]) => ELIGIBLE_CLASSES.has(n)).reduce((s, [, v]) => s + v.ha, 0);
  const ineligibleHa = lulcVis.filter(([n]) => INELIGIBLE_CLASSES.has(n)).reduce((s, [, v]) => s + v.ha, 0);
  const forestHa = res.lulc['Trees']?.ha || 0;

  // Proper dMRV logic: Deduct a standard 5% buffer for setbacks, infrastructure, and water bodies.
  // Carbon projects cannot realistically have 100% eligible area due to boundary constraints.
  const rawPct = Math.round(eligibleHa / res.area_ha * 100);
  const eligiblePct = rawPct > 0 ? Math.max(1, Math.min(95, rawPct - 5)) : 0;
  const risk = RISK[res.forest.deforestation_risk] || RISK.low;

  return (
    <div className="relative h-full w-full overflow-hidden">

      {/* BACKGROUND MAP — full screen */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl
          attributionControl={false}
        >
          <MapResizer gj={freeScanGeojson} />
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            maxNativeZoom={20} maxZoom={26} noWrap
          />
          {showTile && (
            res.lulc_layers?.length
              ? res.lulc_layers.map((l) => (
                  <TileLayer key={l.name} url={l.url} opacity={0.78} maxZoom={26} />
                ))
              : res.lulc_tile_url && (
                  <TileLayer url={res.lulc_tile_url} opacity={0.72} maxZoom={26} />
                )
          )}
          {showTrees && res.tree_layers?.map((l) => (
            <TileLayer key={l.name} url={l.url} opacity={0.9} maxZoom={26} />
          ))}
          {freeScanGeojson && (
            <GeoJSON
              key={JSON.stringify(freeScanGeojson).slice(0, 60)}
              data={freeScanGeojson}
              style={{ color: '#ffffff', weight: 2.5, fillOpacity: 0 }}
            />
          )}
        </MapContainer>
      </div>

      {/* GLASSMORPHIC LEFT SIDEBAR */}
      <div className="absolute top-0 left-0 bottom-0 w-[380px] z-10 flex flex-col bg-white/75 backdrop-blur-xl border-r border-white/40 shadow-[12px_0_40px_rgba(0,0,0,0.1)] overflow-hidden">

        {/* Header */}
        <Header area={res.area_ha} />
        <div className="flex-1 overflow-y-auto">

          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-px border-b border-white/30">
            {[
              { label: 'Total Area', value: `${fmt(res.area_ha)} ha`, color: 'text-[#0F172A]' },
              { label: 'Tree Cover', value: `${res.forest.cover_pct}%`, color: 'text-emerald-700' },
              { label: 'Eligible Land', value: `${eligiblePct}%`, color: 'text-blue-700' },
              { label: 'Defor. Risk', value: risk.label, color: risk.text },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/20 px-4 py-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-[18px] font-black leading-none ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Download Verra report */}
          <div className="px-5 py-4 border-b border-white/30">
            <button
              onClick={handleDownloadReport}
              disabled={reportBusy || remaining === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#08292F] hover:bg-[#062125] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-[13px] transition-all active:scale-[0.98] shadow-sm">
              {reportBusy
                ? <><Loader2 size={15} className="animate-spin" /> Generating report…</>
                : <><FileText size={15} /> Download Verra LULC Report <Download size={14} /></>}
            </button>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10.5px] text-gray-500">
                Verra-aligned PDF · LULC &amp; eligibility
              </p>
              {remaining !== null && (
                <span className={`text-[10.5px] font-bold ${remaining === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {remaining} of 3 left
                </span>
              )}
            </div>
            {reportError && (
              <p className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 leading-snug">
                {reportError}
              </p>
            )}
          </div>

          {/* Land cover breakdown */}
          <div className="px-5 py-4 border-b border-white/30">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Land Cover Breakdown</p>
            <div className="space-y-3">
              {lulcVis.map(([name, v], i) => {
                const isElig = ELIGIBLE_CLASSES.has(name);
                return (
                  <motion.div key={name}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
                        <span className="text-[12px] font-semibold text-[#0F172A] leading-none">{name}</span>
                        {isElig && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded uppercase tracking-wide">Carbon</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">{fmt(v.ha)} ha</span>
                        <span className="text-[12px] font-bold text-[#0F172A] w-9 text-right">{v.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${v.pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + i * 0.04 }}
                        className="h-full rounded-full" style={{ background: v.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Forest + deforestation */}
          <div className="px-5 py-4 border-b border-white/30">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Sylithe ForestWatch Intelligence</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TreePine size={14} className="text-emerald-600" />
                  <span className="text-[12px] font-semibold text-gray-700">Tree Cover</span>
                </div>
                <span className="text-[14px] font-black text-emerald-700">{res.forest.cover_pct}%</span>
              </div>
              {res.forest.loss_ha_10yr > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-red-500" />
                    <span className="text-[12px] font-semibold text-gray-700">10-yr Forest Loss</span>
                  </div>
                  <span className="text-[14px] font-black text-red-600">{fmtN(res.forest.loss_ha_10yr)} ha</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-[12px] font-semibold text-gray-700">Deforestation Risk</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${risk.pill}`}>{risk.label}</span>
              </div>
            </div>
          </div>

          {/* Eligible vs Ineligible */}
          <div className="px-5 py-4 border-b border-white/30">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Carbon Project Classification</p>
            <div className="space-y-2">
              {/* Forest */}
              {forestHa > 1 && (
                <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-[#397D49] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-emerald-800">Trees / Forest (REDD+ · IFM)</p>
                  </div>
                  <span className="text-[12px] font-black text-emerald-700">{fmt(Math.round(forestHa))} ha</span>
                </div>
              )}
              {/* Eligible */}
              {lulcVis.filter(([n]) => ELIGIBLE_CLASSES.has(n)).map(([name, v]) => (
                <div key={name} className="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: v.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-blue-800">{name} <span className="font-normal text-blue-600">(ARR · Agroforestry)</span></p>
                  </div>
                  <span className="text-[12px] font-black text-blue-700">{fmt(v.ha)} ha</span>
                </div>
              ))}
              {/* Ineligible */}
              {lulcVis.filter(([n]) => INELIGIBLE_CLASSES.has(n)).map(([name, v]) => (
                <div key={name} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="flex-1 text-[12px] font-semibold text-gray-500">{name}</span>
                  <span className="text-[12px] font-black text-gray-500">{fmt(v.ha)} ha</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source note */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                <span className="font-bold">Sylithe LandScan AI</span> · 10 m near-real-time classification from
                multi-spectral satellite imagery, updated weekly. Deforestation monitoring by{' '}
                <span className="font-bold">Sylithe ForestWatch</span> with annual change detection since 2000.
              </p>
            </div>
          </div>

        </div>

        {/* Upgrade CTA */}
        <div className="shrink-0 border-t border-white/20 p-4 bg-[#08292F]/90 backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-2">
            <Lock size={11} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Sylithe Verified</span>
          </div>
          <p className="text-[12px] text-gray-300 leading-snug mb-3">
            Unlock 1 m LULC, AGB mapping, certified dMRV reports & registry submission support.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowUpgrade(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-[12px] transition-all active:scale-95">
              Get Full Access <ArrowRight size={12} />
            </button>
            <button onClick={() => setShowUpgrade(true)}
              className="px-3 py-2.5 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold rounded-xl text-[12px] transition-all whitespace-nowrap active:scale-95">
              Talk to us
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="shrink-0 border-t border-white/30 p-4 bg-white/30">
          <button onClick={() => onSectionChange?.('carbon_estimate')}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group">
            <span className="text-lg">🌿</span>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-bold text-[#0F172A] leading-none mb-0.5">View Carbon Estimate</p>
              <p className="text-[11px] text-gray-400">Carbon stock &amp; market value</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>

      {/* MAP OVERLAYS */}

      {/* Map layer toggles (top-right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
        <button onClick={() => setShowTile(v => !v)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shadow-md border text-[12px] font-bold backdrop-blur-sm transition-colors ${showTile ? 'bg-[#08292F]/90 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-gray-700'}`}>
          {showTile ? <Eye size={13} /> : <EyeOff size={13} />}
          {showTile ? 'LULC overlay ON' : 'LULC overlay OFF'}
        </button>
        {res.tree_layers?.length > 0 && (
          <button onClick={() => setShowTrees(v => !v)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shadow-md border text-[12px] font-bold backdrop-blur-sm transition-colors ${showTrees ? 'bg-emerald-600/90 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-gray-700'}`}>
            {showTrees ? <Eye size={13} /> : <EyeOff size={13} />}
            <TreePine size={13} />
            {showTrees ? 'Tree layer ON' : 'Tree layer OFF'}
          </button>
        )}
      </div>

      {/* Colour legend overlay */}
      {lulcVis.length > 0 && (
        <div className="absolute bottom-3 left-[412px] z-[1000] bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5 max-w-sm">
          {lulcVis.map(([name, v]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
              <span className="text-[11px] text-white/80 font-medium">{name}</span>
              <span className="text-[10px] text-white/50">{v.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Sylithe badge */}
      <div className="absolute top-3 left-[412px] z-[1000]">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
          <Layers size={11} className="text-emerald-400" />
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Sylithe LandScan AI</span>
        </div>
      </div>

    </div>
  );
}

function Header({ area }) {
  return (
    <div className="bg-white/30 border-b border-white/30 px-6 py-4 flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2.5">
        <Layers size={18} className="text-blue-600" />
        <h1 className="text-[17px] font-bold text-[#0F172A]">LULC Snapshot</h1>
      </div>
      <span className="px-2.5 py-0.5 bg-emerald-100/80 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
        <Zap size={9} /> Free
      </span>
      {area && <span className="ml-auto text-[12px] text-gray-600">{Number(area).toLocaleString('en-IN')} ha analysed</span>}
    </div>
  );
}
