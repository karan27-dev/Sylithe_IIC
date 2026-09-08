import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiPlus, HiBell, HiArrowRight, HiCheckCircle,
  HiExclamation, HiClock, HiChevronRight,
} from 'react-icons/hi';
import { TbSatellite, TbMap2, TbLeaf, TbChartBar, TbAlertTriangle, TbMenu2 } from 'react-icons/tb';
import SylitheLeftNav from '../components/chm/SylitheLeftNav';

// ─── Auth guard ──────────────────────────────────────────────────────────────
const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('sylithe_token');
    const stored = localStorage.getItem('sylithe_user');
    if (!token || !stored) { navigate('/login'); return; }
    try { setUser(JSON.parse(stored)); } catch { navigate('/login'); }
  }, [navigate]);

  return user;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => n ? Number(n).toLocaleString() : '—';

const STATUS_CONFIG = {
  analyzed:    { label: 'Analyzed',    color: '#16a34a', bg: '#dcfce7', dot: '#16a34a' },
  mrv_active:  { label: 'MRV Active',  color: '#2563eb', bg: '#dbeafe', dot: '#2563eb' },
  report_ready:{ label: 'Report Ready',color: '#7c3aed', bg: '#ede9fe', dot: '#7c3aed' },
  draft:       { label: 'Draft',       color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
  alert:       { label: 'Alert',       color: '#dc2626', bg: '#fee2e2', dot: '#dc2626' },
};

const STEP_LABELS = ['Boundary', 'LULC', 'CHM', 'DCAB', 'AGB', 'MRV Report', 'Credits'];

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, trend, chartData, color = '#16a34a' }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-[#0F172A] leading-none">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
      </div>
      {trend && (
        <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-600">
          {trend}
        </span>
      )}
    </div>
    {chartData && (
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${label})`} dot={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
            labelStyle={{ display: 'none' }}
            formatter={(v) => [v, '']}
          />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onSelect, selected }) => {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
  const completedSteps = STEP_LABELS.indexOf(project.lastStep ?? 'Boundary') + 1;
  const pct = Math.round((completedSteps / STEP_LABELS.length) * 100);

  return (
    <div
      onClick={() => onSelect(project)}
      className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
        selected ? 'border-[#08292F] bg-[#08292F]/5' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{project.icon || '🌿'}</span>
          <div>
            <p className="font-bold text-[#0F172A] text-[14px] leading-snug">{project.name}</p>
            <p className="text-[11px] text-gray-400">{project.state} · {project.area_ha ? `${fmt(project.area_ha)} ha` : 'Area TBD'}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
          style={{ backgroundColor: status.bg, color: status.color }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ backgroundColor: status.dot }} />
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <p className="text-[10px] text-gray-400 font-medium">Analysis Progress</p>
          <p className="text-[10px] text-gray-400">{pct}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: status.color }}
          />
        </div>
      </div>

      {/* Metrics row */}
      {project.lulc_pct !== undefined && (
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">LULC</p>
            <p className="text-[13px] font-bold text-[#16a34a]">{project.lulc_pct}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">CHM avg</p>
            <p className="text-[13px] font-bold text-[#0F172A]">{project.chm_avg ? `${project.chm_avg}m` : '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">tCO₂/yr</p>
            <p className="text-[13px] font-bold text-[#16a34a]">{project.credits_est ? fmt(project.credits_est) : '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Activity Feed Item ───────────────────────────────────────────────────────
const ActivityItem = ({ type, title, sub, time }) => {
  const icons = {
    success: <HiCheckCircle className="text-green-500 shrink-0" size={16} />,
    alert:   <HiExclamation className="text-red-400 shrink-0" size={16} />,
    info:    <TbSatellite className="text-blue-400 shrink-0" size={16} />,
    pending: <HiClock className="text-amber-400 shrink-0" size={16} />,
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {icons[type] || icons.info}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#0F172A] font-medium leading-snug">{title}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-[10px] text-gray-400 shrink-0">{time}</span>
    </div>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ project, onAnalyze }) => {
  if (!project) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <TbMap2 size={40} className="text-gray-300 mb-4" />
      <p className="text-gray-500 font-semibold">Select a project</p>
      <p className="text-gray-400 text-[12px] mt-1">Click on any project to see its details here</p>
    </div>
  );

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{project.icon || '🌿'}</span>
          <div>
            <h3 className="font-bold text-[#0F172A] text-[15px] leading-snug">{project.name}</h3>
            <p className="text-[12px] text-gray-400">{project.state} · {project.area_ha ? `${fmt(project.area_ha)} ha` : ''}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ backgroundColor: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>

      <div className="p-5 space-y-5 flex-1">

        {/* Progress pipeline */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Analysis Pipeline</p>
          <div className="space-y-2">
            {STEP_LABELS.map((step, i) => {
              const completed = i < (STEP_LABELS.indexOf(project.lastStep ?? 'Boundary') + 1);
              const current = STEP_LABELS[STEP_LABELS.indexOf(project.lastStep ?? 'Boundary')] === step;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    completed ? 'bg-[#16a34a]' : current ? 'border-2 border-amber-400' : 'border border-gray-200'
                  }`}>
                    {completed && <HiCheckCircle size={12} className="text-white" />}
                    {current && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  </div>
                  <span className={`text-[12px] font-medium ${completed ? 'text-[#0F172A]' : current ? 'text-amber-500' : 'text-gray-300'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics */}
        {project.lulc_pct !== undefined && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Key Metrics</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'LULC Eligible', value: `${project.lulc_pct}%` },
                { label: 'Avg Canopy Ht', value: project.chm_avg ? `${project.chm_avg}m` : '—' },
                { label: 'AGB Carbon', value: project.agb_stock ? `${fmt(project.agb_stock)} tC` : '—' },
                { label: 'Est. Credits/yr', value: project.credits_est ? `${fmt(project.credits_est)}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-[14px] font-bold text-[#16a34a]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onAnalyze}
            className="w-full bg-[#08292F] text-white font-bold py-3 rounded-xl text-[13px] flex items-center justify-center gap-2 hover:bg-[#0d3d46] transition-colors"
          >
            <TbSatellite size={15} /> Open Analysis Tool
          </button>
          <button className="w-full border border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            Generate MRV Report
          </button>
          <button className="w-full border border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            View on Registry
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const user = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSection, setActiveSection] = useState('lulc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('sylithe_analyses');
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  if (!user) return null;

  const firstName = user.fullName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const totalArea = projects.reduce((s, p) => s + (p.area_ha || 0), 0);
  const avgLulc = projects.filter(p => p.lulc_pct).length
    ? Math.round(projects.filter(p => p.lulc_pct).reduce((s, p) => s + p.lulc_pct, 0) / projects.filter(p => p.lulc_pct).length)
    : null;
  const avgChm = projects.filter(p => p.chm_avg).length
    ? (projects.filter(p => p.chm_avg).reduce((s, p) => s + p.chm_avg, 0) / projects.filter(p => p.chm_avg).length).toFixed(1)
    : null;
  const totalCredits = projects.reduce((s, p) => s + (p.credits_est || 0), 0);

  const sparkline = [1, 2, 1.5, 3, 2.5, 4, 3.8].map((v) => ({ v }));

  const kpis = [
    { label: 'Total Area Analyzed',  value: totalArea ? `${fmt(totalArea)} ha` : '—', sub: `${projects.length} project${projects.length !== 1 ? 's' : ''}`, trend: projects.length > 0 ? `+${projects.length}` : null, chartData: sparkline, color: '#16a34a' },
    { label: 'Active Projects',      value: projects.filter(p => p.status !== 'draft').length || '—', sub: 'Analyzed or MRV active', color: '#2563eb' },
    { label: 'Avg LULC Eligibility', value: avgLulc ? `${avgLulc}%` : '—', sub: 'Across all analyzed areas', color: '#16a34a', chartData: sparkline },
    { label: 'Avg Canopy Height',    value: avgChm ? `${avgChm}m` : '—', sub: 'CHM model prediction', color: '#059669' },
    { label: 'Total Carbon Est.',    value: totalCredits ? `${fmt(Math.round(totalCredits / 1000))}k` : '—', sub: 'tCO₂/yr projected', color: '#16a34a', chartData: sparkline },
    { label: 'Registry Projects',    value: '—', sub: 'Browse India registry', color: '#7c3aed' },
  ];

  const activity = [
    { type: 'info',    title: 'Welcome to Sylithe Dashboard', sub: 'Start by running a new analysis', time: 'now' },
    { type: 'pending', title: 'Connect your first project',   sub: 'Draw a boundary in the analysis tool', time: '' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F1F1F1] overflow-hidden font-sans">

      {/* Left nav */}
      <SylitheLeftNav activeSection={activeSection} onSectionChange={setActiveSection} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-[260px] min-w-0">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A] text-sm">Dashboard</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <TbMenu2 size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="shrink-0 hidden md:flex h-[64px] px-8 bg-white border-b border-gray-200 items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{greeting}</p>
            <h1 className="text-[18px] font-black text-[#0F172A] tracking-tight leading-tight">{firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200">
              <HiBell size={18} className="text-gray-500" />
              {activity.filter(a => a.type === 'alert').length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
              )}
            </button>
            <button
              onClick={() => navigate('/chm-verification')}
              className="flex items-center gap-2 bg-[#08292F] text-white font-bold px-5 py-2.5 rounded-xl text-[13px] hover:bg-[#0d3d46] transition-colors"
            >
              <HiPlus size={16} /> New Analysis
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* KPI Strip */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpis.map((k) => (
                <KpiCard key={k.label} {...k} />
              ))}
            </div>
          </div>

          {/* Three-column area */}
          <div className="px-8 pb-8 grid grid-cols-1 xl:grid-cols-[1fr_320px_280px] gap-5">

            {/* ── Col 1: Projects list ── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-black text-[#0F172A] uppercase tracking-wider">My Projects</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#08292F] transition-colors font-semibold"
                  >
                    <TbMap2 size={14} /> Browse Registry
                  </button>
                  <button
                    onClick={() => navigate('/chm-verification')}
                    className="flex items-center gap-1.5 text-[12px] text-[#16a34a] hover:text-[#0F172A] transition-colors font-bold"
                  >
                    <HiPlus size={14} /> Add Project
                  </button>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                  <TbLeaf size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold text-[14px]">No projects yet</p>
                  <p className="text-gray-400 text-[12px] mt-1 mb-5">Draw a project boundary in the analysis tool to get started</p>
                  <button
                    onClick={() => navigate('/chm-verification')}
                    className="inline-flex items-center gap-2 bg-[#08292F] text-white font-bold px-5 py-2.5 rounded-xl text-[13px] hover:bg-[#0d3d46] transition-colors"
                  >
                    <TbSatellite size={15} /> Launch Analysis Tool <HiArrowRight />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onSelect={setSelectedProject}
                      selected={selectedProject?.id === p.id}
                    />
                  ))}
                </div>
              )}

              {/* Registry shortcut */}
              <button
                onClick={() => navigate('/projects')}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#08292F]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <TbMap2 size={18} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#0F172A]">Explore India Carbon Registry</p>
                    <p className="text-[11px] text-gray-400">Browse Verra, Gold Standard and more</p>
                  </div>
                </div>
                <HiChevronRight size={18} className="text-gray-300 group-hover:text-[#08292F] transition-colors" />
              </button>
            </div>

            {/* ── Col 2: Detail panel ── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Project Detail</h2>
              </div>
              <DetailPanel
                project={selectedProject}
                onAnalyze={() => navigate('/chm-verification')}
              />
            </div>

            {/* ── Col 3: Activity + Quick Actions ── */}
            <div className="flex flex-col gap-4">

              {/* Activity feed */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Recent Activity</h2>
                </div>
                <div className="px-5 py-2">
                  {activity.map((a, i) => <ActivityItem key={i} {...a} />)}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { icon: <TbSatellite size={15} />, label: 'Run LULC Analysis',  action: () => navigate('/chm-verification') },
                    { icon: <TbChartBar size={15} />,  label: 'Run CHM Analysis',   action: () => navigate('/chm-verification') },
                    { icon: <TbMap2 size={15} />,      label: 'Browse Registry',    action: () => navigate('/projects') },
                    { icon: <TbAlertTriangle size={15}/>,label:'View Alerts',       action: () => {} },
                  ].map(({ icon, label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors text-[13px] font-semibold text-gray-600 group"
                    >
                      <span className="text-[#16a34a]">{icon}</span>
                      {label}
                      <HiArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-[#08292F] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Account card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Account</h2>
                <p className="text-[#0F172A] font-bold text-[14px]">{user.fullName}</p>
                {user.companyName && <p className="text-gray-400 text-[12px]">{user.companyName}</p>}
                {user.designation && <p className="text-gray-400 text-[11px] mt-0.5">{user.designation}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                    Verified
                  </span>
                  {user.primaryActivity && (
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full capitalize">
                      {user.primaryActivity.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Map */}
          {projects.filter(p => p.polygon).length > 0 && (
            <div className="px-8 pb-8">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Portfolio Map</h2>
                  <span className="text-[11px] text-gray-400">{projects.filter(p => p.polygon).length} project{projects.filter(p => p.polygon).length !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-[320px]">
                  <MapContainer center={[22.5, 82.5]} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {projects.filter(p => p.polygon).map(p => (
                      <GeoJSON key={p.id} data={p.polygon} style={{ color: '#16a34a', weight: 2, fillOpacity: 0.15 }}>
                        <MapTooltip>{p.name}</MapTooltip>
                      </GeoJSON>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
