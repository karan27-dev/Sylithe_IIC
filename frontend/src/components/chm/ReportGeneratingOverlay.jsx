import { useEffect, useState } from 'react';

/* Inline step status shown under the Export button while the LULC diligence
   report is generated. Generation runs Sylithe AI (deepseek-v4-pro) + chart
   rendering (~60–90s), so we cycle through staged steps instead of a frozen
   "Generating…" label. */
const STEPS = [
  'Fetching land history…',
  'Compiling LULC & NDVI…',
  'Sylithe AI analysing…',
  'Rendering charts…',
  'Assembling report…',
];

export function useGeneratingStep(open) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!open) { setStep(0); return; }
    const delays = [2200, 4000, 16000, 6000];
    let i = 0; const timers = [];
    const tick = () => {
      if (i < delays.length) {
        const t = setTimeout(() => { i += 1; setStep((s) => Math.min(s + 1, STEPS.length - 1)); tick(); }, delays[i]);
        timers.push(t);
      }
    };
    tick();
    return () => timers.forEach(clearTimeout);
  }, [open]);
  return STEPS[step];
}

export default function GeneratingStatus({ open }) {
  const label = useGeneratingStep(open);
  if (!open) return null;
  return <span>{label}</span>;
}
