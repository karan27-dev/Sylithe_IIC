import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, TrendingUp, ArrowLeft, Zap, Lock,
  CheckCircle2, ArrowRight, BarChart3, Info,
  TreePine, Flame, Globe
} from 'lucide-react';
import UpgradeModal from '../../components/UpgradeModal';

/* ─── Formatters ──────────────────────────────────── */
const fmt  = n => Number(Math.round(n)).toLocaleString('en-IN');
const fmtS = n => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(Math.round(n));

const inrFmt = (tco2, rate) => {
  const v = tco2 * rate / 100000;
  return v >= 100 ? `₹${(v/100).toFixed(1)}Cr` : v >= 1 ? `₹${v.toFixed(1)}L` : `₹${(v*100).toFixed(0)}K`;
};
const usdFmt = (tco2, rate) => {
  const v = tco2 * rate / 1000;
  return v >= 1000 ? `$${(v/1000).toFixed(1)}M` : `$${v.toFixed(0)}K`;
};

const RATES = {
  inr300: { label: '₹300/tCO₂e', sub: 'India VCM floor',      fn: v => inrFmt(v, 300) },
  inr500: { label: '₹500/tCO₂e', sub: 'India premium credit', fn: v => inrFmt(v, 500) },
  usd5:   { label: '$5/tCO₂e',   sub: 'Global voluntary floor',fn: v => usdFmt(v, 5)  },
  usd15:  { label: '$15/tCO₂e',  sub: 'High-quality global',   fn: v => usdFmt(v, 15) },
};

const PROJECT_TYPES = [
  { key: 'REDD+',       icon: '🌳', desc: 'Reducing Emissions from Deforestation', need: r => r.forest.cover_pct >= 20 },
  { key: 'IFM',         icon: '🪵', desc: 'Improved Forest Management',             need: r => r.forest.cover_pct >= 10 },
  { key: 'ARR',         icon: '🌱', desc: 'Afforestation, Reforestation & Revegetation', need: r => (r.lulc['Crops']?.pct||0)+(r.lulc['Grass']?.pct||0)+(r.lulc['Bare Ground']?.pct||0) > 20 },
  { key: 'Agroforestry',icon: '🌾', desc: 'Trees integrated into farming land',    need: r => (r.lulc['Crops']?.pct||0) > 15 },
  { key: 'Blue Carbon', icon: '🌊', desc: 'Mangroves, wetlands & coastal carbon',  need: r => (r.lulc['Flooded Vegetation']?.pct||0) > 5 },
];

/* ═══════════════════════════════════════════════════
   CARBON ESTIMATE — full page
   ═══════════════════════════════════════════════════ */
export default function FreeCarbonEstimate({ freeScanResult, onSectionChange }) {
  const res = freeScanResult;

  // Derive safe values whether or not res exists yet
  const c      = res?.carbon;
  const rw     = useMemo(() => Math.max((c?.total_co2_high || 0) - (c?.total_co2_low || 0), 1), [c]);
  const midPct = useMemo(() => c ? Math.round(((c.total_co2_mid - c.total_co2_low) / rw) * 100) : 50, [c, rw]);

  // ALL hooks before any conditional return
  const [rate, setRate]           = useState('inr300');
  const [sliderPct, setSliderPct] = useState(50);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Sync slider to mid when data first arrives
  React.useEffect(() => { if (c) setSliderPct(midPct); }, [midPct]);

  const sliderCO2 = useMemo(
    () => c ? Math.round((c.total_co2_low || 0) + (rw * sliderPct / 100)) : 0,
    [sliderPct, c, rw]
  );
  const sliderLabel = sliderPct < 33 ? 'Low estimate' : sliderPct < 66 ? 'Mid estimate' : 'High estimate';
  const mid   = c ? Math.round((c.annual_seq_low + c.annual_seq_high) / 2) : 0;
  const types = res ? PROJECT_TYPES.filter(t => t.need(res)) : [];

  /* ── Empty state ── */
  if (!res) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F8FAFB]">
        <Header area={null} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Leaf size={34} className="text-emerald-500" />
            </div>
            <h2 className="text-[18px] font-black text-[#0F172A] mb-2">No scan results yet</h2>
            <p className="text-[13px] text-gray-400 mb-7 max-w-xs leading-relaxed mx-auto">
              Run a Land Eligibility scan first to see the carbon estimate and market value for your land.
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

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F8FAFB]">
      <Header area={res.area_ha} />

      {/* ── Split body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — dark carbon panel */}
        <div className="w-[360px] shrink-0 bg-[#08292F] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* Hero */}
            <div className="px-6 pt-7 pb-5 border-b border-white/10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">
                Total Carbon Stock · <span className="text-emerald-300">{sliderLabel}</span>
              </p>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[48px] font-black text-white leading-none transition-all duration-100">
                  {fmtS(sliderCO2)}
                </span>
                <span className="text-[18px] font-bold text-gray-400">tCO₂e</span>
              </div>
              <p className="text-[12px] text-gray-500 mb-5">
                {fmt(sliderCO2)} tCO₂e &nbsp;·&nbsp;{' '}
                <span className="text-gray-400">
                  range {fmt(c.total_co2_low)} — {fmt(c.total_co2_high)}
                </span>
              </p>

              {/* Slider */}
              <style>{`
                .carbon-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 10px; border-radius: 9999px; outline: none; cursor: pointer; background: linear-gradient(90deg, #166534 0%, #16a34a 50%, #86efac 100%); }
                .carbon-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; border: 3px solid #4ade80; box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: grab; transition: transform 0.1s; }
                .carbon-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.2); }
                .carbon-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #ffffff; border: 3px solid #4ade80; box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: grab; }
              `}</style>
              <div className="relative">
                <input
                  type="range"
                  min={0} max={100} step={1}
                  value={sliderPct}
                  onChange={e => setSliderPct(Number(e.target.value))}
                  className="carbon-slider"
                />
                {/* Tick marks */}
                <div className="flex justify-between mt-1.5 px-0.5">
                  <span className="text-[10px] text-gray-500">Low<br/>{fmtS(c.total_co2_low)}</span>
                  <span className="text-[10px] text-gray-500 text-center">Mid<br/>{fmtS(c.total_co2_mid)}</span>
                  <span className="text-[10px] text-gray-500 text-right">High<br/>{fmtS(c.total_co2_high)}</span>
                </div>
              </div>

              {/* Live market value under slider */}
              <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Market Value (₹300/tCO₂e)</p>
                  <p className="text-[20px] font-black text-emerald-400">{inrFmt(sliderCO2, 300)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">At $15/tCO₂e</p>
                  <p className="text-[20px] font-black text-white">{usdFmt(sliderCO2, 15)}</p>
                </div>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/10">
              {[
                { label: 'Per Hectare',  value: `${c.co2_per_ha}`,        unit: 'tCO₂e/ha' },
                { label: 'Annual Seq.',  value: `${fmtS(mid)}`,           unit: 'tCO₂e/yr' },
                { label: '25-yr Total',  value: `${fmtS(mid * 25)}`,      unit: 'tCO₂e' },
                { label: 'Area',         value: `${fmt(res.area_ha)}`,     unit: 'ha' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-[#08292F] px-5 py-4">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-[20px] font-black text-white leading-none">{value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{unit}</p>
                </div>
              ))}
            </div>

            {/* Eligible project types */}
            {types.length > 0 && (
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Eligible Carbon Projects</p>
                <div className="space-y-2">
                  {types.map(t => (
                    <div key={t.key} className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[18px] shrink-0">{t.icon}</span>
                      <div>
                        <p className="text-[12px] font-bold text-white">{t.key}</p>
                        <p className="text-[10px] text-gray-400 leading-snug">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methodology note */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <Info size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Computed by <span className="text-white font-bold">Sylithe CarbonIQ™</span> using{' '}
                  <span className="text-white font-bold">Sylithe Carbon Protocol SCP-1</span>.
                  Forest 80 tCO₂e/ha · Grass 15 · Cropland 8.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT — market value + projections */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5 max-w-3xl">

            {/* Market value with rate switcher */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-emerald-600" />
                  <h3 className="text-[14px] font-bold text-[#0F172A]">Estimated Market Value</h3>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(RATES).map(([key, r]) => (
                    <button key={key} onClick={() => setRate(key)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${rate === key ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {[
                  { label: 'Conservative', tco2: c.total_co2_low,  note: `${fmt(c.total_co2_low)} tCO₂e` },
                  { label: 'Base Case',    tco2: c.total_co2_mid,  note: `${fmt(c.total_co2_mid)} tCO₂e` },
                  { label: 'Optimistic',   tco2: c.total_co2_high, note: `${fmt(c.total_co2_high)} tCO₂e` },
                ].map(({ label, tco2, note }, i) => (
                  <div key={label} className="px-6 py-6 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-[28px] font-black text-[#0F172A] leading-none mb-1">
                      {RATES[rate].fn(tco2)}
                    </p>
                    <p className="text-[11px] text-gray-400">{note}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{RATES[rate].sub}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400">
                Indicative values based on total carbon stock. Actual credit value depends on methodology, additionality, registry, and market conditions.
              </div>
            </motion.div>

            {/* 25-yr sequestration table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <BarChart3 size={15} className="text-gray-500" />
                <h3 className="text-[14px] font-bold text-[#0F172A]">Sequestration Revenue · 25-Year Crediting Period</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Conservative', seq: c.annual_seq_low,  accent: 'text-gray-700' },
                  { label: 'Base Case',    seq: mid,               accent: 'text-emerald-700' },
                  { label: 'Optimistic',   seq: c.annual_seq_high, accent: 'text-emerald-600' },
                ].map(({ label, seq, accent }) => {
                  const total = seq * 25;
                  return (
                    <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-[13px] font-semibold text-[#0F172A]">{label}</p>
                        <p className="text-[11px] text-gray-400">{fmt(seq)} tCO₂e/yr × 25 yr = {fmt(total)} tCO₂e</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[18px] font-black ${accent}`}>{inrFmt(total, 300)}</p>
                        <p className="text-[10px] text-gray-400">at ₹300/tCO₂e</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400">
                Sequestration rates from Sylithe Carbon Protocol SCP-1 for detected land cover composition.
              </div>
            </motion.div>

            {/* Upgrade CTA */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="bg-[#08292F] rounded-2xl p-7 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={13} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Unlock Full Verification</span>
              </div>
              <h3 className="text-[20px] font-black mb-2">Make this estimate audit-ready</h3>
              <p className="text-[13px] text-gray-300 mb-5 leading-relaxed max-w-xl">
                Free estimates use Sylithe Carbon Protocol SCP-1 defaults. For Verra VCS, Gold Standard,
                or India CCTS registry you need Sylithe's precision Above-Ground Biomass model,
                Canopy Height Verification, Dynamic Baseline Engine, and certified dMRV reports.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  [TreePine,  'Precision AGB via Sylithe Allometry'],
                  [BarChart3, 'Canopy Height Model (1 m resolution)'],
                  [TrendingUp,'Dynamic Baseline Engine 2000–2024'],
                  [Flame,     'Deforestation & Fire Alert System'],
                  [Globe,     'Registry Submission Support'],
                  [CheckCircle2,'Certified dMRV Audit Reports'],
                ].map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-2 text-[12px] text-gray-200">
                    <Icon size={13} className="text-emerald-400 shrink-0" /> {label}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-[13px] transition-all shadow-md active:scale-95">
                  Get Full Access <ArrowRight size={14} />
                </button>
                <button onClick={() => setShowUpgrade(true)}
                  className="px-6 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-xl text-[13px] transition-all active:scale-95">
                  Talk to our team
                </button>
              </div>
            </motion.div>

            <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

          </div>
        </div>

      </div>
    </div>
  );
}

function Header({ area }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2.5">
        <Leaf size={18} className="text-emerald-500" />
        <h1 className="text-[17px] font-bold text-[#0F172A]">Carbon Estimate</h1>
      </div>
      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
        <Zap size={9} /> Free
      </span>
      {area && <span className="ml-auto text-[12px] text-gray-400">{Number(area).toLocaleString('en-IN')} ha · Sylithe CarbonIQ™ · SCP-1</span>}
    </div>
  );
}
