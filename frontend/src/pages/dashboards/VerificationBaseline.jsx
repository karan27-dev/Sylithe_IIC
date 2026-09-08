import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, ReferenceArea,
} from 'recharts';
import { HiDownload, HiOutlineChevronLeft } from 'react-icons/hi';
import ChmMap from '../../components/chm/ChmMap';

/**
 * DCAB — Dynamic Carbon Accounting Baseline.
 *
 * Runs the dynamic performance benchmark VM0047 v1.1 requires for the
 * area-based approach: the counterfactual is re-derived each period from
 * what statistically comparable land actually did, rather than fixed once at
 * validation. Draw or select a plot, set the project start year, and the
 * backend matches control plots from a ring around the project and contrasts
 * the two stocking-index trends.
 */

const CURRENT_YEAR = new Date().getFullYear();

const Stat = ({ label, value, sub, tone = 'default' }) => {
  const tones = {
    default: 'text-[#0F172A]',
    good: 'text-emerald-700',
    bad: 'text-red-600',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-[20px] font-bold leading-none ${tones[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] leading-snug text-gray-500">{sub}</p>}
    </div>
  );
};

export default function DynamicBaselinePage({ savedProjects, onProjectSelect, geojsonData }) {
  const [polygon, setPolygon] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [loadingPlot, setLoadingPlot] = useState(false);
  const [activeAoiIndex, setActiveAoiIndex] = useState('all');
  const loadTimer = useRef(null);
  const [startYear, setStartYear] = useState(2021);
  const [bufferKm, setBufferKm] = useState(25);
  const [k, setK] = useState(20);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // A project picked in the selector loads its boundary into the dashboard's
  // geojsonData. Adopt it as the active plot and discard any baseline computed
  // for the previous one, so the chart can never describe a different plot
  // from the one drawn on the map.
  useEffect(() => {
    if (!geojsonData) return;
    clearTimeout(loadTimer.current);
    setPolygon(geojsonData);
    setActiveAoiIndex('all');
    setData(null);
    setError('');
    setLoadingPlot(false);
  }, [geojsonData]);

  useEffect(() => () => clearTimeout(loadTimer.current), []);

  const pickProject = (id) => {
    setSelectedProject(id);
    clearTimeout(loadTimer.current);
    if (!id) { setLoadingPlot(false); return; }
    setLoadingPlot(true);
    setData(null);
    setError('');
    onProjectSelect?.(id);
    // A project saved without a boundary never updates geojsonData, so the
    // effect above would not fire and the panel would sit on "Loading…"
    // indefinitely. Give up after a reasonable wait and say why.
    loadTimer.current = setTimeout(() => {
      setLoadingPlot(false);
      setError('That project has no saved boundary. Draw the plot on the map instead.');
    }, 10000);
  };

  // The geometry actually analysed and drawn: a single chosen feature, or
  // the whole collection when "all" is selected.
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
    setData(null);   // a baseline belongs to the plot it was built from
    setError('');
  };

  const run = async () => {
    if (!activeGeojson) return;
    setRunning(true); setError(''); setData(null);
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/dcab/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geojson: activeGeojson, project_start_year: Number(startYear),
          buffer_km: Number(bufferKm), k: Number(k),
        }),
      });
      const d = await res.json();
      if (d.status === 'success') setData(d);
      else setError(d.message || 'Could not build the baseline.');
    } catch (err) {
      console.error('[dcab] failed:', err);
      setError('Could not reach the analysis server. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const chart = useMemo(() => (data?.series || []).map((s) => ({
    year: String(s.year),
    project: s.project_si,
    control: s.control_si,
    band: [Math.max(-1, s.control_si - s.control_sd), Math.min(1, s.control_si + s.control_sd)],
  })), [data]);

  const b = data?.benchmark;
  const q = data?.match_quality;

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#0A0A0A]">
      {/* ── Control + results panel ───────────────────────────────── */}
      <aside className="relative z-10 flex h-full w-[400px] shrink-0 flex-col overflow-y-auto border-r border-white/40 bg-white/75 font-sans text-[#0F172A] shadow-[12px_0_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <div className="shrink-0 border-b border-white/40 bg-white/30 p-5">
          <h1 className="text-[16px] font-bold leading-tight text-[#0F172A]">Dynamic baseline</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[12px] font-medium text-gray-600">
              DCAB
            </span>
            <span className="rounded-full bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">VM0047 performance benchmark</span>
          </div>
        </div>

        {/* Plot selection */}
        <div className="border-b border-white/40 bg-white/20 p-5">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Project plot</p>
          {savedProjects?.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => pickProject(e.target.value)}
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
              onChange={(e) => pickAoi(e.target.value)}
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
            {loadingPlot
              ? 'Loading the project boundary…'
              : polygon
                ? (featureCount > 1
                    ? (activeAoiIndex === 'all'
                        ? `All ${featureCount} plots combined — the baseline covers them as one area.`
                        : `Plot ${activeAoiIndex + 1} of ${featureCount} selected.`)
                    : selectedProject ? 'Project boundary loaded on the map.' : 'Plot boundary ready.')
                : 'Draw a plot on the map, or select a saved project.'}
          </p>
        </div>

        {/* Parameters */}
        <div className="space-y-4 border-b border-white/40 bg-white/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Parameters</p>

          <label className="block">
            <span className="text-[12px] font-bold text-gray-800">Project start year</span>
            <input
              type="number" min={2019} max={CURRENT_YEAR - 1} value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-gray-300/50 bg-white/60 px-3 text-[12px] text-[#0F172A] outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
            />
            <span className="mt-1 block text-[10.5px] leading-snug text-gray-500">
              Splits baseline from crediting period. Needs two years either side; Sentinel-2 begins 2018.
            </span>
          </label>

          <label className="block">
            <span className="text-[12px] font-bold text-gray-800">Donor pool radius — {bufferKm} km</span>
            <input
              type="range" min={10} max={100} step={5} value={bufferKm}
              onChange={(e) => setBufferKm(e.target.value)}
              className="mt-1.5 w-full cursor-pointer accent-emerald-600"
            />
            <span className="mt-1 block text-[10.5px] leading-snug text-gray-500">
              Ring searched for control plots, excluding a 2 km leakage belt around the project.
            </span>
          </label>

          <label className="block">
            <span className="text-[12px] font-bold text-gray-800">Matched controls (k) — {k}</span>
            <input
              type="range" min={5} max={50} step={5} value={k}
              onChange={(e) => setK(e.target.value)}
              className="mt-1.5 w-full cursor-pointer accent-emerald-600"
            />
          </label>

          <button
            onClick={run}
            disabled={!activeGeojson || running}
            className="mt-1 w-full cursor-pointer rounded-xl bg-[#08292F] py-3 text-[13px] font-bold text-white shadow-lg transition-all hover:bg-[#062125] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running ? 'Matching control plots…' : 'Build dynamic baseline'}
          </button>

          {error && <p role="alert" className="text-[12px] font-semibold text-red-600">{error}</p>}
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-4 p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Benchmark</p>
              <p className={`mt-1 text-[26px] font-bold leading-none ${b.additional ? 'text-emerald-700' : 'text-amber-600'}`}>
                {b.benchmark > 0 ? '+' : ''}{b.benchmark}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">{b.units}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-gray-600">{b.verdict}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-lg border border-gray-200/60 bg-white/50 p-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Project slope</p>
                <p className="font-bold text-[#0F172A]">{b.project_slope}</p>
              </div>
              <div className="rounded-lg border border-gray-200/60 bg-white/50 p-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Control slope</p>
                <p className="font-bold text-[#0F172A]">{b.control_slope}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200/60 bg-white/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Match quality</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                  q.rating === 'strong' ? 'bg-emerald-100 text-emerald-700'
                  : q.rating === 'moderate' ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'}`}>{q.rating}</span>
              </div>
              <p className="mt-1.5 text-[12px] text-gray-600">
                Pre-project bias <strong className="text-[#0F172A]">{q.pre_project_bias}</strong>
              </p>
              <p className="mt-1 text-[10.5px] leading-snug text-gray-500">{q.note}</p>
            </div>

            <div className="rounded-lg border border-gray-200/60 bg-white/50 p-3 text-[11px] leading-relaxed text-gray-500">
              <p><span className="text-gray-500">Stocking index:</span> {data.config.stocking_index}</p>
              <p className="mt-1"><span className="text-gray-500">Matched on:</span> {data.config.match_covariates.join(', ')}</p>
              <p className="mt-1">
                <span className="text-gray-500">Donor pool:</span> {data.config.candidates_usable} usable
                of {data.config.candidates_sampled} sampled at {data.config.match_scale_m} m
              </p>
              <p className="mt-1"><span className="text-gray-500">Run time:</span> {data.elapsed_s}s</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Map + charts ──────────────────────────────────────────── */}
      <div className="relative h-full flex-1 overflow-y-auto bg-[#FAFAF9]">
        <div className="h-[52%] min-h-[320px] w-full">
          <div className="relative h-full w-full">
            <ChmMap
              onPolygonComplete={(gj) => { setPolygon(gj); setSelectedProject(''); setActiveAoiIndex('all'); setData(null); }}
              currentPolygon={activeGeojson}
              controlPoints={data?.controls}
            />
            {running && (
              <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-md">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#a4fca1] border-t-transparent" />
                <p className="animate-pulse text-sm font-black uppercase tracking-[0.2em] text-[#a4fca1]">
                  Matching control plots
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {!data && !running && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-[15px] font-bold text-[#0F172A]">No baseline yet</p>
              <p className="mx-auto mt-1.5 max-w-lg text-[13px] leading-relaxed text-gray-500">
                Draw the project boundary on the map or pick a saved project, set the start year,
                then build the baseline. Control plots are matched from a ring around the project
                on their pre-project stocking index, elevation and slope — the project is never
                matched against its own edge.
              </p>
            </div>
          )}

          {data && (
            <>
              <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Project area" value={`${data.project.area_ha} ha`} />
                <Stat label="Baseline period" value={data.project.baseline_years.join(', ')} sub="pre-project" />
                <Stat label="Crediting period" value={`${data.project.crediting_years[0]}–${data.project.crediting_years.slice(-1)[0]}`} />
                <Stat
                  label="Additional?"
                  value={b.additional ? 'Yes' : 'No'}
                  tone={b.additional ? 'good' : 'bad'}
                  sub="project vs matched control trend"
                />
              </div>

              <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div>
                    <h3 className="font-bold text-[#0F172A]">Stocking index — project vs matched control</h3>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      NDFI from Sentinel-2 spectral unmixing. Shaded band is ±1 SD across the {data.config.k} controls.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const rows = [['year', 'project_si', 'control_si', 'control_sd', 'period'],
                        ...data.series.map((s) => [s.year, s.project_si, s.control_si, s.control_sd, s.period])];
                      const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `dcab-${data.config.project_start_year}.csv`;
                      a.click(); URL.revokeObjectURL(a.href);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <HiDownload size={16} /> Export CSV
                  </button>
                </div>
                <div className="h-[380px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <ReferenceArea
                        x1={String(data.project.baseline_years[0])}
                        x2={String(data.project.baseline_years.slice(-1)[0])}
                        fill="#94a3b8" fillOpacity={0.12}
                      />
                      <ReferenceLine
                        x={String(data.config.project_start_year)}
                        stroke="#0F172A" strokeDasharray="4 4"
                        label={{ value: 'project start', position: 'insideTopLeft', fontSize: 11, fill: '#0F172A' }}
                      />
                      <Line type="monotone" dataKey="project" name="Project area" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="control" name="Matched control (dynamic baseline)" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-1 font-bold text-[#0F172A]">How this benchmark was built</h3>
                  <p className="mb-4 text-[12px] leading-relaxed text-gray-500">
                    VM0047 v1.1 requires the crediting baseline to be re-derived at every
                    verification from matched control plots rather than fixed at validation.
                  </p>
                  <ol className="space-y-2.5 text-[13px] text-gray-700">
                    {[
                      `Donor pool drawn from a ${data.config.buffer_km} km ring, excluding a ${data.config.exclusion_km} km leakage belt.`,
                      `${data.config.candidates_sampled} candidates sampled at ${data.config.match_scale_m} m; ${data.config.candidates_usable} usable.`,
                      `Matched on ${data.config.match_covariates.join(', ')} by k-nearest neighbour on standardised Euclidean distance.`,
                      `Top ${data.config.k} controls retained and averaged per year.`,
                      'Ordinary least squares through each series over the crediting period; the slope contrast is the benchmark.',
                    ].map((t, i) => (
                      <li key={t} className="flex gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#08292F] text-[10px] font-bold text-white">{i + 1}</span>
                        <span className="leading-snug">{t}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-3 font-bold text-[#0F172A]">Yearly series</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12.5px]">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wide text-gray-400">
                          <th className="pb-2 pr-3 font-bold">Year</th>
                          <th className="pb-2 pr-3 font-bold">Project</th>
                          <th className="pb-2 pr-3 font-bold">Control</th>
                          <th className="pb-2 pr-3 font-bold">± SD</th>
                          <th className="pb-2 font-bold">Period</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.series.map((s) => (
                          <tr key={s.year} className="border-b border-gray-100 last:border-0">
                            <td className="py-1.5 pr-3 font-semibold text-[#0F172A]">{s.year}</td>
                            <td className="py-1.5 pr-3 text-emerald-700">{s.project_si}</td>
                            <td className="py-1.5 pr-3 text-amber-700">{s.control_si}</td>
                            <td className="py-1.5 pr-3 text-gray-500">{s.control_sd}</td>
                            <td className="py-1.5">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                s.period === 'baseline' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                {s.period}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-[11px] leading-snug text-gray-500">
                    {data.controls.length} matched control plots are shown on the map in amber.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
