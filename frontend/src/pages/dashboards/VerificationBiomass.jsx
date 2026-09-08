import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ErrorBar, AreaChart, Area,
} from 'recharts';
import { HiDownload } from 'react-icons/hi';
import ChmMap from '../../components/chm/ChmMap';

/**
 * Biomass estimation.
 *
 * Three independent above-ground biomass retrievals — spaceborne lidar
 * (GEDI L4B), SAR (ESA CCI), and canopy-height allometry — are reconciled
 * into an ensemble. Their disagreement is the uncertainty, and VM0047's
 * (1 - UNC) deduction is applied to it, so the headline figure is the
 * deducted stock rather than the flattering mean.
 */

// Chart colours, chosen to stay legible on the white card ground.
const SOURCE_COLOR = {
  gedi_l4b: '#16a34a',
  esa_cci: '#0284c7',
  chm_allometry: '#d97706',
};

const BAND_TONE = {
  low: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-sky-100 text-sky-700',
  high: 'bg-amber-100 text-amber-700',
  'very high': 'bg-red-100 text-red-700',
};

const Stat = ({ label, value, unit, sub, tone = 'default' }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
    <p className={`mt-1.5 text-[26px] font-bold leading-none ${
      tone === 'good' ? 'text-emerald-700' : tone === 'warn' ? 'text-amber-600' : 'text-[#0F172A]'}`}>
      {value}{unit && <span className="ml-1 text-[15px] font-semibold text-gray-500">{unit}</span>}
    </p>
    {sub && <p className="mt-1.5 text-[11.5px] leading-snug text-gray-500">{sub}</p>}
  </div>
);

export default function BiomassEstimationPage({ savedProjects, onProjectSelect, geojsonData }) {
  const [polygon, setPolygon] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [activeAoiIndex, setActiveAoiIndex] = useState('all');
  const [loadingPlot, setLoadingPlot] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const loadTimer = useRef(null);

  useEffect(() => {
    if (!geojsonData) return;
    clearTimeout(loadTimer.current);
    setPolygon(geojsonData);
    setActiveAoiIndex('all');
    setData(null); setError(''); setLoadingPlot(false);
  }, [geojsonData]);

  useEffect(() => () => clearTimeout(loadTimer.current), []);

  const pickProject = (id) => {
    setSelectedProject(id);
    clearTimeout(loadTimer.current);
    if (!id) { setLoadingPlot(false); return; }
    setLoadingPlot(true); setData(null); setError('');
    onProjectSelect?.(id);
    loadTimer.current = setTimeout(() => {
      setLoadingPlot(false);
      setError('That project has no saved boundary. Draw the plot on the map instead.');
    }, 10000);
  };

  const activeGeojson = useMemo(() => {
    if (!polygon || activeAoiIndex === 'all') return polygon;
    if (polygon.type === 'FeatureCollection' && polygon.features?.[activeAoiIndex]) {
      return { ...polygon, features: [polygon.features[activeAoiIndex]] };
    }
    return polygon;
  }, [polygon, activeAoiIndex]);

  const featureCount = polygon?.type === 'FeatureCollection' ? (polygon.features?.length || 0) : 0;

  const pickAoi = (val) => {
    setActiveAoiIndex(val === 'all' ? 'all' : Number(val));
    setData(null); setError('');
  };

  const run = async () => {
    if (!activeGeojson) return;
    setRunning(true); setError(''); setData(null);
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/biomass/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson: activeGeojson }),
      });
      const d = await res.json();
      if (d.status === 'success') setData(d);
      else setError(d.message || 'Could not estimate biomass for this plot.');
    } catch (err) {
      console.error('[biomass] failed:', err);
      setError('Could not reach the analysis server. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const sourceChart = useMemo(() => (data?.sources || []).map((s) => ({
    name: s.name, agb: s.agb_t_ha, err: s.se_t_ha || 0, id: s.id,
  })), [data]);

  const histChart = useMemo(() => (data?.canopy?.histogram || []).map((h) => ({
    height: `${h.height_m}m`, pixels: h.pixels,
  })), [data]);

  const e = data?.ensemble;
  const acc = data?.accounting;

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#0A0A0A]">
      {/* ── Control panel — Plot Inventory frosted-glass treatment ── */}
      <aside className="relative z-10 flex h-full w-[400px] shrink-0 flex-col overflow-y-auto border-r border-white/40 bg-white/75 font-sans text-[#0F172A] shadow-[12px_0_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <div className="shrink-0 border-b border-white/40 bg-white/30 p-5">
          <h1 className="text-[16px] font-bold leading-tight text-[#0F172A]">Biomass estimation</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[12px] font-medium text-gray-600">
              AGB &amp; carbon stock
            </span>
            <span className="rounded-full bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">3-source ensemble</span>
          </div>
        </div>

        {/* Plot */}
        <div className="border-b border-white/40 bg-white/20 p-5">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Project plot</p>
          {savedProjects?.length > 0 && (
            <select
              value={selectedProject}
              onChange={(ev) => pickProject(ev.target.value)}
              className="mb-2 h-9 w-full cursor-pointer rounded-lg border border-gray-300/50 bg-white/60 px-3 text-[12px] text-[#0F172A] outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="" className="bg-white">Select a saved project…</option>
              {savedProjects.map((p) => (
                <option key={p._id} value={p._id} className="bg-white">{p.name}</option>
              ))}
            </select>
          )}
          {featureCount > 1 && (
            <select
              value={activeAoiIndex}
              onChange={(ev) => pickAoi(ev.target.value)}
              className="mb-2 h-9 w-full cursor-pointer rounded-lg border border-gray-300/50 bg-white/60 px-3 text-[12px] text-[#0F172A] outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="all" className="bg-white">All plots combined ({featureCount})</option>
              {polygon.features.map((f, i) => (
                <option key={i} value={i} className="bg-white">
                  Plot {i + 1}{f?.properties?.name ? ` — ${f.properties.name}` : ''}
                </option>
              ))}
            </select>
          )}
          <p className={`rounded-md border px-3 py-2 text-[12px] ${
            loadingPlot ? 'border-gray-200/60 bg-white/50 text-gray-600'
              : polygon ? 'border-emerald-300/60 bg-emerald-50/70 text-emerald-800'
                        : 'border-gray-200/60 bg-white/50 text-gray-500'}`}>
            {loadingPlot ? 'Loading the project boundary…'
              : polygon
                ? (featureCount > 1
                    ? (activeAoiIndex === 'all'
                        ? `All ${featureCount} plots combined.`
                        : `Plot ${activeAoiIndex + 1} of ${featureCount} selected.`)
                    : 'Plot boundary ready.')
                : 'Draw a plot on the map, or select a saved project.'}
          </p>

          <button
            onClick={run}
            disabled={!activeGeojson || running}
            className="mt-3 w-full cursor-pointer rounded-xl bg-[#08292F] py-3 text-[13px] font-bold text-white shadow-lg transition-all hover:bg-[#062125] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running ? 'Estimating biomass…' : 'Estimate biomass'}
          </button>
          {error && <p role="alert" className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-4 p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Creditable stock — after deduction
              </p>
              <p className="mt-1 text-[28px] font-black leading-none text-emerald-700">
                {data.net.total_tco2e.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">tCO₂e over {data.area.area_ha} ha</p>
              <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
                Ensemble gross was {data.gross.total_tco2e.toLocaleString()} tCO₂e.
                A {acc.deduction_applied_pct}% uncertainty deduction removes{' '}
                {(data.gross.total_tco2e - data.net.total_tco2e).toLocaleString()} tCO₂e.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200/60 bg-white/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Uncertainty</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${BAND_TONE[e.uncertainty_band]}`}>
                  {e.uncertainty_band}
                </span>
              </div>
              <p className="mt-1.5 text-[20px] font-black leading-none text-[#0F172A]">{e.uncertainty_pct}%</p>
              <p className="mt-1.5 text-[10.5px] leading-snug text-gray-500">
                90% CI ±{e.ci90_half_width} t/ha on a mean of {e.mean_agb_t_ha} t/ha.
                Between-source spread {e.between_source_sd}, within-source {e.within_source_se}.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sources</p>
              {data.sources.map((s) => (
                <div key={s.id} className="rounded-lg border border-gray-200/60 bg-white/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[12px] font-bold text-[#0F172A]">
                      <span className="h-2 w-2 rounded-full" style={{ background: SOURCE_COLOR[s.id] }} />
                      {s.name}
                    </span>
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {s.agb_t_ha}<span className="ml-0.5 text-[10px] text-gray-500">t/ha</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-snug text-gray-500">{s.sensor}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200/60 bg-white/50 p-3 text-[11px] leading-relaxed text-gray-500">
              <p><span className="text-gray-500">Carbon fraction:</span> {acc.carbon_fraction}</p>
              <p className="mt-1"><span className="text-gray-500">Root-to-shoot:</span> {acc.root_to_shoot} ({acc.ecozone.replace(/_/g, ' ')})</p>
              <p className="mt-1"><span className="text-gray-500">Rainfall:</span> {acc.mean_annual_rainfall_mm} mm/yr</p>
              <p className="mt-1"><span className="text-gray-500">Run time:</span> {data.elapsed_s}s</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Map + charts ──────────────────────────────────────────── */}
      <div className="relative h-full flex-1 overflow-y-auto bg-[#FAFAF9]">
        <div className="h-[46%] min-h-[300px] w-full">
          <div className="relative h-full w-full">
            <ChmMap onPolygonComplete={(gj) => { setPolygon(gj); setSelectedProject(''); setActiveAoiIndex('all'); setData(null); }}
                    currentPolygon={activeGeojson} />
            {running && (
              <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-md">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#a4fca1] border-t-transparent" />
                <p className="animate-pulse text-sm font-black uppercase tracking-[0.2em] text-[#a4fca1]">
                  Reconciling biomass sources
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {!data && !running && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-[15px] font-bold text-[#0F172A]">No estimate yet</p>
              <p className="mx-auto mt-1.5 max-w-xl text-[13px] leading-relaxed text-gray-500">
                Draw the boundary or pick a saved project, then run the estimate. Three
                independent retrievals — spaceborne lidar, SAR, and canopy-height allometry —
                are compared, and their disagreement becomes the uncertainty deduction applied
                to the creditable stock.
              </p>
            </div>
          )}

          {data && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Mean AGB density" value={e.mean_agb_t_ha} unit="t/ha"
                      sub={`ensemble of ${e.sources_used} independent sources`} />
                <Stat label="Gross stock" value={data.gross.total_tco2e.toLocaleString()} unit="tCO₂e"
                      sub={`${data.gross.tco2e_per_ha} tCO₂e/ha before deduction`} />
                <Stat label="Creditable stock" value={data.net.total_tco2e.toLocaleString()} unit="tCO₂e"
                      tone="good" sub={`after a ${acc.deduction_applied_pct}% uncertainty deduction`} />
                <Stat label="Uncertainty" value={`${e.uncertainty_pct}%`}
                      tone={e.uncertainty_pct >= 20 ? 'warn' : 'good'}
                      sub={`90% CI · ${e.uncertainty_band}`} />
              </div>

              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="font-bold text-[#0F172A]">Source comparison</h3>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      Error bars are each product's published error term. Their disagreement drives the deduction.
                    </p>
                  </div>
                  <div className="h-[300px] p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sourceChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 't/ha', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="agb" name="AGB (t/ha)" radius={[6, 6, 0, 0]}>
                          {sourceChart.map((s) => <Cell key={s.id} fill={SOURCE_COLOR[s.id] || '#94a3b8'} />)}
                          <ErrorBar dataKey="err" width={6} strokeWidth={2} stroke="#475569" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="font-bold text-[#0F172A]">Canopy height distribution</h3>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      Meta CHM, trees above 2 m. Mean {data.canopy.mean_height_m} m · 95th percentile {data.canopy.p95_height_m} m.
                    </p>
                  </div>
                  <div className="h-[300px] p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={histChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="height" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="pixels" name="Pixels" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#0F172A]">Carbon pools</h3>
                    <button
                      onClick={() => {
                        const rows = [
                          ['metric', 'gross', 'net_after_deduction'],
                          ['agb_t_ha', data.gross.agb_t_ha, data.net.agb_t_ha],
                          ['bgb_t_ha', data.gross.bgb_t_ha, data.net.bgb_t_ha],
                          ['carbon_tc_ha', data.gross.carbon_tc_ha, data.net.carbon_tc_ha],
                          ['tco2e_per_ha', data.gross.tco2e_per_ha, data.net.tco2e_per_ha],
                          ['total_tco2e', data.gross.total_tco2e, data.net.total_tco2e],
                        ];
                        const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = 'biomass-estimate.csv';
                        a.click(); URL.revokeObjectURL(a.href);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50"
                    >
                      <HiDownload size={15} /> CSV
                    </button>
                  </div>
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wide text-gray-400">
                        <th className="pb-2 font-bold">Pool</th>
                        <th className="pb-2 text-right font-bold">Gross</th>
                        <th className="pb-2 text-right font-bold">Creditable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Above-ground biomass', 'agb_t_ha', 't/ha'],
                        ['Below-ground biomass', 'bgb_t_ha', 't/ha'],
                        ['Carbon', 'carbon_tc_ha', 'tC/ha'],
                        ['CO₂ equivalent', 'tco2e_per_ha', 'tCO₂e/ha'],
                        ['Total over plot', 'total_tco2e', 'tCO₂e'],
                      ].map(([label, key, unit]) => (
                        <tr key={key} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 text-gray-700">{label}<span className="ml-1 text-[11px] text-gray-400">{unit}</span></td>
                          <td className="py-2 text-right font-semibold text-gray-500">{data.gross[key].toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-emerald-700">{data.net[key].toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-[11px] leading-snug text-gray-500">
                    Carbon fraction {acc.carbon_fraction}, root-to-shoot {acc.root_to_shoot}{' '}
                    ({acc.ecozone.replace(/_/g, ' ')}, {acc.mean_annual_rainfall_mm} mm/yr), CO₂ = C × {acc.co2_per_c}.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-1 font-bold text-[#0F172A]">Why the deduction</h3>
                  <p className="mb-4 text-[12px] leading-relaxed text-gray-500">{acc.basis}</p>
                  <div className="space-y-2.5">
                    {data.sources.map((s) => (
                      <div key={s.id} className="rounded-lg border border-gray-100 bg-[#FAFAF9] p-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#0F172A]">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: SOURCE_COLOR[s.id] }} />
                            {s.name}
                          </span>
                          <span className="text-[12.5px] font-bold text-[#0F172A]">
                            {s.agb_t_ha} t/ha{s.se_t_ha != null && <span className="text-gray-400"> ±{s.se_t_ha}</span>}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-gray-500">{s.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
