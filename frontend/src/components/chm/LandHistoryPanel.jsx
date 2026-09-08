import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Flame, TreePine, Sprout, CloudRain, Info, Layers, Sparkles, Leaf, Mountain, Users, Droplets, ShieldCheck, Lightbulb, Loader2 } from 'lucide-react';
import { getLandSummary } from '../../services/freeScanApi';

// Square stat tile for the site & carbon profile
function Stat({ icon: Icon, label, value, sub, source, year, color = '#16a34a', highlight }) {
  return (
    <div className={`rounded-none border p-4 flex flex-col aspect-square ${highlight ? 'bg-[#0d130d] border-[#a4fca1]/30' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={14} style={{ color }} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
      </div>
      <p className={`text-[19px] font-black leading-none ${highlight ? 'text-[#a4fca1]' : 'text-[#0F172A]'}`}>{value}</p>
      {sub && <p className={`text-[10.5px] mt-1.5 leading-snug ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>}
      {(source || year) && (
        <div className={`mt-auto pt-2 border-t ${highlight ? 'border-white/10' : 'border-gray-100'}`}>
          <p className={`text-[9.5px] font-semibold ${highlight ? 'text-gray-500' : 'text-gray-400'}`}>
            {source}{source && year ? ' · ' : ''}{year}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Land History — open-data record for a plot, white boxed cards.
   Datasets: Dynamic World (LULC change 2016+), Hansen (deforestation),
   MODIS (fire), Sentinel-2 (NDVI), CHIRPS (rainfall).
   ───────────────────────────────────────────────────────────── */

// Dynamic World classes split by carbon eligibility
const ELIGIBLE = [
  { key: 'trees', label: 'Trees', color: '#16a34a' },
  { key: 'crops', label: 'Cropland', color: '#E49635' },
  { key: 'grass', label: 'Grass', color: '#88B053' },
  { key: 'shrub', label: 'Shrub & Scrub', color: '#DFC35A' },
  { key: 'bare', label: 'Bare Ground', color: '#A59B8F' },
  { key: 'flooded', label: 'Flooded Veg.', color: '#7A87C6' },
];
const INELIGIBLE = [
  { key: 'built', label: 'Built-up', color: '#C4281B' },
  { key: 'water', label: 'Water', color: '#419BDF' },
  { key: 'snow', label: 'Snow & Ice', color: '#B39FE1' },
];

const tip = { borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const ax = { tick: { fill: '#6b7280', fontSize: 11 }, axisLine: { stroke: '#e5e7eb' }, tickLine: false };

// Sylvera-style rating colours by grade
const gradeColor = (g) => {
  const top = ['AAA', 'AA', 'A'], mid = ['BBB', 'BB', 'B'];
  if (top.includes(g)) return { bg: '#16a34a', soft: '#16a34a15', tx: '#15803d' };
  if (mid.includes(g)) return { bg: '#E49635', soft: '#E4963515', tx: '#a16207' };
  return { bg: '#C4281B', soft: '#C4281B15', tx: '#b91c1c' };
};
// per-point accent
const POINT = {
  strength: { dot: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', tx: '#166534' },
  risk: { dot: '#dc2626', bg: '#fef2f2', border: '#fecaca', tx: '#991b1b' },
  neutral: { dot: '#64748b', bg: '#f8fafc', border: '#e2e8f0', tx: '#1f2937' },
};

function Card({ icon: Icon, title, subtitle, right, color, footer, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-none shadow-[0_2px_4px_rgba(0,0,0,0.03)] flex flex-col aspect-square">
      <div className="flex items-start gap-2 p-4 pb-3 border-b border-gray-100">
        {Icon && <Icon size={17} style={{ color }} className="mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight text-[#1f2937] leading-tight">{title}</h3>
          {subtitle && <p className="text-[11.5px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="p-4 flex-1 min-h-0"><div style={{ width: '100%', height: '100%' }}>{children}</div></div>
      {footer && <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 rounded-none"><p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{footer}</p></div>}
    </div>
  );
}

function StackChart({ data, classes, unit = 'ha' }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="year" {...ax} />
        <YAxis {...ax} />
        <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v, n) => [`${v} ${unit}`, n]} />
        {classes.map((c) => <Bar key={c.key} dataKey={c.key} name={c.label} stackId="s" fill={c.color} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

// colour-keyed legend + first→last change chips
function ChangeLegend({ classes, first, last }) {
  if (!first || !last) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
      {classes.map((c) => {
        const d = (last[c.key] || 0) - (first[c.key] || 0);
        const up = d >= 0;
        return (
          <div key={c.key} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
            <span className="text-gray-700 font-medium">{c.label}</span>
            <span className={`font-bold ${up ? 'text-emerald-600' : 'text-red-500'}`}>{up ? '+' : ''}{d.toFixed(0)}ha</span>
          </div>
        );
      })}
    </div>
  );
}

export default function LandHistoryPanel({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
        <div className="w-12 h-12 border-4 border-[#a4fca1] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#a4fca1] text-[12px] font-bold uppercase tracking-[0.18em] animate-pulse">Compiling land history</p>
        <p className="text-gray-400 text-[11px] max-w-[300px] text-center leading-relaxed">
          Querying Dynamic World, Hansen, MODIS, Sentinel-2 &amp; CHIRPS — this can take up to a minute.
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 px-8 text-center">
        <p className="text-red-300 text-[13px] font-semibold">Couldn’t load land history</p>
        <p className="text-gray-400 text-[11px]">{error}</p>
        {onRetry && <button onClick={onRetry} className="mt-2 px-4 py-2 bg-[#a4fca1] text-[#0d0f0d] rounded-full text-[12px] font-bold uppercase tracking-wide">Try again</button>}
      </div>
    );
  }
  if (!data) return null;

  const sp = data.site_profile;
  const lcAll = data.lulc_timeseries || [];
  const lcYears = lcAll.map((d) => d.year);
  const [startYear, setStartYear] = useState(lcYears[0]);
  const [endYear, setEndYear] = useState(lcYears[lcYears.length - 1]);
  useEffect(() => {
    if (lcYears.length) { setStartYear(lcYears[0]); setEndYear(lcYears[lcYears.length - 1]); }
  }, [data]); // reset when a new plot's data arrives

  // Sylithe AI analysis (DeepSeek): 5 expert points
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  useEffect(() => {
    if (!data?.lulc_timeseries?.length) return;
    let alive = true;
    setAiLoading(true); setAiData(null);
    getLandSummary(data)
      .then((res) => { if (alive) setAiData(res); })
      .catch(() => { if (alive) setAiData(null); })
      .finally(() => { if (alive) setAiLoading(false); });
    return () => { alive = false; };
  }, [data]);
  const aiPoints = aiData?.points || null;

  const lc = lcAll.filter((d) => d.year >= (startYear ?? -Infinity) && d.year <= (endYear ?? Infinity));
  const first = lc[0];
  const last = lc[lc.length - 1];
  const defor = (data.deforestation || []).filter((d) => d.year >= 2010);
  const fire = (data.fire || []).filter((d) => d.year >= 2010);
  const ndvi = data.ndvi || [];
  const rain = data.rainfall || [];

  // Build a plain-language comparison narrative.
  let narrative = 'Land-cover history is being compiled.';
  if (first && last) {
    const d = (k) => (last[k] || 0) - (first[k] || 0);
    const parts = [];
    const fmt = (k, name) => { const v = d(k); if (Math.abs(v) >= 1) parts.push(`${name} ${v >= 0 ? 'increased' : 'decreased'} by ${Math.abs(v).toFixed(0)} ha`); };
    fmt('trees', 'tree cover'); fmt('built', 'built-up land'); fmt('crops', 'cropland'); fmt('shrub', 'shrub & scrub'); fmt('water', 'water');
    const treeDelta = d('trees'), builtDelta = d('built');
    const verdict = treeDelta < -2 ? 'a net loss of vegetation — likely degradation or conversion'
      : builtDelta > 5 ? 'expanding built-up area — watch for encroachment'
      : treeDelta > 2 ? 'recovering vegetation — a positive restoration signal'
      : 'a broadly stable landscape';
    narrative = `Between ${first.year} and ${last.year}, ${parts.length ? parts.join(', ') : 'land cover stayed broadly unchanged'}. Overall the plot shows ${verdict}. This 10-year Dynamic World record establishes the historical baseline for additionality and crediting.`;
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
      {/* AI land-change summary (DeepSeek) */}
      <div className="bg-white border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.03)] p-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#0fa958]" />
            <p className="text-[12px] font-bold text-[#0fa958] uppercase tracking-wider">Sylithe AI · Carbon Project Analysis</p>
          </div>
        </div>

        {aiLoading ? (
          <div className="flex items-center gap-2 py-2 text-gray-500">
            <Loader2 size={14} className="animate-spin text-[#0fa958]" />
            <span className="text-[12px]">Sylithe AI is analysing the geospatial record…</span>
          </div>
        ) : (aiPoints && aiPoints.length) ? (
          <ul className="space-y-2.5">
            {aiPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#0fa958]/10 text-[#0fa958] text-[10px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                <span className="text-[12px] text-[#1f2937] leading-relaxed">{typeof p === 'string' ? p : p.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          /* Fallback to the rule-based narrative if the AI call is unavailable */
          <p className="text-[12px] text-gray-600 leading-relaxed">{narrative}</p>
        )}
      </div>

      {/* Site & carbon profile */}
      {sp && (
        <div>
          <p className="text-[12px] font-bold text-gray-300 uppercase tracking-wider mb-2 px-1">Site &amp; Carbon Profile</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {sp.biomass && (
              <Stat icon={Leaf} label="Carbon Stock" color="#16a34a"
                value={`${Number(sp.biomass.total_tco2e).toLocaleString('en-IN')} tCO₂e`}
                sub={`${sp.biomass.tco2e_per_ha} tCO₂e/ha · AGB ${sp.biomass.agb_mgc_ha} + BGB ${sp.biomass.bgb_mgc_ha} MgC/ha`}
                source={sp.biomass.source || 'Biomass'} year={String(sp.biomass.year || '')} />
            )}
            {sp.soil_organic_carbon_gkg != null && (
              <Stat icon={Sprout} label="Soil Organic Carbon" color="#7c5e3a"
                value={`${sp.soil_organic_carbon_gkg} g/kg`} sub="Topsoil (0 cm)"
                source="OpenLandMap" year="~2017" />
            )}
            {sp.terrain && (
              <Stat icon={Mountain} label="Terrain" color="#64748b"
                value={`${sp.terrain.elevation_m} m`} sub={`Mean slope ${sp.terrain.slope_deg}°`}
                source={sp.terrain.source || 'DEM'} year={String(sp.terrain.year || '')} />
            )}
            {sp.population != null && (
              <Stat icon={Users} label="Population" color="#0ea5e9"
                value={Number(sp.population).toLocaleString('en-IN')} sub="People within boundary"
                source="JRC GHSL" year={String(sp.population_year || 2020)} />
            )}
            {sp.water_occurrence_pct != null && (
              <Stat icon={Droplets} label="Surface Water" color="#3b82f6"
                value={`${sp.water_occurrence_pct}%`} sub="Mean occurrence"
                source="JRC Global Surface Water" year="1984–2021" />
            )}
            {sp.nighttime_lights != null && (
              <Stat icon={Lightbulb} label="Nighttime Lights" color="#eab308"
                value={`${sp.nighttime_lights} nW`} sub="Development proxy"
                source="NOAA VIIRS" year={String(sp.nighttime_lights_year || 2024)} />
            )}
            {sp.protected_area != null && (
              <Stat icon={ShieldCheck} label="Protected Area" color={sp.protected_area ? '#16a34a' : '#94a3b8'}
                value={sp.protected_area ? 'Yes' : 'No'} sub="Boundary overlap"
                source="WDPA" year="Current" />
            )}
            {sp.area_ha != null && (
              <Stat icon={Layers} label="Total Area" color="#0fa958"
                value={`${Number(sp.area_ha).toLocaleString('en-IN')} ha`} sub="Geodesic boundary area"
                source="Sylithe" year="Live" />
            )}
          </div>
        </div>
      )}

      {/* Year-range selector for land-change comparison */}
      {lcAll.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap bg-white border border-gray-200 rounded-none px-4 py-3">
          <span className="text-[12px] font-bold text-[#1f2937]">Compare land change:</span>
          <label className="flex items-center gap-1.5 text-[12px] text-gray-600">
            From
            <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-none px-2.5 py-1.5 text-[12px] font-semibold text-[#1f2937] outline-none">
              {lcYears.filter((y) => y <= endYear).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-gray-600">
            To
            <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-none px-2.5 py-1.5 text-[12px] font-semibold text-[#1f2937] outline-none">
              {lcYears.filter((y) => y >= startYear).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* Eligible vs Ineligible land change (two-part split) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {lc.length > 0 && (
          <Card icon={Layers} title="Eligible Land — Change Over Time" subtitle="Google Dynamic World · carbon-eligible classes (ha)" color="#16a34a"
            footer="Trees, cropland, grass, shrub & bare land are eligible for carbon project activities (REDD+, ARR, Agroforestry).">
            <StackChart data={lc} classes={ELIGIBLE} />
          </Card>
        )}
        {lc.length > 0 && (
          <Card icon={Layers} title="Ineligible Land — Change Over Time" subtitle="Google Dynamic World · non-eligible classes (ha)" color="#C4281B"
            footer="Built-up, water & snow/ice cannot be credited. Rising built-up area signals development pressure on the plot.">
            <StackChart data={lc} classes={INELIGIBLE} />
          </Card>
        )}
      </div>
      {lc.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-none p-4">
          <p className="text-[12px] font-bold text-[#1f2937] mb-1">Net change {first?.year} → {last?.year}</p>
          <ChangeLegend classes={[...ELIGIBLE, ...INELIGIBLE]} first={first} last={last} />
        </div>
      )}

      {/* Deforestation + Fire */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card icon={TreePine} title="Deforestation by Year" subtitle="UMD / Hansen Global Forest Change · loss (ha)" color="#ef4444"
          footer={`${defor.reduce((s, d) => s + (d.loss_ha || 0), 0).toFixed(1)} ha lost since 2010 — establishes the baseline deforestation scenario.`}>
          <ResponsiveContainer>
            <BarChart data={defor} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="year" {...ax} /><YAxis {...ax} />
              <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} ha`, 'Loss']} />
              <Bar dataKey="loss_ha" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card icon={Flame} title="Fire History by Year" subtitle="MODIS MCD64A1 · burned area (ha)" color="#f97316"
          footer={`${fire.reduce((s, d) => s + (d.burn_ha || 0), 0).toFixed(1)} ha burned since 2010 — informs permanence & reversal risk.`}>
          <ResponsiveContainer>
            <BarChart data={fire} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="year" {...ax} /><YAxis {...ax} />
              <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} ha`, 'Burned']} />
              <Bar dataKey="burn_ha" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* NDVI + Rainfall */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card icon={Sprout} title="Vegetation Greenness (NDVI)" subtitle="Sentinel-2 · yearly mean NDVI" color="#22c55e"
          footer="Rising NDVI = recovering vegetation; falling = degradation.">
          <ResponsiveContainer>
            <LineChart data={ndvi} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="year" {...ax} /><YAxis domain={[0, 1]} {...ax} />
              <Tooltip contentStyle={tip} formatter={(v) => [v, 'NDVI']} />
              <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card icon={CloudRain} title="Annual Rainfall" subtitle="CHIRPS · total precipitation (mm/yr)" color="#3b82f6"
          footer="Climate context for growth potential and drought risk.">
          <ResponsiveContainer>
            <BarChart data={rain} margin={{ top: 4, right: 6, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="year" {...ax} /><YAxis {...ax} />
              <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} mm`, 'Rainfall']} />
              <Bar dataKey="mm" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed px-1 pb-4">
        Sources: Google Dynamic World, UMD/Hansen GFC, NASA MODIS MCD64A1, Copernicus Sentinel-2, UCSB CHIRPS — open data, compiled via Sylithe.
      </p>
    </div>
  );
}
