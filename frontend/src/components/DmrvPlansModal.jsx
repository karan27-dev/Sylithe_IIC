import React, { useState } from 'react';
import { Check, X, MoveRight, PhoneCall, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ════════════════════════════════════════════════════════════════
   Get Full dMRV — service plans modal.
   UI follows the shadcn pricing-cards reference (light cards, Badge,
   3-column grid). Content from the Sylithe dMRV Services Brochure.
   Area-based pricing — no fixed prices (billed per hectare).
   ════════════════════════════════════════════════════════════════ */

const STATS = [
  { label: 'AI Models', value: '5' },
  { label: 'Satellites', value: '4+' },
  { label: 'Resolution', value: 'Up to 30cm' },
  { label: 'Standard', value: 'VCS' },
  { label: 'Reports / yr', value: '2×' },
];

const PLANS = [
  {
    name: 'Plan A',
    tag: 'Annual MRV Report',
    blurb: 'Verra VCS-aligned annual MRV report. 100% satellite + AI — no field surveys, no dashboard.',
    features: [
      ['Annual Verra VCS VM0047 report', 'Delivered as audit-ready PDF'],
      ['4 AI models', 'LULC · CHM · AGB · Carbon forecast'],
      ['Sentinel-2 (10 m) + NASA GEDI', 'Canopy height & vegetation indices'],
      ['10-year carbon credit forecast', 'Monte Carlo · confidence bands'],
      ['Deforestation alert reports', 'Bi-weekly NDVI breakpoint scan'],
    ],
    cta: 'Get a quote',
    recommended: false,
  },
  {
    name: 'Plan B',
    tag: 'Report + Live Dashboard',
    blurb: 'Everything in Plan A, plus a live monitoring dashboard and Maxar WorldView 50 cm–1 m imagery.',
    features: [
      ['Everything in Plan A', 'All reports & AI models included'],
      ['Live monitoring dashboard', 'Maxar + Sentinel layers · monthly NDVI'],
      ['Maxar WorldView 50 cm–1 m', 'Improved canopy & biomass mapping'],
      ['Monthly alerts', 'Deforestation & canopy-loss notifications'],
      ['Biomass & carbon trackers', 'Site-level KPI cards · zone scoring'],
      ['PDF + CSV export', 'Multi-user dashboard access'],
    ],
    cta: 'Get a quote',
    recommended: false,
  },
  {
    name: 'Plan C',
    tag: 'Premium · Tree-Level',
    blurb: 'Everything in Plan B, upgraded to Maxar 30 cm–50 cm with individual tree crown detection.',
    features: [
      ['Everything in Plan B', 'Full dashboard & alerts included'],
      ['Maxar WorldView-3 · 30 cm–50 cm', 'Highest commercial dMRV precision'],
      ['Individual tree crown detection', '5th AI model · YOLOv8 segmentation'],
      ['GPS-tagged crown shapefiles', 'Per-tree polygons for Verra PDD'],
      ['Zone-level performance scoring', 'Crown density heatmap by zone'],
    ],
    cta: 'Book a meeting',
    recommended: true,
  },
];

export default function DmrvPlansModal({ open, onClose }) {
  const { token } = useAuth();
  const [busyPlan, setBusyPlan] = useState(null);
  const [sentPlan, setSentPlan] = useState(null);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleRequest = async (plan) => {
    if (busyPlan) return;
    setBusyPlan(plan);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request-access`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: `Get Full dMRV — ${plan}` }),
      });
      const data = await res.json();
      if (!res.ok && data.message !== 'Request already pending') {
        throw new Error(data.message || 'Request failed');
      }
      setSentPlan(plan);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-8">
      <div className="relative w-full max-w-6xl my-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>

        <div className="px-6 sm:px-10 py-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4">
            <span className="inline-flex items-center rounded-full border border-[#0fa958]/30 bg-[#0fa958]/10 px-3 py-0.5 text-[12px] font-semibold text-[#0fa958]">
              dMRV Services
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl md:text-4xl tracking-tight max-w-xl text-center font-bold text-[#0F172A]">
                Your Forest, Verified From Space.
              </h2>
              <p className="text-[15px] leading-relaxed tracking-tight text-gray-500 max-w-xl text-center">
                End-to-end satellite + AI forest carbon MRV — from raw imagery to Verra VCS-ready
                documentation. No field surveys required.
              </p>
            </div>

            {/* Stats strip */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-px max-w-3xl w-full rounded-xl overflow-hidden border border-gray-200">
              {STATS.map(({ label, value }) => (
                <div key={label} className="bg-gray-50 px-3 py-3 text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-[15px] font-black text-[#0F172A] leading-none">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Service plans — billed per hectare</p>
          </div>

          {/* Plans */}
          <div className="grid pt-10 text-left grid-cols-1 lg:grid-cols-3 w-full gap-8">
            {PLANS.map((p) => (
              <div key={p.name}
                className={`w-full rounded-md border bg-white flex flex-col ${p.recommended ? 'border-[#0fa958] shadow-2xl' : 'border-gray-200'}`}>
                {/* header */}
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-normal leading-none tracking-tight text-[#0F172A] flex items-center gap-3">
                    {p.name}
                    {p.recommended && (
                      <span className="px-2 py-0.5 rounded-full bg-[#0fa958] text-white text-[10px] font-bold uppercase tracking-wider">★ Recommended</span>
                    )}
                  </h3>
                  <p className="text-[15px] font-semibold text-[#0fa958]">{p.tag}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.blurb}</p>
                </div>
                {/* content */}
                <div className="p-6 pt-0 flex flex-col gap-8 justify-start flex-1">
                  {/* area-based pricing (no numbers) */}
                  <p className="flex flex-row items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#0F172A]">Custom pricing</span>
                    <span className="text-sm text-gray-500">/ per hectare · per year</span>
                  </p>

                  <div className="flex flex-col gap-4 justify-start flex-1">
                    {p.features.map(([title, sub]) => (
                      <div key={title} className="flex flex-row gap-4">
                        <Check className="w-4 h-4 mt-1 text-[#0fa958] shrink-0" />
                        <div className="flex flex-col">
                          <p className="text-[14px] text-[#0F172A] font-medium leading-tight">{title}</p>
                          <p className="text-gray-500 text-sm">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {sentPlan === p.name ? (
                    <div className="inline-flex items-center justify-center gap-2 h-11 rounded-md text-sm font-bold bg-[#0fa958]/10 text-[#0c8f4c] border border-[#0fa958]/30">
                      <CheckCircle2 className="w-4 h-4" /> Request sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequest(p.name)}
                      disabled={!!busyPlan}
                      className={`inline-flex items-center justify-center gap-3 h-11 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${p.recommended ? 'bg-[#0fa958] text-white hover:bg-[#0c8f4c]' : 'border border-gray-300 text-[#0F172A] bg-white hover:bg-gray-50'}`}>
                      {busyPlan === p.name
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <>Request {p.recommended ? <PhoneCall className="w-4 h-4" /> : <MoveRight className="w-4 h-4" />}</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation / error */}
          {sentPlan && (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#0fa958]/10 border border-[#0fa958]/30 px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-[#0c8f4c] shrink-0" />
              <p className="text-[13px] text-[#0c8f4c]">
                Your request for <span className="font-bold">{sentPlan}</span> has been sent to the Sylithe team — we’ll review it and reach out within 24 hours.
              </p>
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">{error}</div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[13px] text-gray-500 text-center sm:text-left">
              Per-hectare pricing from <span className="text-[#0F172A] font-semibold">10 ha to 1,00,000 ha</span> · 14-day turnaround · multi-year contract discounts available.
            </p>
            <span className="text-[13px] font-bold text-[#0fa958] whitespace-nowrap">info@sylithe.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
