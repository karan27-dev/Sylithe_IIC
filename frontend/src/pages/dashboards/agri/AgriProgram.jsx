import React from 'react';
import {
  TbUsersGroup, TbUserPlus, TbShieldCheck, TbFileCertificate, TbLock,
  TbTrees, TbChartLine, TbFlame, TbRecycle, TbFlask, TbClipboardCheck,
  TbCoin, TbDeviceMobile, TbArrowRight, TbAlertTriangle, TbCircleCheck,
} from 'react-icons/tb';
import { AGRI_GROUPS, getAgriStage, CENSUS_MAX_TREES_PER_HA } from './agriStages';

const STAGE_ICON = {
  agri_fpo: TbUsersGroup,
  agri_enroll: TbUserPlus,
  agri_eligibility: TbShieldCheck,
  agri_agreements: TbFileCertificate,
  agri_baseline: TbLock,
  agri_census: TbTrees,
  agri_growth: TbChartLine,
  agri_burn: TbFlame,
  agri_residue: TbRecycle,
  agri_biochar: TbFlask,
  agri_verification: TbClipboardCheck,
  agri_payouts: TbCoin,
  agri_portal: TbDeviceMobile,
};

const GROUP_ACCENT = {
  onboarding: '#0F766E',
  census: '#166534',
  biochar: '#92400E',
  credits: '#08292F',
};

/* ─── Shared shell ──────────────────────────────────────────────── */
const StageShell = ({ children }) => (
  <div className="h-full overflow-y-auto bg-[#F1F1F1]">
    <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
  </div>
);

const Pill = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
};

/* ─── Programme flow overview ───────────────────────────────────── */
const FlowOverview = ({ onOpen }) => (
  <StageShell>
    <header className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Pill tone="green">Census-based · VM0047 v1.1</Pill>
        <Pill tone="amber">Bund agroforestry + biochar</Pill>
      </div>
      <h1 className="text-[26px] font-bold leading-tight text-[#0F172A]">Agroforestry &amp; Biochar Programme</h1>
      <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-gray-600">
        One FPO signs the registry. Hundreds of farmers enrol their parcels. Every tree is counted
        from space and tagged on the ground, every residue burn is detected, and the same field
        earns twice — tree credits that compound and biochar credits that pay from season one.
      </p>
    </header>

    {/* The constraint that shapes the whole design */}
    <div className="mb-7 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <TbAlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-[13px] leading-relaxed text-amber-900">
          <p className="font-bold">The census approach caps planting at {CENSUS_MAX_TREES_PER_HA} trees per hectare.</p>
          <p className="mt-1">
            Above that the activity counts as land-use change and must use the heavier area-based
            approach. Only trees planted <em>by the project</em> are creditable — existing farm trees
            are baseline and earn nothing. Every tree must be individually tagged and its survival
            tracked. This is why the programme targets <strong>bund agroforestry</strong>: trees along
            field boundaries land naturally at 30–50/ha and cost the farmer no cropping area.
          </p>
        </div>
      </div>
    </div>

    {/* Two entry paths */}
    <h2 className="mb-3 text-[15px] font-bold text-[#0F172A]">Two ways in, one pipeline</h2>
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {[
        { t: 'FPO-first', d: 'The aggregator registers, opens a pool, and enrols its members at a village meeting.', tone: 'border-[#08292F]' },
        { t: 'Farmer-first', d: 'A farmer registers their own parcel and is matched to the nearest eligible pool in their district.', tone: 'border-emerald-600' },
      ].map((p) => (
        <div key={p.t} className={`rounded-xl border-l-4 ${p.tone} border-y border-r border-gray-200 bg-white p-4 shadow-sm`}>
          <p className="text-[14px] font-bold text-[#0F172A]">{p.t}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{p.d}</p>
        </div>
      ))}
    </div>

    {/* Stage pipeline */}
    <h2 className="mb-3 text-[15px] font-bold text-[#0F172A]">The pipeline</h2>
    <div className="space-y-6">
      {AGRI_GROUPS.map((group) => {
        const stages = group.stages.filter((s) => s.key !== 'agri_flow');
        if (!stages.length) return null;
        const accent = GROUP_ACCENT[group.id] || '#08292F';
        return (
          <section key={group.id}>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
              <h3 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                {group.label}
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stages.map((s) => {
                const Icon = STAGE_ICON[s.key] || TbCircleCheck;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => onOpen?.(s.key)}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08292F] focus-visible:ring-offset-2"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon size={18} style={{ color: accent }} className="shrink-0" />
                      <span className="text-[10px] font-black tracking-wider text-gray-400">{s.code}</span>
                    </div>
                    <p className="text-[13.5px] font-bold text-[#0F172A]">{s.title}</p>
                    <p className="mt-1 text-[12px] leading-snug text-gray-500">{s.blurb}</p>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#08292F] opacity-0 transition-opacity group-hover:opacity-100">
                      Open <TbArrowRight size={13} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>

    {/* Why the two tracks matter */}
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#0F172A]">Why two credit tracks</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
        Trees pay from roughly year five. Smallholders will not wait that long, which is why
        agroforestry projects lose their farmers. Biochar pays every season from year one and
        simultaneously raises yield and cuts fertiliser cost — it bridges the gap while the trees grow.
      </p>
      <div className="mt-4 space-y-2 font-mono text-[11px] text-gray-600">
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-sans font-bold text-[#92400E]">Biochar</span>
          <span className="tracking-widest text-[#92400E]">███ ███ ███ ███ ███ ███</span>
          <span className="font-sans text-gray-500">every season</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-sans font-bold text-[#166534]">Trees</span>
          <span className="tracking-widest text-[#166534]"> ·   ·   ▁   ▂   ▃   ▅ </span>
          <span className="font-sans text-gray-500">compounds later</span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <span className="w-16 shrink-0" />
          <span className="tracking-widest font-sans text-gray-400">Yr1 Yr2 Yr3 Yr4 Yr5 Yr6</span>
        </div>
      </div>
    </div>
  </StageShell>
);

/* ─── Individual stage ──────────────────────────────────────────── */
const StageView = ({ stage, onBack }) => {
  const Icon = STAGE_ICON[stage.key] || TbCircleCheck;
  const accent = GROUP_ACCENT[stage.groupId] || '#08292F';
  return (
    <StageShell>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-bold text-gray-500 transition-colors hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08292F] focus-visible:ring-offset-2"
      >
        <TbArrowRight size={14} className="rotate-180" /> Programme flow
      </button>

      <header className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <Icon size={22} style={{ color: accent }} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-wider text-gray-400">{stage.code}</span>
            <Pill>{stage.group}</Pill>
          </div>
          <h1 className="mt-0.5 text-[22px] font-bold leading-tight text-[#0F172A]">{stage.title}</h1>
          <p className="mt-1 text-[14px] text-gray-600">{stage.blurb}</p>
        </div>
      </header>

      {stage.role && (
        <div className="mb-6 rounded-xl border-l-4 bg-white p-4 shadow-sm" style={{ borderLeftColor: accent }}>
          <p className="text-[13.5px] font-medium leading-relaxed text-[#0F172A]">{stage.role}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {[['Inputs', stage.inputs], ['Outputs', stage.outputs]].map(([label, items]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-[12px] font-black uppercase tracking-wide text-gray-400">{label}</h2>
            <ul className="space-y-2">
              {(items || []).map((it) => (
                <li key={it} className="flex gap-2 text-[13px] leading-snug text-gray-700">
                  <TbCircleCheck size={15} className="mt-0.5 shrink-0" style={{ color: accent }} />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white/60 p-5 text-center">
        <p className="text-[13px] font-semibold text-gray-600">Screen not built yet</p>
        <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-gray-500">
          The pipeline and its methodology rules are defined. This stage&apos;s interface and its
          backend endpoints are the next build step.
        </p>
      </div>
    </StageShell>
  );
};

/* ─── Entry point ───────────────────────────────────────────────── */
export default function AgriProgram({ section, onSectionChange }) {
  if (!section || section === 'agri_flow') {
    return <FlowOverview onOpen={onSectionChange} />;
  }
  const stage = getAgriStage(section);
  if (!stage) return <FlowOverview onOpen={onSectionChange} />;
  return <StageView stage={stage} onBack={() => onSectionChange?.('agri_flow')} />;
}
