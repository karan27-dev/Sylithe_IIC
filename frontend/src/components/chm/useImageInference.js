import { useState, useRef, useCallback } from 'react';

/**
 * Sylithe CHM v2 — image inference state.
 *
 * Lives in the parent so the drop controls can sit in the sidebar while the
 * results take over the map area. Runs one request per resolution rather than
 * a single batched call, because that is the only way the progress box can
 * report real per-resolution state instead of an animation that pretends to.
 */

export const GSD_OPTIONS = [
  { cm: 20, label: '20 cm', hint: 'Drone detail' },
  { cm: 30, label: '30 cm', hint: 'Fine survey' },
  { cm: 50, label: '50 cm', hint: 'Aerial / VHR' },
  { cm: 100, label: '1 m', hint: 'Model native' },
];

export const MODEL_NATIVE_CM = 100;

/** min / max / spread of a metric across runs — the point of comparing scales. */
const spread = (runs, pick) => {
  const vals = runs.map(pick).filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (vals.length < 2) return null;
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return {
    min: Number(lo.toFixed(2)),
    max: Number(hi.toFixed(2)),
    range: Number((hi - lo).toFixed(2)),
    rangePctOfMax: hi ? Number((((hi - lo) / hi) * 100).toFixed(1)) : null,
  };
};

export default function useImageInference() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sourceGsd, setSourceGsd] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [runs, setRuns] = useState([]);        // completed, one per resolution
  const [failed, setFailed] = useState([]);    // resolutions that could not run
  const [steps, setSteps] = useState([]);      // live progress
  const previewRef = useRef(null);

  const accept = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setError('That file is not an image.'); return; }
    setError(''); setRuns([]); setFailed([]); setSteps([]); setFile(f);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(f);
    setPreview(previewRef.current);
  };

  const clear = () => {
    setFile(null); setRuns([]); setFailed([]); setSteps([]); setError('');
    if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null; }
    setPreview(null);
  };

  /** Resolutions this capture can support — never finer than the source. */
  const targetsFor = useCallback((src) => {
    const n = Number(src);
    if (!n || Number.isNaN(n)) return [];
    return GSD_OPTIONS.map((o) => o.cm).filter((cm) => cm >= n);
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    const targets = targetsFor(sourceGsd);
    if (!targets.length) {
      setError(`A ${sourceGsd} cm capture is coarser than every available target. `
             + 'Nothing can be produced without upsampling, which would invent detail.');
      return;
    }

    setRunning(true); setError(''); setRuns([]); setFailed([]);
    setSteps(targets.map((cm) => ({ cm, state: 'queued' })));

    const base = import.meta.env.VITE_API_URL || '';
    const done = [];
    const bad = [];

    for (const cm of targets) {
      setSteps((prev) => prev.map((s) => (s.cm === cm ? { ...s, state: 'resampling' } : s)));
      try {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('target_gsd_cm', String(cm));
        fd.append('source_gsd_cm', String(sourceGsd));

        setSteps((prev) => prev.map((s) => (s.cm === cm ? { ...s, state: 'predicting' } : s)));
        const res = await fetch(`${base}/api/chm/infer-image`, { method: 'POST', body: fd });
        const d = await res.json();

        if (d.status === 'success') {
          done.push({ cm, ...d });
          setRuns([...done]);
          setSteps((prev) => prev.map((s) => (s.cm === cm ? { ...s, state: 'done' } : s)));
        } else {
          bad.push({ cm, message: d.message || 'Failed.' });
          setFailed([...bad]);
          setSteps((prev) => prev.map((s) =>
            (s.cm === cm ? { ...s, state: 'failed', message: d.message } : s)));
        }
      } catch (err) {
        console.error(`[chm ${cm}cm] failed:`, err);
        bad.push({ cm, message: 'Could not reach the server.' });
        setFailed([...bad]);
        setSteps((prev) => prev.map((s) =>
          (s.cm === cm ? { ...s, state: 'failed', message: 'Could not reach the server.' } : s)));
      }
    }

    if (!done.length) setError('Every resolution failed. See the detail below.');
    setRunning(false);
  }, [file, sourceGsd, targetsFor]);

  const agreement = runs.length > 1 ? {
    canopyPct: spread(runs, (r) => r.derived?.canopy_pct),
    meanHeight: spread(runs, (r) => r.stats?.mean_height_m),
    trees: spread(runs, (r) => r.derived?.estimated_trees),
  } : null;

  return {
    file, preview, sourceGsd, setSourceGsd, accept, clear,
    running, error, runs, failed, steps, run,
    targets: targetsFor(sourceGsd),
    agreement,
  };
}
