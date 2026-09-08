import React, { useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Loader2, Check, AlertTriangle, X } from 'lucide-react';
import { MODEL_NATIVE_CM } from './useImageInference';

/**
 * Main-area half of Sylithe CHM v2.
 *
 * While a run is in flight the area streams a line per stage, so it is always
 * visible which resolution is being resampled or predicted and how long each
 * took. Afterwards the same scene is shown at every resolution it supports.
 *
 * The comparison is the substance: if canopy cover or tree count swings
 * between 10 cm and 1 m, the figure is a property of the resolution it was
 * measured at rather than of the trees.
 */

const label = (cm) => (cm === 100 ? '1 m' : `${cm} cm`);
const BAR = '#16a34a';
const BAR_EXTRAP = '#d97706';

const TONE = {
  step: 'text-[#0F172A]',
  ok: 'text-emerald-700',
  warn: 'text-amber-700',
  error: 'text-red-600',
  info: 'text-gray-500',
};

/* ── Live run log ─────────────────────────────────────────────────── */
const RunLog = ({ log, running }) => {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [log]);
  if (!log.length) return null;
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        {running
          ? <Loader2 size={15} className="animate-spin text-[#0F172A]" />
          : <Check size={15} className="text-emerald-600" />}
        <h3 className="text-[13px] font-bold text-[#0F172A]">
          {running ? 'Running' : 'Run complete'}
        </h3>
      </div>
      <div className="max-h-56 overflow-y-auto px-5 py-3 font-mono text-[12px] leading-relaxed">
        {log.map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="w-10 shrink-0 text-right text-gray-300">{l.t}s</span>
            <span className={TONE[l.tone] || TONE.info}>{l.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

/* ── Info strip, styled like the Project Information panel ────────── */
const DOT = { canopy: 'bg-emerald-500', height: 'bg-sky-500', trees: 'bg-amber-500' };

const Metric = ({ dot, label: lbl, value, unit, foot, footSub, tone }) => (
  <div className="flex-1 px-6 py-5">
    <div className="mb-2 flex items-center gap-2">
      {dot && <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />}
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{lbl}</p>
    </div>
    <p className="text-[26px] font-bold leading-none text-[#0F172A]">
      {value}{unit && <span className="ml-1 text-[15px] font-semibold text-gray-500">{unit}</span>}
    </p>
    <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
      <p className={`text-[12.5px] font-semibold ${tone || 'text-[#0F172A]'}`}>{foot}</p>
      {footSub && <p className="mt-0.5 text-[11.5px] text-gray-400">{footSub}</p>}
    </div>
  </div>
);

export default function ImageInferenceResults({ inf }) {
  const { runs, failed, running, log, preview, previewBroken, onPreviewError,
          agreement, sourceGsd, file } = inf;

  if (!runs.length && !running && !failed.length && !log.length) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F4F5F7] p-10">
        <div className="max-w-md text-center">
          <p className="text-[15px] font-bold text-[#0F172A]">Sylithe CHM v2</p>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            Drop a drone or satellite scene in the panel and give its capture resolution.
            The same scene is then predicted at every resolution it supports — 10 cm, 20 cm,
            50 cm and 1 m, whichever are at or coarser than the capture — and the results
            compared, so you can see whether a canopy figure is a property of the trees or
            of the scale it was measured at.
          </p>
        </div>
      </div>
    );
  }

  const chart = runs.map((r) => ({
    name: label(r.cm), cm: r.cm,
    canopy: r.derived?.canopy_pct ?? 0,
    trees: r.derived?.estimated_trees ?? 0,
  }));

  const spreadFoot = (s) => {
    if (!s) return { foot: '—', sub: 'needs two or more resolutions' };
    const wide = s.rangePctOfMax != null && s.rangePctOfMax > 25;
    return {
      foot: `${s.rangePctOfMax}% spread across scales`,
      sub: wide ? 'Resolution-dependent — treat with caution' : 'Stable across scales',
      tone: wide ? 'text-amber-600' : 'text-emerald-700',
    };
  };

  const cv = spreadFoot(agreement?.canopyPct);
  const hv = spreadFoot(agreement?.meanHeight);
  const tv = spreadFoot(agreement?.trees);
  const fmt = (s) => (s ? `${s.min} – ${s.max}` : '—');

  return (
    <div className="h-full overflow-y-auto bg-[#F4F5F7]">
      <div className="p-6">
        <header className="mb-5">
          <h2 className="text-[22px] font-bold leading-tight text-[#0F172A]">
            Sylithe CHM v2 — resolution comparison
          </h2>
          <p className="mt-1 text-[12.5px] text-gray-500">
            Canopy height from <span className="font-semibold text-gray-600">Meta CHMv2 · DINOv3 ViT-L/16</span>;
            resampling, scale comparison and ground-unit conversion by Sylithe.
          </p>
        </header>

        <RunLog log={log} running={running} />

        {agreement && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#FAFBFC] px-6 py-4">
              <h3 className="text-[16px] font-bold text-[#0F172A]">Comparison Summary</h3>
              <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-[12px] font-semibold text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Capture {sourceGsd} cm/px
              </span>
            </div>

            <div className="flex flex-col divide-y divide-gray-200 sm:flex-row sm:divide-x sm:divide-y-0">
              <Metric dot={DOT.canopy} label="Canopy cover" value={fmt(agreement.canopyPct)} unit="%"
                      foot={cv.foot} footSub={cv.sub} tone={cv.tone} />
              <Metric dot={DOT.height} label="Mean height" value={fmt(agreement.meanHeight)} unit="m"
                      foot={hv.foot} footSub={hv.sub} tone={hv.tone} />
              <Metric dot={DOT.trees} label="Trees (est.)" value={fmt(agreement.trees)}
                      foot={tv.foot} footSub={tv.sub} tone={tv.tone} />
            </div>

            <div className="grid grid-cols-2 gap-y-4 border-t border-gray-200 bg-[#FAFBFC] px-6 py-4 sm:grid-cols-4">
              {[
                ['Resolutions run', `${runs.length} of ${runs.length + failed.length}`],
                ['Ground covered', runs[0]?.ground?.ground_coverage_m
                  ? `${runs[0].ground.ground_coverage_m.join(' × ')} m` : '—'],
                ['Base model native', `${MODEL_NATIVE_CM} cm/px`],
                ['Total time', `${runs.reduce((a, r) => a + (r.elapsed_s || 0), 0).toFixed(1)}s`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{k}</p>
                  <p className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(runs.length > 0 || file) && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#FAFBFC] px-6 py-4">
              <h3 className="text-[16px] font-bold text-[#0F172A]">Height maps</h3>
              <p className="mt-0.5 text-[12px] text-gray-500">
                Source scene first, then one prediction per resolution. Scroll sideways to compare.
              </p>
            </div>
            <div className="overflow-x-auto p-6">
              <div className="flex gap-5" style={{ minWidth: 'min-content' }}>
                {file && (
                  <figure className="w-[420px] shrink-0">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      {preview && !previewBroken ? (
                        <img src={preview} alt="Source scene" onError={onPreviewError}
                             className="h-[420px] w-full object-contain" />
                      ) : (
                        <div className="flex h-[420px] w-full items-center justify-center px-6 text-center text-[12px] text-gray-400">
                          No browser preview for {file.name?.split('.').pop()?.toUpperCase()} —
                          the file is read correctly server-side
                        </div>
                      )}
                    </div>
                    <figcaption className="mt-2.5">
                      <p className="text-[13.5px] font-bold text-[#0F172A]">Source scene</p>
                      <p className="text-[11.5px] text-gray-500">{sourceGsd} cm/px as captured · {file.name}</p>
                    </figcaption>
                  </figure>
                )}
                {runs.map((r) => (
                  <figure key={r.cm} className="w-[420px] shrink-0">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#0d0f0d]">
                      {r.height_map_png
                        ? <img src={`data:image/png;base64,${r.height_map_png}`}
                               alt={`Canopy height at ${label(r.cm)}`}
                               className="h-[420px] w-full object-contain" />
                        : <div className="flex h-[420px] items-center justify-center text-[12px] text-gray-500">no map</div>}
                    </div>
                    <figcaption className="mt-2.5">
                      <p className="flex items-center gap-2 text-[13.5px] font-bold text-[#0F172A]">
                        {label(r.cm)}
                        {r.cm < MODEL_NATIVE_CM && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-amber-700">
                            extrapolated
                          </span>
                        )}
                      </p>
                      <p className="text-[11.5px] text-gray-500">
                        {r.ground?.input_px?.join(' × ')} px · canopy {r.derived?.canopy_pct ?? '—'}% · {r.elapsed_s}s
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        )}

        {chart.length > 1 && (
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {[['Canopy cover by resolution', 'canopy', '%'],
              ['Estimated trees by resolution', 'trees', '']].map(([title, key, unit]) => (
              <div key={key} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-[#FAFBFC] px-6 py-4">
                  <h3 className="text-[16px] font-bold text-[#0F172A]">{title}</h3>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    Amber bars are below the base model&apos;s native scale.
                  </p>
                </div>
                <div className="h-[240px] p-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }}
                             label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey={key} radius={[6, 6, 0, 0]}>
                        {chart.map((c) => (
                          <Cell key={c.cm} fill={c.cm < MODEL_NATIVE_CM ? BAR_EXTRAP : BAR} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}

        {(runs.length > 0 || failed.length > 0) && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#FAFBFC] px-6 py-4">
              <h3 className="text-[16px] font-bold text-[#0F172A]">All resolutions</h3>
            </div>
            <div className="overflow-x-auto px-6 py-4">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wide text-gray-400">
                    <th className="pb-2 pr-4 font-bold">Resolution</th>
                    <th className="pb-2 pr-4 font-bold">Input</th>
                    <th className="pb-2 pr-4 font-bold">Mean h</th>
                    <th className="pb-2 pr-4 font-bold">Max h</th>
                    <th className="pb-2 pr-4 font-bold">Canopy</th>
                    <th className="pb-2 pr-4 font-bold">Trees</th>
                    <th className="pb-2 font-bold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.cm} className="border-b border-gray-100 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-[#0F172A]">{label(r.cm)}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{r.ground?.input_px?.join('×')}</td>
                      <td className="py-2.5 pr-4">{r.stats?.mean_height_m ?? '—'} m</td>
                      <td className="py-2.5 pr-4">{r.stats?.max_height_m ?? '—'} m</td>
                      <td className="py-2.5 pr-4">{r.derived?.canopy_pct ?? '—'}%</td>
                      <td className="py-2.5 pr-4">{r.derived?.estimated_trees ?? '—'}</td>
                      <td className="py-2.5 text-gray-500">{r.elapsed_s}s</td>
                    </tr>
                  ))}
                  {failed.map((f) => (
                    <tr key={`f-${f.cm}`} className="border-b border-gray-100 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-gray-400">{label(f.cm)}</td>
                      <td className="py-2.5 text-[12px] text-amber-700" colSpan={6}>
                        <span className="inline-flex items-center gap-1.5"><X size={12} /> {f.message}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {agreement && (
                <p className="mt-4 flex gap-2 text-[11.5px] leading-snug text-gray-500">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  A wide spread means the figure depends on the resolution it was measured at,
                  not on the trees. Agreement across scales is the evidence that a number is real.
                  Indicative either way — verify against field measurements before use in a claim.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
