import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  TbPlant2, TbMap2, TbBuildingBank, TbCoin,
  TbFileReport, TbSatellite, TbLeaf, TbChartBar,
  TbShieldCheck, TbWorld, TbBriefcase, TbAlertTriangle,
  TbCloudStorm, TbTruck, TbListCheck, TbSparkles, TbLayoutDashboard,
} from 'react-icons/tb';
import {
  HiOutlineClipboardCheck, HiOutlineDocumentReport,
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlinePresentationChartBar,
} from 'react-icons/hi';
import treeLogo from '../../assets/treee13.png';
import { TooltipV2 } from '../ui/tooltip-v2';

/* ─── Sub-item (plain text, Carbon Direct style) ─────── */
const SubItem = ({ label, active, onClick, locked, hideBadge }) => (
  <button
    onClick={locked ? undefined : onClick}
    disabled={locked}
    className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-[7px] text-[14px] transition-all duration-100 rounded-md
      ${active && !locked
        ? 'bg-[#E8F5E9] text-[#0F172A] font-semibold'
        : locked
          ? 'text-gray-400 cursor-not-allowed bg-transparent'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
      }`}
  >
    {active && !locked && <span className="w-[7px] h-[7px] rounded-full bg-[#1B7A3D] shrink-0" />}
    {(!active || locked) && <span className="w-[7px] h-[7px] shrink-0" />}
    <span className="truncate">{label}</span>
    {locked && !hideBadge && (
      <div className="ml-auto">
        <TooltipV2 text="Under Process" position="right" type="success">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0 animate-pulse border border-white shadow-sm" />
        </TooltipV2>
      </div>
    )}
  </button>
);

/* ─── Lightweight "Request" pill → sends an access request to admin ─── */
const RequestPill = ({ plan }) => {
  const [state, setState] = useState('idle'); // idle | sending | done
  const submit = async (e) => {
    e.stopPropagation();
    if (state !== 'idle') return;
    setState('sending');
    try {
      const token = localStorage.getItem('sylithe_token');
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      setState(resp.ok ? 'done' : 'idle');
    } catch { setState('idle'); }
  };
  return (
    <button
      onClick={submit}
      disabled={state !== 'idle'}
      className={`ml-auto px-2.5 py-[3px] rounded-full text-[10px] font-bold uppercase tracking-wide transition-all border
        ${state === 'done'
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 cursor-default'
          : 'bg-emerald-50/60 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
    >
      {state === 'done' ? 'Requested ✓' : state === 'sending' ? 'Sending…' : 'Request'}
    </button>
  );
};

/* ─── Section Header (bold, with icon, Carbon Direct) ── */
const SectionHead = ({ icon: Icon, label, locked, requestPlan }) => (
  <div className="flex items-center gap-2.5 px-4 pt-5 pb-1.5">
    {Icon && <Icon size={18} className="text-[#0F172A] shrink-0" />}
    <span className="text-[14px] font-bold text-[#0F172A]">{label}</span>
    {requestPlan
      ? <RequestPill plan={requestPlan} />
      : locked && (
        <div className="ml-auto">
          <TooltipV2 text="Under Process" position="right" type="success">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0 animate-pulse border border-white shadow-sm" />
          </TooltipV2>
        </div>
      )}
  </div>
);

/* ─── Top-level item (like "Tasks" in Carbon Direct) ─── */
const TopItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-4 py-[9px] text-[14px] transition-all duration-100 rounded-md
      ${active
        ? 'bg-[#E8F5E9] text-[#0F172A] font-semibold'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
  >
    {Icon && <Icon size={18} className={active ? 'text-[#1B7A3D]' : 'text-gray-500'} />}
    <span>{label}</span>
  </button>
);

/* ═══════════════════════════════════════════════════════
   MAIN SIDEBAR COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function SylitheLeftNav({ activeSection, onSectionChange, isOpen, setIsOpen, forceHidden = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('sylithe_token');
    localStorage.removeItem('sylithe_user');
    sessionStorage.removeItem('syl_usage');
    navigate('/login');
  };

  const userStr = localStorage.getItem('sylithe_user');
  const user = userStr ? JSON.parse(userStr) : {};
  const role = user.primaryActivity;
  const isSuperUser = user?.email === 'karan270905@gmail.com';

  const isActive = (path) => location.pathname === path;

  /* ═══ Project Developer Sidebar ════════════════════════ */
  const renderDeveloperSections = () => (
    <>
      {/* Section 1: Project Onboarding */}
      <SectionHead icon={TbPlant2} label="Project Onboarding" />
      <div className="space-y-[1px] px-1">
        <SubItem
          label="Project Management"
          active={isActive('/dashboard/project-hub')}
          onClick={() => { navigate('/dashboard/project-hub'); }}
        />
      </div>

      {/* Dotted separator */}
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />

      {/* Section 2: Free Features */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-1.5">
        <TbSparkles size={17} className="text-emerald-600 shrink-0" />
        <span className="text-[14px] font-bold text-[#0F172A]">Free Features</span>
        <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wide">Free</span>
      </div>
      <div className="space-y-[1px] px-1">
        <SubItem
          label="Plot Inventory"
          active={activeSection === 'tree_inventory'}
          onClick={() => { onSectionChange?.('tree_inventory'); navigate('/dashboard/developer'); }}
        />
        <SubItem
          label="Land Eligibility"
          active={activeSection === 'land_eligibility'}
          onClick={() => { onSectionChange?.('land_eligibility'); navigate('/dashboard/developer'); }}
        />
        <SubItem
          label="Carbon Estimate"
          active={activeSection === 'carbon_estimate'}
          onClick={() => { onSectionChange?.('carbon_estimate'); navigate('/dashboard/developer'); }}
        />
      </div>

      {/* Dotted separator */}
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />

      {/* Section 3: Verification (paid) */}
      <SectionHead icon={TbShieldCheck} label="Verification" locked={!isSuperUser} requestPlan={isSuperUser ? undefined : 'Verification & Premium Access'} />
      <div className="space-y-[1px] px-1">
        <SubItem
          label="Canopy Height Model"
          active={activeSection === 'chm_report'}
          onClick={() => { onSectionChange?.('chm_report'); navigate('/dashboard/developer'); }}
          locked={!isSuperUser} hideBadge={!isSuperUser}
        />
        <SubItem
          label="Dynamic Baseline"
          active={activeSection === 'dynamic_baseline'}
          onClick={() => { onSectionChange?.('dynamic_baseline'); navigate('/dashboard/developer'); }}
          locked={!isSuperUser} hideBadge={!isSuperUser}
        />
        <SubItem
          label="Biomass Estimation"
          active={activeSection === 'biomass_estimation'}
          onClick={() => { onSectionChange?.('biomass_estimation'); navigate('/dashboard/developer'); }}
          locked={!isSuperUser} hideBadge={!isSuperUser}
        />
      </div>

      {/* Dotted separator */}
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />

      {/* Section 4: Reports */}
      <SectionHead icon={TbFileReport} label="Reports" locked={!isSuperUser} />
      <div className="space-y-[1px] px-1">
        <SubItem
          label="FY 2026 Dashboard"
          active={activeSection === 'reports_dashboard'}
          onClick={() => { onSectionChange?.('reports_dashboard'); navigate('/dashboard/developer'); }}
          locked={!isSuperUser} hideBadge={!isSuperUser}
        />
      </div>

      {/* Dotted separator */}
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />

      {/* List Your Project */}
      <div className="px-1">
        <SubItem
          label="List Your Project on Sylithe"
          active={activeSection === 'list_project'}
          onClick={() => { onSectionChange?.('list_project'); navigate('/dashboard/developer'); }}
        />
      </div>
    </>
  );

  /* ═══ Corporate / Consultancy Sidebar ═════════════════ */
  const renderCorporateSections = () => (
    <>
      <SectionHead icon={TbChartBar} label="Measure" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Your footprints" active={activeSection === 'footprints'} onClick={() => { onSectionChange?.('footprints'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Emissions" active={isActive('/dashboard/corporate') && (!activeSection || activeSection === 'emissions')} onClick={() => { onSectionChange?.('emissions'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Data management" active={activeSection === 'data_management'} onClick={() => { onSectionChange?.('data_management'); navigate('/dashboard/corporate'); }} />
      </div>
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />
      <SectionHead icon={TbLeaf} label="Reduce" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Curated portfolios" active={activeSection === 'curated_portfolios'} onClick={() => { onSectionChange?.('curated_portfolios'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Removals tracking" active={activeSection === 'removals_tracking'} onClick={() => { onSectionChange?.('removals_tracking'); navigate('/dashboard/corporate'); }} />
      </div>
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />
      <SectionHead icon={TbBriefcase} label="Carbon portfolio manager" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Overview" active={activeSection === 'portfolio_overview'} onClick={() => { onSectionChange?.('portfolio_overview'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Contracts" active={activeSection === 'contracts'} onClick={() => { onSectionChange?.('contracts'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Projects" active={activeSection === 'projects_list'} onClick={() => { onSectionChange?.('projects_list'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Suppliers" active={activeSection === 'suppliers'} onClick={() => { onSectionChange?.('suppliers'); navigate('/dashboard/corporate'); }} />
        <SubItem label="Deliveries & Payments" active={activeSection === 'deliveries'} onClick={() => { onSectionChange?.('deliveries'); navigate('/dashboard/corporate'); }} />
      </div>
    </>
  );

  /* ═══ Investor / Carbon Buyer Sidebar ═════════════════ */
  const renderInvestorSections = () => (
    <>
      <SectionHead icon={TbCoin} label="Portfolio" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Portfolio Overview" active={isActive('/dashboard/investor') && (!activeSection || activeSection === 'portfolio')} onClick={() => { onSectionChange?.('portfolio'); navigate('/dashboard/investor'); }} />
        <SubItem label="Project Discovery" active={activeSection === 'discovery'} onClick={() => { onSectionChange?.('discovery'); navigate('/dashboard/investor'); }} />
      </div>
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />
      <SectionHead icon={TbShieldCheck} label="Due Diligence" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Integrity Scoring" active={activeSection === 'integrity'} onClick={() => { onSectionChange?.('integrity'); navigate('/dashboard/investor'); }} />
        <SubItem label="Risk Alerts" active={activeSection === 'risk_alerts'} onClick={() => { onSectionChange?.('risk_alerts'); navigate('/dashboard/investor'); }} />
      </div>
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />
      <SectionHead icon={TbChartBar} label="Market" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Market Insights" active={activeSection === 'market'} onClick={() => { onSectionChange?.('market'); navigate('/dashboard/investor'); }} />
        <SubItem label="Credit Pricing" active={activeSection === 'credit_pricing'} onClick={() => { onSectionChange?.('credit_pricing'); navigate('/dashboard/investor'); }} />
      </div>
    </>
  );

  /* ═══ Government Sidebar ══════════════════════════════ */
  const renderGovernmentSections = () => (
    <>
      <SectionHead icon={TbSatellite} label="Monitoring" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Forest Monitoring" active={isActive('/dashboard/government') && (!activeSection || activeSection === 'forest_monitoring')} onClick={() => { onSectionChange?.('forest_monitoring'); navigate('/dashboard/government'); }} />
        <SubItem label="Compliance Tracking" active={activeSection === 'compliance_tracking'} onClick={() => { onSectionChange?.('compliance_tracking'); navigate('/dashboard/government'); }} />
      </div>
      <div className="mx-4 my-2 border-t border-dotted border-gray-200" />
      <SectionHead icon={TbFileReport} label="Reporting" />
      <div className="space-y-[1px] px-1">
        <SubItem label="Policy Reports" active={activeSection === 'policy_reports'} onClick={() => { onSectionChange?.('policy_reports'); navigate('/dashboard/government'); }} />
        <SubItem label="National Registry" active={activeSection === 'national_registry'} onClick={() => { onSectionChange?.('national_registry'); navigate('/dashboard/government'); }} />
      </div>
    </>
  );

  const renderRoleSections = () => {
    if (role === 'project_developer') return renderDeveloperSections();
    if (role === 'corporate_sustainability' || role === 'consultancy') return renderCorporateSections();
    if (role === 'carbon_buyer' || role === 'investor') return renderInvestorSections();
    if (role === 'government') return renderGovernmentSections();
    return renderCorporateSections();
  };

  return (
    <>
      {isOpen && setIsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[50] md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 z-[60] select-none transition-transform duration-300 ${forceHidden ? '-translate-x-full' : (isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}`}>

      {/* ─── Logo ─── */}
      <div className="h-[64px] flex items-center gap-3 px-5 shrink-0">
        <img src={treeLogo} alt="Sylithe" className="w-8 h-8 object-contain" />
        <span className="text-[18px] font-bold text-[#08292F] tracking-tight">Sylithe</span>
      </div>

      {/* ─── Top nav items ─── */}
      <div className="px-3 pb-1 space-y-0.5">
        <TopItem
          icon={TbMap2}
          label="Project Registry"
          active={isActive('/projects')}
          onClick={() => navigate('/projects')}
        />
      </div>

      <div className="mx-4 border-t border-dotted border-gray-200" />

      {/* ─── Role-Based Sections ─── */}
      <div className="flex-1 overflow-y-auto pb-4">
        {renderRoleSections()}
      </div>

      {/* ─── Bottom ─── */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-1 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-[8px] text-[14px] text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-all"
        >
          <LogOut size={17} className="text-gray-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}