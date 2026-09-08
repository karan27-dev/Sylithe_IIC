import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { MODEL_NATIVE_CM } from './useImageInference';

/**
 * Main-area half of Sylithe CHM v2: the same scene predicted at every
 * resolution it supports, side by side.
 *
 * The comparison is the substance. If canopy cover or tree count swings
 * between 20 cm and 1 m, the figure is a property of the resolution it was
 * measured at rather than of the trees — which is exactly what a reviewer
 * needs to see before the number reaches a claim.
 */

const label = (cm) => (cm === 100 ? '1 m' : `${cm} cm`);
const BAR = '#a4fca1';
const BAR_EXTRAP = '#fbbf24';

const Spread = ({ title, unit, s }) => {
  if (!s) return null;
  const wide = s.rangePctOfMax != null && s.rangePctOfMax > 25;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-1 text-[19px] font-bold leading-none text-[#0F172A]">
        {s.min} – {s.max}<span className="ml-1 text-[13px] font-semibold text-gray-500">{unit}</span>
      </p>
      <p className={`mt-1.5 text-[11px] font-semibold ${wide ? 'text-amber-600' : 'text-emerald-700'}`}>
        {s.rangePctOfMax}% spread across scales
      </p>
      <p className="mt-0.5 text-[10.5px] leading-snug text-gray-500">
        {wide ? 'Resolution-dependent — treat with caution.' : 'Stable across scales.'}
      </p>
    </div>
  );
};

export default function ImageInferenceResults({ inf }) {
  const { runs, failed, running, steps, preview, previewBroken, onPreviewError,
          agreement, sourceGsd, file } = inf;

  if (!runs.length && !running && !failed.length) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FAFAF9] p-10">
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
    name: label(r.cm),
    cm: r.cm,
    canopy: r.derived?.canopy_pct ?? 0,
    mean: r.stats?.mean_height_m ?? 0,
    trees: r.derived?.estimated_trees ?? 0,
  }));

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF9]">
      <div className="p-6">
        <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold leading-tight text-[#0F172A]">
              Sylithe CHM v2 — resolution comparison
            </h2>
            <p className="mt-1 text-[12px] text-gray-500">
              {runs[0]?.base_model_label
                ? <>Canopy height from <span className="font-semibold">{runs[0].base_model_label}</span>; resampling, scale comparison and ground-unit conversion by Sylithe.</>
                : 'One scene, every resolution it supports.'}
            </p>
          </div>
          {sourceGsd && (
            <span className="rounded-full bg-[#08292F] px-3 py-1 text-[11px] font-bold text-white">
              Capture {sourceGsd} cm/px
            </span>
          )}
        </header>

        {running && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Loader2 size={18} className="animate-spin text-[#08292F]" />
            <p className="text-[13px] text-gray-700">
              {steps.filter((s) => s.state === 'done').length} of {steps.length} resolutions complete
              {steps.find((s) => s.state === 'predicting') &&
                ` · predicting at ${label(steps.find((s) => s.state === 'predicting').cm)}`}
              {steps.find((s) => s.state === 'resampling') &&
                ` · resampling to ${label(steps.find((s) => s.state === 'resampling').cm)}`}
            </p>
          </div>
        )}

        {agreement && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Spread title="Canopy cover" unit="%" s={agreement.canopyPct} />
            <Spread title="Mean height" unit="m" s={agreement.meanHeight} />
            <Spread title="Trees (est.)" unit="" s={agreement.trees} />
          </div>
        )}

        {/* Per-resolution height maps */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {file && (
            <figure className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {preview && !previewBroken ? (
                <img src={preview} alt="Source scene" onError={onPreviewError}
                     className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-gray-100 px-3 text-center text-[11px] text-gray-400">
                  No browser preview for {file.name?.split('.').pop()?.toUpperCase()}
                </div>
              )}
              <figcaption className="border-t border-gray-100 px-3 py-2">
                <p className="text-[12px] font-bold text-[#0F172A]">Source</p>
                <p className="text-[10.5px] text-gray-500">{sourceGsd} cm/px as captured</p>
              </figcaption>
            </figure>
          )}
          {runs.map((r) => (
            <figure key={r.cm} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {r.height_map_png
                ? <img src={`data:image/png;base64,${r.height_map_png}`}
                       alt={`Canopy height at ${label(r.cm)}`}
                       className="aspect-square w-full bg-[#0d0f0d] object-contain" />
                : <div className="flex aspect-square items-center justify-center bg-gray-100 text-[11px] text-gray-400">no map</div>}
              <figcaption className="border-t border-gray-100 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#0F172A]">
                  {label(r.cm)}
                  {r.cm < MODEL_NATIVE_CM && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                      extrapolated
                    </span>
                  )}
                </p>
                <p className="text-[10.5px] text-gray-500">
                  {r.ground?.input_px?.join(' × ')} px · {r.elapsed_s}s
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Metric by resolution */}
        {chart.length > 1 && (
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {[['Canopy cover by resolution', 'canopy', '%'],
              ['Estimated trees by resolution', 'trees', '']].map(([title, key, unit]) => (
              <div key={key} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="font-bold text-[#0F172A]">{title}</h3>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    Amber bars are below the base model's native scale.
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

        {/* Numbers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-3 font-bold text-[#0F172A]">All resolutions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="pb-2 pr-3 font-bold">Resolution</th>
                  <th className="pb-2 pr-3 font-bold">Input</th>
                  <th className="pb-2 pr-3 font-bold">Mean h</th>
                  <th className="pb-2 pr-3 font-bold">Max h</th>
                  <th className="pb-2 pr-3 font-bold">Canopy</th>
                  <th className="pb-2 pr-3 font-bold">Trees</th>
                  <th className="pb-2 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.cm} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-3 font-semibold text-[#0F172A]">{label(r.cm)}</td>
                    <td className="py-2 pr-3 text-gray-500">{r.ground?.input_px?.join('×')}</td>
                    <td className="py-2 pr-3">{r.stats?.mean_height_m ?? '—'} m</td>
                    <td className="py-2 pr-3">{r.stats?.max_height_m ?? '—'} m</td>
                    <td className="py-2 pr-3">{r.derived?.canopy_pct ?? '—'}%</td>
                    <td className="py-2 pr-3">{r.derived?.estimated_trees ?? '—'}</td>
                    <td className="py-2 text-gray-500">{r.elapsed_s}s</td>
                  </tr>
                ))}
                {failed.map((f) => (
                  <tr key={`f-${f.cm}`} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-3 font-semibold text-gray-400">{label(f.cm)}</td>
                    <td className="py-2 text-[11.5px] text-amber-700" colSpan={6}>{f.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {agreement && (
            <p className="mt-3 flex gap-2 text-[11.5px] leading-snug text-gray-500">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-gray-400" />
              A wide spread means the figure depends on the resolution it was measured at,
              not on the trees. Agreement across scales is the evidence that a number is real.
              Indicative either way — verify against field measurements before use in a claim.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
