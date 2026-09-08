import { useState, useRef, useCallback } from 'react';

/**
 * Sylithe CHM v2 — image inference state.
 *
 * Lives in the parent so the drop controls can sit in the sidebar while the
 * results take over the map area. Runs one request per resolution rather than
 * a single batched call, because that is the only way the progress box can
 * report real per-resolution state instead of an animation that pretends to.
 */

// The resolution ladder. A scene runs at every rung at or coarser than its own
// capture resolution: a 3 cm or 10 cm drone mosaic runs all four, a 20 cm
// capture runs three, a 50 cm capture runs two. Rungs finer than the capture
// are struck out — upsampling invents ground detail that was never observed.
export const GSD_OPTIONS = [
  { cm: 10, label: '10 cm', hint: 'Drone detail' },
  { cm: 20, label: '20 cm', hint: 'Fine survey' },
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
  // Browsers cannot decode TIFF/GeoTIFF, so an object URL for one renders as a
  // broken image. Pillow reads it fine server-side — this only affects display.
  const [previewBroken, setPreviewBroken] = useState(false);
  const [sourceGsd, setSourceGsd] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [runs, setRuns] = useState([]);        // completed, one per resolution
  const [failed, setFailed] = useState([]);    // resolutions that could not run
  const [steps, setSteps] = useState([]);      // live progress
  // Append-only run log. Each stage writes a line as it happens, so the main
  // area can stream what is going on rather than showing a spinner that hides
  // which resolution is being worked on and how long each one took.
  const [log, setLog] = useState([]);
  const previewRef = useRef(null);

  const accept = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setError('That file is not an image.'); return; }
    setError(''); setRuns([]); setFailed([]); setSteps([]); setLog([]); setFile(f);
    setPreviewBroken(false);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(f);
    setPreview(previewRef.current);
  };

  const clear = () => {
    setFile(null); setRuns([]); setFailed([]); setSteps([]); setLog([]); setError('');
    if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null; }
    setPreview(null); setPreviewBroken(false);
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

    const t0 = Date.now();
    const say = (text, tone = 'info') =>
      setLog((prev) => [...prev, { text, tone, t: ((Date.now() - t0) / 1000).toFixed(1) }]);

    setLog([]);
    say(`Reading ${file.name}`, 'step');
    say(`Capture resolution ${sourceGsd} cm/px`);
    say(`${targets.length} resolution${targets.length === 1 ? '' : 's'} to run: `
      + targets.map((c) => (c === 100 ? '1 m' : `${c} cm`)).join(', '), 'step');

    const base = import.meta.env.VITE_API_URL || '';
    const done = [];
    const bad = [];

    for (const cm of targets) {
      const nice = cm === 100 ? '1 m' : `${cm} cm`;
      setSteps((prev) => prev.map((s) => (s.cm === cm ? { ...s, state: 'resampling' } : s)));
      say(Number(sourceGsd) === cm
        ? `Sending at native ${nice} — no resampling needed`
        : `Resampling ${sourceGsd} cm/px to ${nice}`, 'step');
      try {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('target_gsd_cm', String(cm));
        fd.append('source_gsd_cm', String(sourceGsd));

        setSteps((prev) => prev.map((s) => (s.cm === cm ? { ...s, state: 'predicting' } : s)));
        say(`Predicting canopy height at ${nice}`);
        const res = await fetch(`${base}/api/chm/infer-image`, { method: 'POST', body: fd });
        // A server error returns an HTML page, not JSON. Parsing that throws and
        // the failure used to surface as "could not reach the server", which sent
        // debugging in the wrong direction. Report what actually came back.
        let d;
        const raw = await res.text();
        try {
          d = JSON.parse(raw);
        } catch {
          d = { status: 'error',
                message: `Server returned ${res.status} ${res.statusText || ''}`.trim() };
        }

        if (d.status === 'success') {
          done.push({ cm, ...d });
          setRuns([...done]);
          setSteps((prev) => prev.map((s) => (s.cm === cm ? { ...s, state: 'done' } : s)));
          const px = d.ground?.input_px?.join(' x ');
          say(`${nice} done — ${px} px, canopy ${d.derived?.canopy_pct ?? '—'}%, `
            + `${d.elapsed_s}s`, 'ok');
        } else {
          bad.push({ cm, message: d.message || 'Failed.' });
          setFailed([...bad]);
          say(`${nice} skipped — ${d.message || 'failed'}`, 'warn');
          setSteps((prev) => prev.map((s) =>
            (s.cm === cm ? { ...s, state: 'failed', message: d.message } : s)));
        }
      } catch (err) {
        console.error(`[chm ${cm}cm] failed:`, err);
        bad.push({ cm, message: 'Could not reach the server.' });
        setFailed([...bad]);
        say(`${nice} failed — could not reach the server`, 'error');
        setSteps((prev) => prev.map((s) =>
          (s.cm === cm ? { ...s, state: 'failed', message: 'Could not reach the server.' } : s)));
      }
    }

    if (!done.length) {
      setError('Every resolution failed. See the detail below.');
      say('No resolution produced a result', 'error');
    } else {
      say(`Comparison ready — ${done.length} of ${targets.length} resolutions`, 'ok');
    }
    setRunning(false);
  }, [file, sourceGsd, targetsFor]);

  const agreement = runs.length > 1 ? {
    canopyPct: spread(runs, (r) => r.derived?.canopy_pct),
    meanHeight: spread(runs, (r) => r.stats?.mean_height_m),
    trees: spread(runs, (r) => r.derived?.estimated_trees),
  } : null;

  return {
    file, preview, previewBroken, onPreviewError: () => setPreviewBroken(true),
    sourceGsd, setSourceGsd, accept, clear,
    running, error, runs, failed, steps, log, run,
    targets: targetsFor(sourceGsd),
    agreement,
  };
}
