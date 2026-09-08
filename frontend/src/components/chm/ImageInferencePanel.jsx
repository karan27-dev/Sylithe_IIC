import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Loader2, X, AlertTriangle } from 'lucide-react';

/**
 * Canopy height from a dropped drone or satellite image (Meta CHMv2).
 *
 * The resolution selector is the substantive control here, not a convenience.
 * CHMv2 is trained on satellite imagery, so a 3 cm/px drone orthomosaic is far
 * outside its training distribution. Telling the panel the capture GSD lets the
 * backend resample the image to the scale the model expects before inference.
 */

const GSD_OPTIONS = [
  { cm: 20, label: '20 cm', hint: 'Drone detail' },
  { cm: 30, label: '30 cm', hint: 'Fine survey' },
  { cm: 50, label: '50 cm', hint: 'Aerial / VHR' },
  { cm: 100, label: '1 m', hint: 'Model native' },
];

const MODEL_NATIVE_CM = 100;

export default function ImageInferencePanel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sourceGsd, setSourceGsd] = useState('');
  const [targetGsd, setTargetGsd] = useState(100);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const accept = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setError('That file is not an image.'); return; }
    setError(''); setResult(null); setFile(f);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
  };

  const onDrop = useCallback((ev) => {
    ev.preventDefault(); setDragging(false);
    accept(ev.dataTransfer.files?.[0]);
  }, []);

  const clear = () => {
    setFile(null); setResult(null); setError('');
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return null; });
    if (inputRef.current) inputRef.current.value = '';
  };

  const run = async () => {
    if (!file) return;
    setRunning(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('target_gsd_cm', String(targetGsd));
      if (sourceGsd) fd.append('source_gsd_cm', String(sourceGsd));
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/chm/infer-image`, { method: 'POST', body: fd });
      const d = await res.json();
      if (d.status === 'success') setResult(d);
      else if (d.status === 'not_configured') { setResult(d); setError(d.message); }
      else setError(d.message || 'Inference failed.');
    } catch (err) {
      console.error('[chm/infer-image] failed:', err);
      setError('Could not reach the server. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const wouldUpsample = sourceGsd && Number(sourceGsd) > targetGsd;
  const extrapolating = targetGsd < MODEL_NATIVE_CM;
  const g = result?.ground;
  const s = result?.stats;

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
            <img src={preview} alt="Uploaded scene" className="max-h-40 w-full rounded-lg object-contain" />
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

      {/* Capture resolution */}
      <div className="mt-4">
        <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
          Capture resolution
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="number" min="0.5" step="0.5" value={sourceGsd}
            onChange={(e) => setSourceGsd(e.target.value)}
            placeholder="e.g. 3"
            className="w-full rounded-none border border-white/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium text-white outline-none placeholder-gray-500 focus:border-[#a4fca1]"
          />
          <span className="shrink-0 text-[11px] text-gray-400">cm/px</span>
        </div>
        <p className="mt-1 text-[10.5px] leading-snug text-gray-500">
          What one pixel of your image covers on the ground. Without it the image is sent
          at its own scale and the target below is not applied.
        </p>
      </div>

      {/* Target resolution */}
      <div className="mt-4">
        <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
          Predict at
        </label>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {GSD_OPTIONS.map((o) => (
            <button
              key={o.cm}
              onClick={() => setTargetGsd(o.cm)}
              className={`cursor-pointer rounded-md border px-1 py-2 transition-colors
                ${targetGsd === o.cm
                  ? 'border-[#a4fca1] bg-[#a4fca1]/15 text-[#a4fca1]'
                  : 'border-white/15 bg-[#F1F1F1]/[0.02] text-gray-300 hover:border-white/30'}`}
            >
              <span className="block text-[12px] font-bold">{o.label}</span>
              <span className="block text-[9px] leading-tight opacity-70">{o.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Honest warnings */}
      {wouldUpsample && (
        <div className="mt-3 flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-snug text-amber-200">
            Your image is {sourceGsd} cm/px, coarser than the {targetGsd} cm target. Upsampling
            would invent detail that was never captured — pick a target at or above {sourceGsd} cm.
          </p>
        </div>
      )}
      {extrapolating && !wouldUpsample && (
        <div className="mt-3 flex gap-2 rounded-md border border-white/15 bg-[#F1F1F1]/[0.03] p-2.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <p className="text-[11px] leading-snug text-gray-400">
            CHMv2 is trained on satellite imagery near 1 m. Predicting at {targetGsd} cm is
            extrapolation — useful for detail, but check it against field measurements.
          </p>
        </div>
      )}

      <button
        onClick={run}
        disabled={!file || running || wouldUpsample}
        className="mt-4 w-full cursor-pointer rounded-md bg-[#a4fca1] py-2.5 text-[13px] font-black uppercase tracking-wide text-[#0d0f0d] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {running ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Predicting…</span>
                 : 'Predict canopy height'}
      </button>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-[11px] leading-snug text-red-200">
          {error}
        </p>
      )}

      {/* Result */}
      {result?.status === 'success' && (
        <div className="mt-5 space-y-3">
          {result.height_map_png && (
            <img
              src={`data:image/png;base64,${result.height_map_png}`}
              alt="Predicted canopy height map"
              className="w-full rounded-lg border border-white/10"
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            {[
              ['Mean height', s?.mean_height_m != null ? `${s.mean_height_m} m` : '—'],
              ['Max height', s?.max_height_m != null ? `${s.max_height_m} m` : '—'],
              ['Canopy cover', result.derived?.canopy_pct != null ? `${result.derived.canopy_pct}%` : '—'],
              ['Trees (est.)', result.derived?.estimated_trees ?? '—'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-white/10 bg-[#F1F1F1]/[0.03] p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">{k}</p>
                <p className="mt-0.5 text-[15px] font-bold text-white">{v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-[#F1F1F1]/[0.03] p-3 text-[10.5px] leading-relaxed text-gray-400">
            <p><span className="text-gray-500">Model:</span> {result.model}</p>
            <p className="mt-1">
              <span className="text-gray-500">Predicted at:</span> {g.target_gsd_cm} cm/px
              {g.resampled && g.source_gsd_cm ? ` (resampled from ${g.source_gsd_cm} cm)` : ''}
            </p>
            <p className="mt-1"><span className="text-gray-500">Input:</span> {g.input_px?.join(' × ')} px
              {' · '}covers {g.ground_coverage_m?.join(' × ')} m</p>
            <p className="mt-1"><span className="text-gray-500">Run time:</span> {result.elapsed_s}s</p>
            {g.note && <p className="mt-1.5 text-amber-300/80">{g.note}</p>}
          </div>

          <p className="text-[10.5px] italic leading-snug text-gray-500">{result.caveat}</p>
        </div>
      )}

      {result?.status === 'not_configured' && (
        <div className="mt-4 rounded-md border border-white/15 bg-[#F1F1F1]/[0.03] p-3">
          <p className="text-[12px] font-bold text-white">Inference endpoint not connected</p>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
            The image was prepared — {g?.input_px?.join(' × ')} px at {g?.target_gsd_cm} cm/px,
            covering {g?.ground_coverage_m?.join(' × ')} m. Deploy {result.model} to a GPU
            Hugging Face Space and set <code className="text-gray-300">CHM_INFERENCE_URL</code> to
            enable prediction.
          </p>
        </div>
      )}
    </div>
  );
}
