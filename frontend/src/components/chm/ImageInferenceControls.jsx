import React, { useRef, useCallback, useState } from 'react';
import { UploadCloud, Loader2, X, AlertTriangle, Check } from 'lucide-react';
import { GSD_OPTIONS, MODEL_NATIVE_CM } from './useImageInference';

/**
 * Sidebar half of Sylithe CHM v2: drop the scene, state its capture
 * resolution, and watch each prediction run. Results render in the main area.
 */

const STEP_LABEL = {
  queued: 'Queued',
  resampling: 'Resampling…',
  predicting: 'Predicting…',
  done: 'Done',
  failed: 'Failed',
};

export default function ImageInferenceControls({ inf }) {
  const { file, preview, sourceGsd, setSourceGsd, accept, clear,
          running, error, steps, run, targets } = inf;
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const onDrop = useCallback((ev) => {
    ev.preventDefault(); setDragging(false);
    accept(ev.dataTransfer.files?.[0]);
  }, [accept]);

  const src = Number(sourceGsd);
  const noTargets = src > 0 && targets.length === 0;

  return (
    <div className="px-4 pb-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${dragging ? 'border-[#a4fca1] bg-[#a4fca1]/10' : 'border-white/20 bg-[#F1F1F1]/[0.02] hover:border-white/40'}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Uploaded scene" className="max-h-36 w-full rounded-lg object-contain" />
            <p className="mt-2 truncate text-[11px] text-gray-400">{file?.name}</p>
            <button
              onClick={(e) => { e.stopPropagation(); clear(); }}
              aria-label="Remove image"
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-gray-300 hover:text-white"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <UploadCloud size={26} className="mb-2 text-gray-400" />
            <p className="text-[13px] font-semibold text-white">Drop a drone or satellite image</p>
            <p className="mt-1 text-[11px] text-gray-400">PNG or JPEG · up to 25 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
               onChange={(e) => accept(e.target.files?.[0])} />
      </div>

      {/* Capture resolution — decides which targets are reachable */}
      <div className="mt-4">
        <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
          Capture resolution
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="number" min="0.5" step="0.5" value={sourceGsd}
            onChange={(e) => setSourceGsd(e.target.value)}
            placeholder="e.g. 20"
            className="w-full rounded-none border border-white/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium text-white outline-none placeholder-gray-500 focus:border-[#a4fca1]"
          />
          <span className="shrink-0 text-[11px] text-gray-400">cm/px</span>
        </div>
        <p className="mt-1 text-[10.5px] leading-snug text-gray-500">
          What one pixel covers on the ground. Required — it decides which resolutions
          this scene can be compared at.
        </p>
      </div>

      {/* Which targets will run */}
      {src > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Will predict at
          </p>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {GSD_OPTIONS.map((o) => {
              const on = targets.includes(o.cm);
              return (
                <div
                  key={o.cm}
                  title={on ? `${o.label} — ${o.hint}` : `Finer than the ${sourceGsd} cm capture; upsampling would invent detail`}
                  className={`rounded-md border px-1 py-2 text-center transition-colors
                    ${on ? 'border-[#a4fca1]/60 bg-[#a4fca1]/10 text-[#a4fca1]'
                         : 'border-white/10 bg-[#F1F1F1]/[0.02] text-gray-600 line-through'}`}
                >
                  <span className="block text-[12px] font-bold">{o.label}</span>
                  <span className="block text-[9px] leading-tight opacity-70">{o.hint}</span>
                </div>
              );
            })}
          </div>
          {targets.some((t) => t < MODEL_NATIVE_CM) && (
            <p className="mt-1.5 text-[10.5px] leading-snug text-gray-500">
              Targets below 1 m are extrapolation — the base model is trained near 1 m.
              Comparing them is the point.
            </p>
          )}
        </div>
      )}

      {noTargets && (
        <div className="mt-3 flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-snug text-amber-200">
            A {sourceGsd} cm capture is coarser than every target. Upsampling would invent
            ground detail that was never observed.
          </p>
        </div>
      )}

      <button
        onClick={run}
        disabled={!file || running || !src || noTargets}
        className="mt-4 w-full cursor-pointer rounded-md bg-[#a4fca1] py-2.5 text-[13px] font-black uppercase tracking-wide text-[#0d0f0d] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {running
          ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Running…</span>
          : `Predict & compare${targets.length ? ` · ${targets.length} scales` : ''}`}
      </button>

      {/* Live progress — one row per resolution */}
      {steps.length > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-[#F1F1F1]/[0.03] p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Progress
          </p>
          <div className="space-y-1.5">
            {steps.map((s) => (
              <div key={s.cm} className="flex items-center gap-2 text-[11.5px]">
                <span className="w-5 shrink-0">
                  {s.state === 'done' && <Check size={13} className="text-[#a4fca1]" />}
                  {s.state === 'failed' && <X size={13} className="text-red-400" />}
                  {(s.state === 'resampling' || s.state === 'predicting') &&
                    <Loader2 size={13} className="animate-spin text-[#a4fca1]" />}
                  {s.state === 'queued' && <span className="block h-1.5 w-1.5 rounded-full bg-gray-600" />}
                </span>
                <span className="w-12 shrink-0 font-bold text-white">
                  {s.cm === 100 ? '1 m' : `${s.cm} cm`}
                </span>
                <span className={s.state === 'failed' ? 'text-red-300' : 'text-gray-400'}>
                  {STEP_LABEL[s.state]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-[11px] leading-snug text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
