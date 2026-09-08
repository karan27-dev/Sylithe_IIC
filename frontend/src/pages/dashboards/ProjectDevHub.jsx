import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import {
  LayoutDashboard, FolderOpen, GitBranch, Coins, BarChart3,
  FileText, Activity, Plus, ChevronLeft, ChevronRight, Menu,
  LogOut, Trash2, Eye, Edit3, CheckCircle2, Clock, XCircle,
  Upload, Download, Search, Filter, ArrowLeft, X,
  TreePine, Globe, Award, Zap, AlertTriangle, RefreshCw, Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/devProjectsApi';
import { kml as kmlToGeoJSON } from '@tmcw/togeojson';
import shpjs, { parseShp, parseDbf, combine } from 'shpjs';
import parseGeoraster from 'georaster';
import UpgradeModal from '../../components/UpgradeModal';
import treeLogo from '../../assets/treee13.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { UploadCloud } from 'lucide-react';
import { TbMap2, TbSatellite } from 'react-icons/tb';
import { HiChevronRight, HiOutlineInformationCircle } from 'react-icons/hi';
import { GeeAnalyticsPanel, GeeLandCoverPanel } from '../../components/chm/GeeAnalytics';

/* ─── Constants ─────────────────────────────────────────────────── */
const VERIFICATION_STEPS = [
  { key: 'boundary_uploaded', label: 'Boundary Uploaded', pro: false },
  { key: 'lulc_classified', label: 'LULC Classified', pro: true },
  { key: 'chm_run', label: 'CHM Run', pro: true },
  { key: 'baseline_set', label: 'Baseline Set', pro: true },
  { key: 'biomass_estimated', label: 'Biomass Estimated', pro: true },
  { key: 'reports_generated', label: 'Reports Generated', pro: true },
];

const SUPER_EMAILS = ['karan270905@gmail.com', 'chhelurathore773@gmail.com'];

const STATUS_CFG = {
  onboarded: { label: 'Onboarded', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  under_verification: { label: 'Under Verification', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
  verified: { label: 'Verified', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  credits_issued: { label: 'Credits Issued', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const PROJECT_TYPES = ['REDD+', 'ARR', 'IFM', 'Blue Carbon', 'Cookstoves', 'Solar', 'Wind', 'Biogas', 'Other'];
const STANDARDS = ['VCS', 'Gold Standard', 'ACR', 'CAR', 'Plan Vivo', 'Other'];
const METHODOLOGIES = ['VM0015', 'VM0007', 'VM0017', 'VM0010', 'VM0012', 'AR-ACM0003', 'AMS-III.D', 'Other'];
const DOC_TYPES = ['MRV Report', 'Boundary Map', 'Field Survey', 'Baseline Study', 'Validation Report', 'Other'];
const PIE_COLORS = ['#16a34a', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

/* ─── Shared helpers ─────────────────────────────────────────────── */
const fmt = (n) => n != null ? Number(n).toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '—';
const fmtD = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const stepsComplete = (p) => {
  const s = p?.verification_steps || {};
  return Object.values(s).filter(Boolean).length;
};

/* ─── Geodesic area helper (matches DeveloperDashboard) ────────── */
const toRad = (d) => (d * Math.PI) / 180;
function ringArea(coords) {
  const R = 6378137; let total = 0; const len = coords.length;
  if (len <= 2) return 0;
  for (let i = 0; i < len; i++) {
    const [lng1] = coords[i]; const [, lat2] = coords[(i + 1) % len]; const [lng3] = coords[(i + 2) % len];
    total += (toRad(lng3) - toRad(lng1)) * Math.sin(toRad(lat2));
  }
  return Math.abs((total * R * R) / 2);
}
function computeGeojsonAreaHa(geojson) {
  if (!geojson) return 0;
  let total = 0;
  const proc = (geom) => {
    if (!geom) return;
    if (geom.type === 'Polygon') { total += ringArea(geom.coordinates[0]); for (let i = 1; i < geom.coordinates.length; i++) total -= ringArea(geom.coordinates[i]); }
    else if (geom.type === 'MultiPolygon') { geom.coordinates.forEach((p) => { total += ringArea(p[0]); for (let i = 1; i < p.length; i++) total -= ringArea(p[i]); }); }
  };
  if (geojson.type === 'FeatureCollection') (geojson.features || []).forEach((f) => proc(f.geometry));
  else if (geojson.type === 'Feature') proc(geojson.geometry);
  else proc(geojson);
  return (total / 10000);
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.onboarded;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function KpiCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-[26px] font-bold text-[#08292F] leading-none tracking-tight">{value ?? '—'}</p>
        <p className="text-[12px] font-semibold text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
        <Icon size={28} className="text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-gray-600">{title}</p>
        <p className="text-[13px] text-gray-400 mt-1">{sub}</p>
      </div>
      {action && (
        <button onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#08292F] hover:bg-[#062125] text-white font-bold rounded-full text-[13px] transition-colors">
          <Plus size={14} /> {action}
        </button>
      )}
    </div>
  );
}

/* ─── Map fit helper ─────────────────────────────────────────────── */
function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    try {
      const L = window.L || require('leaflet');
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    } catch { }
  }, [geojson, map]);
  return null;
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: OVERVIEW
════════════════════════════════════════════════════════════════════ */
function OverviewSection({ projects, stats, activity, onNav, onViewProject, onEditProject, loading }) {
  if (loading) return <Loader />;

  const projectCount = stats?.total_projects ?? projects.length;
  const totalArea = stats?.total_area_ha ?? projects.reduce((sum, p) => sum + (Number(p.area_ha) || 0), 0);
  const totalCarbon = stats?.total_carbon ?? projects.reduce((sum, p) => sum + (Number(p.estimated_carbon) || 0), 0);
  const verifiedCount = stats?.verified_count ?? projects.filter((p) => p.status === 'verified' || p.status === 'credits_issued').length;
  const inVerification = projects.filter((p) => p.status === 'under_verification').length;
  const issuedCredits = projects.reduce((sum, p) => sum + (Number(p.carbon_credits?.issued) || 0), 0);
  const latestProjects = projects.slice(0, 5);
  const avgYield = totalArea > 0 ? totalCarbon / totalArea : 0;
  const verificationRate = projectCount > 0 ? Math.round((verifiedCount / projectCount) * 100) : 0;

  const metricTiles = [
    {
      label: 'Total Area',
      value: fmt(totalArea),
      unit: 'ha',
      dot: 'bg-gray-300',
      title: projectCount > 0 ? 'Active portfolio' : 'No active portfolio',
      sub: `${projectCount} project${projectCount === 1 ? '' : 's'} registered`,
    },
    {
      label: 'Est. Carbon',
      value: fmt(totalCarbon),
      unit: 't',
      dot: 'bg-[#D94D9B]',
      title: avgYield ? `+${avgYield.toFixed(1)} tCO₂e / ha` : 'Yield pending',
      sub: 'Estimated average yield',
    },
    {
      label: 'Verified',
      value: verifiedCount,
      unit: '',
      dot: 'bg-[#E7B83F]',
      title: `${verificationRate}% complete`,
      sub: 'Verification coverage',
    },
    {
      label: 'Under Review',
      value: inVerification,
      unit: '',
      dot: 'bg-[#4EA7DF]',
      title: 'Verification pipeline',
      sub: 'Projects in progress',
    },
    {
      label: 'Issued Credits',
      value: fmt(issuedCredits),
      unit: 't',
      dot: 'bg-emerald-500',
      title: issuedCredits > 0 ? 'Credits available' : 'Not issued yet',
      sub: 'Registry issuance status',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-7">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <a href="/dashboard/developer?section=tree_inventory" className="text-gray-500 hover:text-[#08292F] font-bold mb-4 flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Plot Inventory
          </a>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Project Hub</p>
          <h2 className="mt-1 text-[26px] md:text-[30px] font-black text-[#08292F] tracking-tight">Portfolio Overview</h2>
          <p className="text-[13px] text-gray-500 mt-1">A command view of land area, carbon estimates, verification progress, and recent movement.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onNav('my-projects')}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-[12px] font-black text-[#0F172A] shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <FolderOpen size={14} /> View Projects
          </button>
          <button onClick={() => onNav('add-project')}
            className="inline-flex items-center gap-2 rounded-md bg-[#08292F] px-4 py-2.5 text-[12px] font-black text-white shadow-sm hover:bg-[#062125] transition-colors">
            <Plus size={14} /> Add Project
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-b-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-2 xl:grid-cols-5">
          {metricTiles.map((m, idx) => {
            const borderClasses = [
              idx % 2 === 1 ? 'border-l' : '',
              idx >= 2 ? 'border-t' : '',
              idx > 0 ? 'xl:border-l' : '',
              idx < 2 ? 'xl:border-t-0' : '',
              idx === 4 ? 'col-span-2 xl:col-span-1' : '',
            ].join(' ');
            return (
              <div key={m.label} className={`p-4 md:p-6 border-gray-100 ${borderClasses}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${m.dot}`} />
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 truncate">{m.label}</p>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[28px] md:text-[38px] font-black leading-none tracking-tight text-[#0F172A]">{m.value}</span>
                  {m.unit && <span className="text-[15px] md:text-[18px] font-black text-gray-400">{m.unit}</span>}
                </div>
                <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
                  <p className="text-[11px] md:text-[13px] font-black text-[#20373D] leading-snug">{m.title}</p>
                  <p className="mt-0.5 text-[10px] md:text-[12px] font-medium text-gray-400 leading-snug">{m.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-y-4 border-t border-gray-100 px-4 py-4 md:px-6 md:py-5 md:grid-cols-4">
          {[
            ['Portfolio Status', projectCount > 0 ? 'Active' : 'Awaiting Projects'],
            ['Avg. Yield', avgYield ? `${avgYield.toFixed(1)} tCO₂e / ha` : 'Not available'],
            ['Created Projects', `${projectCount}`],
            ['Next Action', inVerification > 0 ? 'Review pipeline' : 'Add verification data'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</p>
              <p className="mt-1 text-[12px] md:text-[14px] font-black text-[#0F172A]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[15px] font-black text-[#0F172A]">Recent Projects</h3>
              <p className="mt-0.5 text-[12px] text-gray-400">Latest registered project records and verification state</p>
            </div>
            {projects.length > 5 && (
              <button onClick={() => onNav('my-projects')} className="text-left text-[12px] font-black text-[#08292F] hover:underline">
                View all {projects.length}
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No projects yet" sub="Register your first carbon project to get started"
              action="Add New Project" onAction={() => onNav('add-project')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-[#FAFBFC] text-left">
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Project</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Type</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Area</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Carbon</th>
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Status</th>
                    <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {latestProjects.map((p) => (
                    <tr key={p._id} className="hover:bg-[#FAFBFC]">
                      <td className="px-5 py-4">
                        <p className="max-w-[280px] truncate text-[13px] font-black text-[#0F172A]">{p.name}</p>
                        <p className="mt-1 text-[12px] font-medium text-gray-400">{p.state || p.country || 'Location TBD'}</p>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-black text-[#0F172A]">{p.type || 'Not Set'}</td>
                      <td className="px-5 py-4 text-[13px] font-black text-[#0F172A]">{fmt(p.area_ha)} ha</td>
                      <td className="px-5 py-4 text-[13px] font-black text-[#0F172A]">{fmt(p.estimated_carbon)} t</td>
                      <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => onViewProject(p)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-2 text-[12px] font-black text-gray-600 hover:bg-[#EAF4F0] hover:text-[#08292F] transition-colors">
                            <Eye size={13} /> Open
                          </button>
                          <button onClick={() => onEditProject(p)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-2 text-[12px] font-black text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-[15px] font-black text-[#0F172A]">Recent Activity</h3>
            <p className="mt-0.5 text-[12px] text-gray-400">Operational updates across the hub</p>
          </div>
          <div className="divide-y divide-gray-100">
            {activity.length === 0 ? (
              <p className="p-6 text-center text-[12px] italic text-gray-400">No activity yet</p>
            ) : activity.slice(0, 10).map((a, i) => (
              <div key={a._id || i} className="flex items-start gap-3 px-5 py-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF4F0]">
                  <Activity size={13} className="text-[#08292F]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-black text-[#0F172A]">{a.action}</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-gray-400">{a.project_name}</p>
                </div>
                <p className="shrink-0 text-[10px] font-bold text-gray-300">{timeAgo(a.timestamp)}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Project Card (used in overview + my-projects) ─────────────── */
function ProjectCard({ project: p, onView }) {
  const done = stepsComplete(p);
  const total = VERIFICATION_STEPS.length;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-black text-[#0F172A] truncate">{p.name}</h4>
          <p className="text-[12px] text-gray-400 mt-0.5">{p.type} · {p.country}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>
      <div className="flex items-center gap-4 mb-3 text-[12px] text-gray-500">
        <span><span className="font-bold text-[#0F172A]">{fmt(p.area_ha)}</span> ha</span>
        <span><span className="font-bold text-[#0F172A]">{fmt(p.estimated_carbon)}</span> tCO₂e</span>
        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[11px] font-bold">{p.crediting_standard}</span>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 font-semibold">Verification</span>
          <span className="text-[10px] text-gray-500 font-bold">{done}/{total} steps</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
      <button onClick={onView}
        className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 font-bold rounded-full text-[12px] transition-colors">
        <Eye size={13} /> View Project
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   EDIT PROJECT MODAL
════════════════════════════════════════════════════════════════════ */
function EditProjectModal({ project, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project.name || '',
    type: project.type || '',
    country: project.country || '',
    state: project.state || '',
    crediting_standard: project.crediting_standard || '',
    methodology: project.methodology || '',
    start_date: project.start_date ? project.start_date.slice(0, 10) : '',
    end_date: project.end_date ? project.end_date.slice(0, 10) : '',
    area_ha: project.area_ha || '',
    description: project.description || '',
    land_tenure: project.land_tenure || '',
    community_benefit: project.community_benefit ? 'Yes' : 'No',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (name, value) => setForm(f => ({ ...f, [name]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setSaving(true);
    setError('');
    const payload = {
      name: form.name,
      type: form.type,
      country: form.country,
      state: form.state,
      crediting_standard: form.crediting_standard,
      methodology: form.methodology,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      area_ha: form.area_ha ? Number(form.area_ha) : undefined,
      description: form.description,
      land_tenure: form.land_tenure,
      community_benefit: form.community_benefit === 'Yes',
    };
    const res = await api.updateProject(token, project._id, payload);
    setSaving(false);
    if (res.status === 'success' || res.project) {
      onSaved(res.project || { ...project, ...payload });
    } else {
      setError(res.message || 'Failed to save changes.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[17px] font-black text-[#0F172A]">Edit Project</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{project.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 flex-1">
          {/* Row: Name + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Project Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Project name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Project Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {['REDD+','ARR','IFM','Blue Carbon','Agroforestry','Mangrove Restoration','Cookstoves','Solar','Wind','Biogas','Other'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row: Country + State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Country</Label>
              <Input name="country" value={form.country} onChange={handleChange} placeholder="India" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">State / Region</Label>
              <Input name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
            </div>
          </div>

          {/* Row: Standard + Methodology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Crediting Standard</Label>
              <Select value={form.crediting_standard} onValueChange={v => set('crediting_standard', v)}>
                <SelectTrigger><SelectValue placeholder="Select standard" /></SelectTrigger>
                <SelectContent>
                  {['Verra VCS','Gold Standard','Plan Vivo','ICVCM','CDM','ACR','CAR','Other'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Methodology</Label>
              <Input name="methodology" value={form.methodology} onChange={handleChange} placeholder="VM0007, AR-ACM0003" />
            </div>
          </div>

          {/* Row: Area + Community Benefit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Area (ha)</Label>
              <Input name="area_ha" type="number" value={form.area_ha} onChange={handleChange} placeholder="5000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Community Benefit</Label>
              <Select value={form.community_benefit} onValueChange={v => set('community_benefit', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row: Start + End dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">Start Date</Label>
              <Input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-gray-600">End Date</Label>
              <Input name="end_date" type="date" value={form.end_date} onChange={handleChange} />
            </div>
          </div>

          {/* Land Tenure */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-bold text-gray-600">Land Tenure</Label>
            <Input name="land_tenure" value={form.land_tenure} onChange={handleChange} placeholder="Government lease, private, community..." />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-bold text-gray-600">Description</Label>
            <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief project description..." rows={3} className="resize-none" />
          </div>

          {error && <p className="text-[13px] text-red-500 font-semibold">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-gray-200 text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 rounded-full bg-[#08292F] hover:bg-[#062125] text-white text-[13px] font-bold transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: MY PROJECTS (table)
════════════════════════════════════════════════════════════════════ */
function MyProjectsSection({ projects, onView, onAdd, onDelete, onEdit, loading }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const statuses = ['all', 'onboarded', 'under_verification', 'verified', 'credits_issued'];

  const filtered = projects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || p.status === filter;
    return matchSearch && matchStatus;
  });

  if (loading) return <Loader />;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#08292F] tracking-tight">My Projects</h2>
          <p className="text-[13px] text-gray-400">{projects.length} projects registered</p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#08292F] hover:bg-[#062125] text-white font-bold rounded-full text-[13px] transition-colors">
          <Plus size={14} /> Add New Project
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-[13px] outline-none focus:border-[#0fa958] focus:ring-2 focus:ring-emerald-100 transition-all bg-white" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-colors capitalize ${filter === s ? 'bg-[#08292F] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {s === 'all' ? 'All' : STATUS_CFG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No projects found" sub="Try adjusting your search or filters"
          action="Add New Project" onAction={onAdd} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Project', 'Location', 'Standard', 'Area', 'Carbon', 'Status', 'Verification', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const done = stepsComplete(p);
                return (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.type}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-gray-500">{p.country}{p.state ? `, ${p.state}` : ''}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold">{p.crediting_standard || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-[#0F172A]">{fmt(p.area_ha)} ha</td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-[#0F172A]">{fmt(p.estimated_carbon)} t</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(done / VERIFICATION_STEPS.length) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-400">{done}/{VERIFICATION_STEPS.length}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onView(p)} className="p-1.5 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors" title="View"><Eye size={14} /></button>
                        <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Edit3 size={14} /></button>
                        <button onClick={() => onDelete(p._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: PROJECT DETAIL (tabs)
════════════════════════════════════════════════════════════════════ */
function ProjectDetailSection({ project: p, token, onBack, onRefresh, isPro, onUpgrade }) {
  const [tab, setTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const tabs = ['overview', 'verification', 'reports', 'documents'];

  const markStep = async (stepKey, val) => {
    setSaving(true);
    await api.updateProject(token, p._id, {
      verification_steps: { [stepKey]: val },
    });
    setSaving(false);
    onRefresh(p._id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 font-semibold transition-colors w-fit">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-black text-[#0F172A] leading-tight break-words">{p.name}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{p.type} · {p.country}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-[13px] font-bold capitalize transition-colors relative shrink-0 ${tab === t ? 'text-[#0F172A]' : 'text-gray-400 hover:text-gray-600'}`}>
            {t === 'overview' ? 'Overview' : t === 'verification' ? 'Verification' : t === 'reports' ? 'Reports' : 'Documents'}
            {tab === t && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#16a34a] rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <ProjectOverviewTab project={p} />}
      {tab === 'verification' && <VerificationTab project={p} onMarkStep={markStep} saving={saving} isPro={isPro} onUpgrade={onUpgrade} />}
      {tab === 'reports' && <ReportsTab project={p} />}
      {tab === 'documents' && <DocumentsTab project={p} token={token} onRefresh={() => onRefresh(p._id)} />}
    </div>
  );
}

function ProjectOverviewTab({ project: p }) {
  const [mapStyle, setMapStyle] = useState('satellite');
  const [selectedFY, setSelectedFY] = useState('2026');
  const [hasRunAnalytics, setHasRunAnalytics] = useState(false);
  const [activeAoiIndex, setActiveAoiIndex] = useState('all');
  const [geeTileLayer, setGeeTileLayer] = useState({ url: null, type: null });

  const geojsonData = p.geojson || null;

  const displayedGeojson = React.useMemo(() => {
    if (!geojsonData || activeAoiIndex === 'all') return geojsonData;
    if (geojsonData.type === 'FeatureCollection' && geojsonData.features) {
      return { ...geojsonData, features: [geojsonData.features[activeAoiIndex]] };
    }
    return geojsonData;
  }, [geojsonData, activeAoiIndex]);

  const handleGeeMapReady = (tileUrl, tileType) => {
    setGeeTileLayer({ url: tileUrl, type: tileType });
  };

  const computedArea = React.useMemo(() => (geojsonData ? computeGeojsonAreaHa(geojsonData) : 0), [geojsonData]);
  const displayArea = p.area_ha > 0 ? p.area_ha : computedArea;
  const displayCarbon = p.estimated_carbon > 0 ? p.estimated_carbon : displayArea * 4.5;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Project Information Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#0F172A]">Project Information</h2>
          <StatusBadge status={p.status} />
        </div>

        {/* Top KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-gray-100">
          {/* Total Area */}
          <div className="p-5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Area</span>
            <div className="text-[26px] font-bold text-[#0F172A] leading-none mt-1">
              {fmt(displayArea)} <span className="text-[16px] text-gray-400 font-semibold">ha</span>
            </div>
            <div className="mt-3 pt-3 border-t border-dotted border-gray-200">
              <span className="text-[11px] font-bold text-[#08292F]">Verified Boundary</span>
              <p className="text-[11px] text-gray-400 mt-0.5">{p.country ? `${p.country}${p.state ? `, ${p.state}` : ''}` : 'Location TBD'}</p>
            </div>
          </div>

          {/* Est. Carbon */}
          <div className="p-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ec4899] shrink-0" />
              <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-widest">Est. Carbon</span>
            </div>
            <div className="text-[26px] font-bold text-[#0F172A] leading-none mt-1">
              {fmt(displayCarbon)} <span className="text-[16px] text-gray-400 font-semibold">t</span>
            </div>
            <div className="mt-3 pt-3 border-t border-dotted border-gray-200">
              <span className="text-[11px] font-bold text-[#08292F]">▲ +4.5 tCO₂e / ha</span>
              <p className="text-[11px] text-gray-400 mt-0.5">Estimated average yield</p>
            </div>
          </div>

          {/* Standard */}
          <div className="p-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#eab308] shrink-0" />
              <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-widest">Standard</span>
            </div>
            <div className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{p.crediting_standard || 'Not Set'}</div>
            <div className="mt-3 pt-3 border-t border-dotted border-gray-200">
              <span className="text-[11px] font-bold text-[#08292F]">CCP Eligible</span>
              <p className="text-[11px] text-gray-400 mt-0.5">Under Review</p>
            </div>
          </div>

          {/* Project Type */}
          <div className="p-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9] shrink-0" />
              <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-widest">Project Type</span>
            </div>
            <div className="text-[22px] font-bold text-[#0F172A] leading-tight mt-1">{p.type || 'Not Set'}</div>
            <div className="mt-3 pt-3 border-t border-dotted border-gray-200">
              <span className="text-[11px] font-bold text-[#08292F]">{p.methodology || 'Methodology TBD'}</span>
              <p className="text-[11px] text-gray-400 mt-0.5">Methodology</p>
            </div>
          </div>

          {/* Crediting Period */}
          <div className="p-5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Crediting Period</span>
            {p.start_date || p.end_date ? (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[20px] font-bold text-[#0F172A] leading-none">
                  {p.start_date ? new Date(p.start_date).getFullYear() : '?'}
                </span>
                <span className="text-[13px] text-gray-400 font-semibold">
                  → {p.end_date ? new Date(p.end_date).getFullYear() : '?'}
                </span>
              </div>
            ) : (
              <div className="text-[14px] font-semibold text-gray-400 mt-1 italic">Not configured</div>
            )}
            <div className="mt-3 pt-3 border-t border-dotted border-gray-200">
              <span className="text-[11px] font-bold text-[#08292F]">Land Tenure</span>
              <p className="text-[11px] text-gray-400 mt-0.5">{p.land_tenure || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Bottom metadata strip */}
        <div className="border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-gray-100 bg-gray-50/40">
          {[
            { label: 'Community Benefit', value: p.community_benefit != null ? (p.community_benefit ? 'Yes' : 'No') : '—' },
            { label: 'Created', value: fmtD(p.created_at) },
            { label: 'State / Region', value: p.state || '—' },
            { label: 'Status', value: STATUS_CFG[p.status]?.label || 'Onboarded' },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
              <p className="text-[12px] font-semibold text-[#0F172A] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {p.description && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-[14px] font-bold text-[#0F172A]">Project Description</h3></div>
          <div className="px-6 py-4"><p className="text-[13px] text-gray-600 leading-relaxed">{p.description}</p></div>
        </div>
      )}

      {/* ── Satellite Map ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 420 }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          {mapStyle === 'street' ? (
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
          ) : (
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution="&copy; Google" />
          )}
          {geojsonData && <GeoJSON key={JSON.stringify(displayedGeojson)} data={displayedGeojson} style={{ color: '#10b981', weight: 2, fillOpacity: 0.2 }} />}
          {geojsonData && <FitBounds geojson={displayedGeojson} />}
          {geeTileLayer.url && <TileLayer url={geeTileLayer.url} attribution="GEE" zIndex={10} />}

          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-gray-100 flex items-center">
            <button onClick={() => setMapStyle('street')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${mapStyle === 'street' ? 'bg-[#08292F] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
              <TbMap2 size={16} /> Street
            </button>
            <button onClick={() => setMapStyle('satellite')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${mapStyle === 'satellite' ? 'bg-[#08292F] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
              <TbSatellite size={16} /> Satellite
            </button>
          </div>
        </MapContainer>
      </div>

      {/* ── Satellite Analytics (GEE) ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden pb-6">
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-[#0F172A]">Satellite Analytics (GEE)</h3>
            <span className="text-[11px] font-bold text-[#08292F] bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">FY {selectedFY}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {geojsonData?.type === 'FeatureCollection' && geojsonData.features.length > 1 && (
              <select
                value={activeAoiIndex}
                onChange={(e) => { setActiveAoiIndex(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setHasRunAnalytics(false); }}
                className="flex-1 min-w-0 border border-gray-300 rounded-[4px] px-2 py-1.5 text-[13px] font-bold text-[#0F172A] bg-white cursor-pointer hover:bg-gray-50 outline-none focus:border-[#16a34a] shadow-sm uppercase tracking-wider"
              >
                <option value="all">ALL AOIS ({geojsonData.features.length})</option>
                {geojsonData.features.map((f, i) => (
                  <option key={i} value={i}>AOI {i + 1} {f.properties?.name ? `(${f.properties.name})` : ''}</option>
                ))}
              </select>
            )}
            <button onClick={() => setHasRunAnalytics(true)} className="shrink-0 px-4 py-1.5 bg-[#08292F] text-white font-bold rounded-lg shadow-sm text-[12px] uppercase tracking-wider hover:bg-[#062125] transition-colors whitespace-nowrap">
              Run Analytics
            </button>
          </div>
        </div>
        <div className="px-6">
          {hasRunAnalytics ? (
            <GeeAnalyticsPanel selectedFY={selectedFY} projectGeojson={displayedGeojson} />
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
              Select an AOI and click "Run Analytics" to fetch satellite data.
            </div>
          )}
        </div>
      </div>

      {/* ── Land Cover Classification ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-[14px] font-bold text-[#0F172A]">Land Cover Classification</h3></div>
        <div className="p-6">
          {hasRunAnalytics ? (
            <GeeLandCoverPanel selectedFY={selectedFY} projectGeojson={displayedGeojson} onMapReady={handleGeeMapReady} />
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
              Select an AOI and click "Run Analytics" above to fetch LULC data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationTab({ project: p, onMarkStep, saving, isPro, onUpgrade }) {
  const steps = p.verification_steps || {};
  const done = stepsComplete(p);
  return (
    <div className="space-y-6">
      {/* Upgrade banner for free users */}
      {!isPro && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[13px] font-black text-amber-800">5 of 6 steps require Pro</p>
              <p className="text-[11px] text-amber-600 mt-0.5">Unlock LULC, CHM, Baseline, Biomass & Reports verification</p>
            </div>
          </div>
          <button onClick={onUpgrade}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full text-[12px] transition-colors shrink-0">
            <Zap size={13} /> Upgrade to Pro
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-black text-[#0F172A]">Verification Progress</p>
          <span className="text-[13px] font-bold text-emerald-600">{done}/{VERIFICATION_STEPS.length} complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(done / VERIFICATION_STEPS.length) * 100}%` }} />
        </div>
        {/* Step grid */}
        <div className="grid grid-cols-3 gap-3">
          {VERIFICATION_STEPS.map((step, i) => {
            const isDone = steps[step.key];
            const locked = step.pro && !isPro;
            return (
              <div key={step.key} className={`rounded-xl border p-4 transition-all relative ${locked ? 'bg-gray-50 border-gray-200 opacity-75' :
                isDone ? 'bg-emerald-50 border-emerald-200' :
                  'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400">Step {i + 1}</span>
                  {locked
                    ? <Lock size={14} className="text-amber-400" />
                    : isDone
                      ? <CheckCircle2 size={16} className="text-emerald-500" />
                      : <Clock size={16} className="text-gray-300" />}
                </div>
                <p className={`text-[12px] font-bold mb-3 ${locked ? 'text-gray-400' : isDone ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {step.label}
                </p>
                {locked ? (
                  <button onClick={onUpgrade}
                    className="w-full py-1.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center justify-center gap-1">
                    <Lock size={10} /> Upgrade to unlock
                  </button>
                ) : (
                  <button
                    onClick={() => onMarkStep(step.key, !isDone)}
                    disabled={saving}
                    className={`w-full py-1.5 rounded-full text-[11px] font-bold transition-colors ${isDone
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-[#08292F] text-white hover:bg-[#062125]'}`}>
                    {isDone ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReportsTab({ project: p }) {
  const [fy, setFy] = useState('2026');
  const tabs = ['Summary', 'Growth', 'Baseline', 'Leakage', 'Risk'];
  const [activeTab, setActiveTab] = useState('Summary');
  const chartData = [
    { month: 'Apr', carbon: p.estimated_carbon * 0.07 },
    { month: 'May', carbon: p.estimated_carbon * 0.08 },
    { month: 'Jun', carbon: p.estimated_carbon * 0.09 },
    { month: 'Jul', carbon: p.estimated_carbon * 0.10 },
    { month: 'Aug', carbon: p.estimated_carbon * 0.09 },
    { month: 'Sep', carbon: p.estimated_carbon * 0.08 },
    { month: 'Oct', carbon: p.estimated_carbon * 0.07 },
    { month: 'Nov', carbon: p.estimated_carbon * 0.06 },
    { month: 'Dec', carbon: p.estimated_carbon * 0.08 },
  ].map(d => ({ ...d, carbon: Math.round(d.carbon) }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <h3 className="text-[16px] font-black text-[#0F172A]">MRV Report — FY {fy}</h3>
        <select value={fy} onChange={e => setFy(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-bold outline-none">
          {['2026', '2025', '2024'].map(y => <option key={y}>{y}</option>)}
        </select>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md">In Progress</span>
      </div>
      <div className="flex items-center gap-6 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`pb-3 text-[13px] font-bold transition-colors relative ${activeTab === t ? 'text-[#0F172A]' : 'text-gray-400'}`}>
            {t}
            {activeTab === t && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#16a34a] rounded-t-full" />}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Gross Emissions Reduction', value: `${fmt(p.estimated_carbon * 0.85)} tCO₂e` },
            { label: 'Leakage Deduction', value: `${fmt(p.estimated_carbon * 0.05)} tCO₂e` },
            { label: 'Buffer Pool', value: `${fmt(p.estimated_carbon * 0.10)} tCO₂e` },
            { label: 'Net Credits', value: `${fmt(p.estimated_carbon * 0.80)} tCO₂e` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[20px] font-black text-[#0F172A]">{value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="carbon" stroke="#16a34a" strokeWidth={2} fill="url(#cg)" name="Carbon (tCO₂e)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DocumentsTab({ project: p, token, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await api.addDocument(token, p._id, {
      name: file.name,
      file_type: docType,
      size_kb: Math.round(file.size / 1024),
    });
    setUploading(false);
    onRefresh();
    e.target.value = '';
  };

  const handleDelete = async (docId) => {
    await api.deleteDocument(token, p._id, docId);
    onRefresh();
  };

  const docs = p.documents || [];
  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
        <Upload size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-[13px] font-semibold text-gray-500 mb-3">Upload project documents</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <select value={docType} onChange={e => setDocType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-[12px] outline-none bg-gray-50">
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="px-5 py-2 bg-[#08292F] text-white rounded-full text-[12px] font-bold hover:bg-[#062125] transition-colors disabled:opacity-50">
            {uploading ? 'Uploading…' : 'Choose File'}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </div>
        <p className="text-[11px] text-gray-300 mt-2">PDF, Excel, KML, GeoJSON, ZIP supported</p>
      </div>

      {/* Documents table */}
      {docs.length === 0 ? (
        <p className="text-center text-[13px] text-gray-400 italic py-8">No documents uploaded yet</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Document', 'Type', 'Size', 'Uploaded', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map(d => (
                <tr key={d.doc_id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 text-[13px] font-semibold text-[#0F172A]">{d.name}</td>
                  <td className="px-5 py-4"><span className="px-2 py-1 bg-gray-100 rounded-lg text-[11px] font-bold text-gray-600">{d.file_type}</span></td>
                  <td className="px-5 py-4 text-[12px] text-gray-400">{d.size_kb ? `${d.size_kb} KB` : '—'}</td>
                  <td className="px-5 py-4 text-[12px] text-gray-400">{fmtD(d.uploaded_at)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDelete(d.doc_id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: VERIFICATION PIPELINE (matrix)
════════════════════════════════════════════════════════════════════ */
function VerificationPipelineSection({ projects, onViewProject, loading, isPro, onUpgrade }) {
  if (loading) return <Loader />;
  const allDone = projects.filter(p => stepsComplete(p) === VERIFICATION_STEPS.length).length;
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#08292F] tracking-tight">Verification Pipeline</h2>
          <p className="text-[13px] text-gray-400">{allDone} of {projects.length} projects fully verified</p>
        </div>
        {!isPro && (
          <button onClick={onUpgrade}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[12px] font-bold hover:bg-amber-100 transition-colors">
            <Lock size={13} /> Upgrade to unlock all steps
          </button>
        )}
      </div>
      {projects.length === 0 ? (
        <EmptyState icon={GitBranch} title="No projects yet" sub="Add a project to track verification progress" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider w-[200px]">Project</th>
                {VERIFICATION_STEPS.map(s => (
                  <th key={s.key} className="px-4 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {s.pro && !isPro && <Lock size={10} className="text-amber-400" />}
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{s.label}</span>
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.map(p => {
                const steps = p.verification_steps || {};
                const done = stepsComplete(p);
                return (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <button onClick={() => onViewProject(p)} className="text-left">
                        <p className="text-[13px] font-bold text-[#0F172A] hover:text-emerald-700 transition-colors">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.type}</p>
                      </button>
                    </td>
                    {VERIFICATION_STEPS.map(s => {
                      const locked = s.pro && !isPro;
                      return (
                        <td key={s.key} className="px-4 py-4 text-center">
                          {locked ? (
                            <button onClick={onUpgrade} title="Upgrade to Pro">
                              <Lock size={16} className="text-amber-400 mx-auto hover:text-amber-600 transition-colors" />
                            </button>
                          ) : steps[s.key] ? (
                            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
                          ) : (
                            <Clock size={18} className="text-gray-200 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(done / VERIFICATION_STEPS.length) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-400 font-semibold">{done}/{VERIFICATION_STEPS.length}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: CARBON CREDITS
════════════════════════════════════════════════════════════════════ */
function CarbonCreditsSection({ projects, loading }) {
  if (loading) return <Loader />;
  const totals = projects.reduce((acc, p) => {
    const c = p.carbon_credits || {};
    acc.issued += c.issued || 0;
    acc.pending += c.pending || 0;
    acc.retired += c.retired || 0;
    return acc;
  }, { issued: 0, pending: 0, retired: 0 });

  const barData = projects.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    Issued: (p.carbon_credits?.issued || 0),
    Pending: (p.carbon_credits?.pending || 0),
  }));

  const projData = [2025, 2026, 2027, 2028, 2029, 2030].map((yr, i) => ({
    year: yr,
    credits: Math.round(totals.pending * (0.15 + i * 0.06)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-bold text-[#08292F] tracking-tight">Carbon Credits</h2>
        <p className="text-[13px] text-gray-400">Portfolio credit status across all projects</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Issued', value: fmt(totals.issued), numCls: 'text-emerald-600', dotCls: 'bg-emerald-500' },
          { label: 'Total Pending', value: fmt(totals.pending), numCls: 'text-blue-600', dotCls: 'bg-blue-500' },
          { label: 'Total Retired', value: fmt(totals.retired), numCls: 'text-gray-600', dotCls: 'bg-gray-400' },
        ].map(({ label, value, numCls, dotCls }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${dotCls} mb-3`} />
            <p className={`text-[28px] font-bold tracking-tight leading-none ${numCls}`}>{value}</p>
            <p className="text-[12px] text-gray-500 mt-1.5 font-semibold">{label} <span className="text-gray-400 font-normal">(tCO₂e)</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[14px] font-black text-[#0F172A] mb-4">Credits by Project</p>
          {barData.length === 0 ? <p className="text-center text-gray-400 text-[13px]">No data</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="Issued" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[14px] font-black text-[#0F172A] mb-4">Projected Issuances</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={projData}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="credits" stroke="#16a34a" strokeWidth={2} fill="url(#pg)" name="Credits (tCO₂e)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Project', 'Standard', 'Issued', 'Pending', 'Retired'].map(h => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => (
              <tr key={p._id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4 text-[13px] font-bold text-[#0F172A]">{p.name}</td>
                <td className="px-5 py-4"><span className="px-2 py-1 bg-gray-100 rounded-lg text-[11px] font-bold">{p.crediting_standard || '—'}</span></td>
                <td className="px-5 py-4 text-[13px] font-semibold text-emerald-600">{fmt(p.carbon_credits?.issued)} tCO₂e</td>
                <td className="px-5 py-4 text-[13px] font-semibold text-blue-600">{fmt(p.carbon_credits?.pending)} tCO₂e</td>
                <td className="px-5 py-4 text-[13px] font-semibold text-gray-500">{fmt(p.carbon_credits?.retired)} tCO₂e</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: ANALYTICS
════════════════════════════════════════════════════════════════════ */
function AnalyticsSection({ projects, loading }) {
  if (loading) return <Loader />;
  const effData = projects
    .filter(p => p.area_ha > 0)
    .map(p => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      value: +(p.estimated_carbon / p.area_ha).toFixed(2),
    }))
    .sort((a, b) => b.value - a.value);

  const typeData = Object.entries(
    projects.reduce((acc, p) => { acc[p.type || 'Other'] = (acc[p.type || 'Other'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-bold text-[#08292F] tracking-tight">Portfolio Analytics</h2>
        <p className="text-[13px] text-gray-400">Performance and composition insights</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[14px] font-black text-[#0F172A] mb-1">Carbon Efficiency</p>
          <p className="text-[11px] text-gray-400 mb-4">tCO₂e per hectare by project</p>
          {effData.length === 0 ? <p className="text-center text-gray-400 text-[13px]">No data</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={effData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} name="tCO₂e/ha" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[14px] font-black text-[#0F172A] mb-1">Project Type Mix</p>
          <p className="text-[11px] text-gray-400 mb-4">Distribution by project type</p>
          {typeData.length === 0 ? <p className="text-center text-gray-400 text-[13px]">No data</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name">
                  {typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stats table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-[14px] font-black text-[#0F172A] mb-4">Project Performance Summary</p>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {['Project', 'Type', 'Area (ha)', 'Est. Carbon', 'Efficiency (t/ha)', 'Verification'].map(h => (
                <th key={h} className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-wider pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => (
              <tr key={p._id}>
                <td className="py-3 pr-6 text-[13px] font-bold text-[#0F172A]">{p.name}</td>
                <td className="py-3 pr-6 text-[12px] text-gray-500">{p.type || '—'}</td>
                <td className="py-3 pr-6 text-[13px] font-semibold">{fmt(p.area_ha)}</td>
                <td className="py-3 pr-6 text-[13px] font-semibold text-emerald-600">{fmt(p.estimated_carbon)} t</td>
                <td className="py-3 pr-6 text-[13px] font-semibold">{p.area_ha > 0 ? ((p.estimated_carbon || 0) / p.area_ha).toFixed(2) : '—'}</td>
                <td className="py-3 pr-6 text-[12px] text-gray-500">{stepsComplete(p)}/{VERIFICATION_STEPS.length} steps</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: ACTIVITY FEED
════════════════════════════════════════════════════════════════════ */
function ActivitySection({ activity, loading }) {
  if (loading) return <Loader />;
  const actionIcon = (action = '') => {
    if (action.includes('created')) return <Plus size={13} className="text-emerald-600" />;
    if (action.includes('deleted')) return <Trash2 size={13} className="text-red-500" />;
    if (action.includes('Verif')) return <CheckCircle2 size={13} className="text-blue-500" />;
    if (action.includes('Document')) return <FileText size={13} className="text-violet-500" />;
    if (action.includes('credit')) return <Coins size={13} className="text-amber-500" />;
    return <Activity size={13} className="text-gray-400" />;
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[22px] font-bold text-[#08292F] tracking-tight">Activity Feed</h2>
        <p className="text-[13px] text-gray-400">All actions across your projects</p>
      </div>
      {activity.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" sub="Actions will appear here as you manage your projects" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {activity.map((a, i) => (
            <div key={a._id || i} className="flex items-start gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                {actionIcon(a.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0F172A]">{a.action}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{a.project_name}</p>
              </div>
              <p className="text-[11px] text-gray-300 shrink-0">{fmtD(a.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SECTION: ADD NEW PROJECT (3-step wizard)
════════════════════════════════════════════════════════════════════ */
function AddProjectSection({ token, onSuccess }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmit] = useState(false);
  const [geojson, setGeojson] = useState(null);
  const [georaster, setGeoraster] = useState(null);
  const [fileErr, setFileErr] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  const [form, setForm] = useState({
    name: '', type: '', area: '', country: '', state: '', district: '',
    creditingStandard: '', methodology: '', creditStart: '', creditEnd: '',
    description: '', proponent: '', proponentContact: '',
    ccpEligible: '', projectLength: '', startDate: '',
    landTenure: '', communityBenefit: '', biodiversityImpact: '',
    baselineScenario: '', monitoringPlan: '', leakageRisk: '',
  });

  const handleInputChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
    const filesList = Array.from(e.target.files);
    if (!filesList.length) return;
    setIsParsing(true); setGeojson(null); setGeoraster(null); setFileErr(''); setJustUploaded(false);
    try {
      if (filesList.length > 1) {
        const shpParts = {}; let prjText = null;
        for (const f of filesList) {
          const ext = f.name.split('.').pop().toLowerCase();
          if (ext === 'shp') shpParts.shp = await f.arrayBuffer();
          else if (ext === 'dbf') shpParts.dbf = await f.arrayBuffer();
          else if (ext === 'prj') prjText = await f.text();
        }
        if (shpParts.shp) {
          const shapes = parseShp(shpParts.shp, prjText || false);
          const dbfRows = shpParts.dbf ? parseDbf(shpParts.dbf) : undefined;
          setGeojson(combine([shapes, dbfRows]));
          setJustUploaded(true);
        } else setFileErr('No .shp file found.');
      } else {
        const uf = filesList[0]; const ext = uf.name.split('.').pop().toLowerCase();
        if (ext === 'zip') { setGeojson(await shpjs(await uf.arrayBuffer())); setJustUploaded(true); }
        else if (ext === 'shp') { setGeojson(combine([parseShp(await uf.arrayBuffer(), false), undefined])); setJustUploaded(true); }
        else if (ext === 'geojson' || ext === 'json') { setGeojson(JSON.parse(await uf.text())); setJustUploaded(true); }
        else if (ext === 'kml') { const doc = new DOMParser().parseFromString(await uf.text(), 'text/xml'); setGeojson(kmlToGeoJSON(doc)); setJustUploaded(true); }
        else if (ext === 'tif' || ext === 'tiff') { setGeoraster(await parseGeoraster(await uf.arrayBuffer())); setJustUploaded(true); }
        else setFileErr(`Unsupported: .${ext}`);
      }
    } catch (err) { setFileErr(`Parse error: ${err.message || 'Unknown'}`); }
    finally { setIsParsing(false); }
  };

  // Every project-detail field is mandatory before proceeding.
  // Baseline Scenario / Monitoring Plan and Project Description are optional.
  const REQUIRED_FIELDS = [
    'name', 'proponent', 'country', 'state', 'district', 'type', 'area',
    'creditingStandard', 'methodology', 'startDate', 'creditStart', 'creditEnd',
    'projectLength', 'ccpEligible', 'landTenure', 'communityBenefit',
    'biodiversityImpact', 'leakageRisk',
  ];
  const missingFields = REQUIRED_FIELDS.filter((f) => String(form[f] ?? '').trim() === '');
  const isStep1Valid = missingFields.length === 0;

  const handleSubmit = async () => {
    setSubmit(true);
    // Compute area from uploaded geojson, fall back to manual input
    const computedArea = geojson ? computeGeojsonAreaHa(geojson) : 0;
    const finalArea = computedArea > 0 ? parseFloat(computedArea.toFixed(2)) : (parseFloat(form.area) || 0);
    const estCarbon = parseFloat((finalArea * 4.5).toFixed(1));
    const payload = {
      name: form.name,
      type: form.type,
      country: form.country,
      state: form.state,
      crediting_standard: form.creditingStandard,
      methodology: form.methodology,
      start_date: form.startDate,
      end_date: form.creditEnd || form.end_date,
      land_tenure: form.landTenure,
      community_benefit: form.communityBenefit === 'Yes',
      description: form.description,
      area_ha: finalArea,
      estimated_carbon: estCarbon,
      geojson,
    };
    const res = await api.createProject(token, payload);
    setSubmit(false);
    if (res.status === 'success') onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-semibold text-[#0F172A]">Project Details</h3>
            <p className="text-muted-foreground text-sm mb-6">Provide comprehensive project information.</p>

            <div className="w-full space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium text-gray-700">Project Name</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleInputChange} placeholder="Amazon Reforestation Initiative" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proponent" className="font-medium text-gray-700">Organization</Label>
                  <Input id="proponent" name="proponent" value={form.proponent} onChange={handleInputChange} placeholder="Sylithe Climate Tech" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="country" className="font-medium text-gray-700">Country</Label>
                  <Input id="country" name="country" value={form.country} onChange={handleInputChange} placeholder="India" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="font-medium text-gray-700">State / Region</Label>
                  <Input id="state" name="state" value={form.state} onChange={handleInputChange} placeholder="Maharashtra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="font-medium text-gray-700">District</Label>
                  <Input id="district" name="district" value={form.district} onChange={handleInputChange} placeholder="Pune" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="type" className="font-medium text-gray-700">Project Type</Label>
                  <Select value={form.type} onValueChange={(val) => handleInputChange({ target: { name: 'type', value: val } })}>
                    <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REDD+">REDD+</SelectItem>
                      <SelectItem value="ARR">ARR</SelectItem>
                      <SelectItem value="IFM">IFM</SelectItem>
                      <SelectItem value="Blue Carbon">Blue Carbon</SelectItem>
                      <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                      <SelectItem value="Mangrove Restoration">Mangrove Restoration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="area" className="font-medium text-gray-700">Estimated Area (ha)</Label>
                  <Input id="area" name="area" type="number" value={form.area} onChange={handleInputChange} placeholder="5000" />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Certifications and Methodologies */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="creditingStandard" className="font-medium text-gray-700">Crediting Standard</Label>
                  <Select value={form.creditingStandard} onValueChange={(val) => handleInputChange({ target: { name: 'creditingStandard', value: val } })}>
                    <SelectTrigger id="creditingStandard"><SelectValue placeholder="Select standard" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verra VCS">Verra VCS</SelectItem>
                      <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                      <SelectItem value="Plan Vivo">Plan Vivo</SelectItem>
                      <SelectItem value="ICVCM">ICVCM</SelectItem>
                      <SelectItem value="CDM">CDM</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodology" className="font-medium text-gray-700">Methodology</Label>
                  <Input id="methodology" name="methodology" value={form.methodology} onChange={handleInputChange} placeholder="VM0007, AR-ACM0003" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-medium text-gray-700">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditStart" className="font-medium text-gray-700">Crediting Start</Label>
                  <Input id="creditStart" name="creditStart" type="date" value={form.creditStart} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditEnd" className="font-medium text-gray-700">Crediting End</Label>
                  <Input id="creditEnd" name="creditEnd" type="date" value={form.creditEnd} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="projectLength" className="font-medium text-gray-700">Length (years)</Label>
                  <Input id="projectLength" name="projectLength" value={form.projectLength} onChange={handleInputChange} placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ccpEligible" className="font-medium text-gray-700">CCP Eligible</Label>
                  <Select value={form.ccpEligible} onValueChange={(val) => handleInputChange({ target: { name: 'ccpEligible', value: val } })}>
                    <SelectTrigger id="ccpEligible"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Pending">Pending Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landTenure" className="font-medium text-gray-700">Land Tenure</Label>
                  <Select value={form.landTenure} onValueChange={(val) => handleInputChange({ target: { name: 'landTenure', value: val } })}>
                    <SelectTrigger id="landTenure"><SelectValue placeholder="Select tenure" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Leased">Leased</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Impact and Risk */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="communityBenefit" className="font-medium text-gray-700">Community Benefit</Label>
                  <Select value={form.communityBenefit} onValueChange={(val) => handleInputChange({ target: { name: 'communityBenefit', value: val } })}>
                    <SelectTrigger id="communityBenefit"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biodiversityImpact" className="font-medium text-gray-700">Biodiversity</Label>
                  <Select value={form.biodiversityImpact} onValueChange={(val) => handleInputChange({ target: { name: 'biodiversityImpact', value: val } })}>
                    <SelectTrigger id="biodiversityImpact"><SelectValue placeholder="Select impact" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High Positive">High Positive</SelectItem>
                      <SelectItem value="Moderate Positive">Moderate</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Negative Risk">Negative Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leakageRisk" className="font-medium text-gray-700">Leakage Risk</Label>
                  <Select value={form.leakageRisk} onValueChange={(val) => handleInputChange({ target: { name: 'leakageRisk', value: val } })}>
                    <SelectTrigger id="leakageRisk"><SelectValue placeholder="Select risk" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Not Assessed">Not Assessed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baselineScenario" className="font-medium text-gray-700">Baseline Scenario / Monitoring Plan <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="baselineScenario" name="baselineScenario" value={form.baselineScenario} onChange={handleInputChange} placeholder="Baseline scenario description" />
                    <Input id="monitoringPlan" name="monitoringPlan" value={form.monitoringPlan} onChange={handleInputChange} placeholder="Monitoring plan summary" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="description" className="font-medium text-gray-700">Project Description <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Textarea id="description" name="description" value={form.description} onChange={handleInputChange} placeholder="Briefly describe the project: objectives, location, expected impact, and methodology notes." rows={4} className="resize-none" />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-4">
                {!isStep1Valid && (
                  <p className="text-[12px] font-medium text-amber-600 mr-auto">All fields are required — {missingFields.length} field{missingFields.length === 1 ? '' : 's'} left to complete.</p>
                )}
                <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="px-8 shadow-lg bg-[#08292F] hover:bg-[#062125] text-white rounded-xl font-bold">Next Step <HiChevronRight strokeWidth={2} className="ml-1" /></Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-semibold text-[#0F172A]">Project Boundary (AOI)</h3>
            <p className="text-muted-foreground text-sm mb-6">Upload your project area of interest.</p>

            <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                  <UploadCloud className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-semibold text-[#0F172A] leading-tight">Upload boundary file</h4>
                  <p className="text-[13px] text-gray-400 mt-0.5">Select and upload the spatial file for your project area</p>
                </div>
              </div>

              <div className="px-6 pt-5 flex flex-wrap gap-2">
                {[{ label: 'KML', ext: '.kml' }, { label: 'GeoJSON', ext: '.geojson' }, { label: 'Shapefile', ext: '.shp+.dbf+.prj' }, { label: 'ZIP', ext: '.zip' }, { label: 'GeoTIFF', ext: '.tif/.tiff' }].map(f => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {f.label}
                    <span className="font-normal text-gray-400 normal-case">{f.ext}</span>
                  </span>
                ))}
              </div>

              <div className="px-6 pt-4 pb-6">
                <div className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${isParsing ? 'border-gray-300 bg-gray-50/50' : justUploaded && (geojson || georaster) && !fileErr ? 'border-gray-300 bg-gray-50/30 cursor-pointer' : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/40 cursor-pointer'}`}>
                  <input type="file" multiple accept=".kml,.geojson,.json,.tiff,.tif,.zip,.shp,.shx,.dbf,.prj" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-4 transition-all ${isParsing ? 'bg-gray-100' : justUploaded && (geojson || georaster) ? 'bg-gray-100' : 'bg-gray-100'}`}>
                      {isParsing ? <div className="w-6 h-6 border-[3px] border-gray-400 border-t-[#08292F] rounded-full animate-spin" /> : justUploaded && (geojson || georaster) && !fileErr ? <CheckCircle2 className="w-7 h-7 text-[#08292F]" /> : <UploadCloud className="w-7 h-7 text-gray-400" />}
                    </div>
                    <p className="text-[14px] font-semibold text-[#0F172A] mb-1">
                      {isParsing ? 'Analyzing file…' : justUploaded && (geojson || georaster) && !fileErr ? 'Boundary processed successfully' : 'Click to select or drag files here'}
                    </p>
                    <p className="text-[13px] text-gray-500">Maximum file size: 50MB</p>
                  </div>
                </div>
                {fileErr && <p className="text-[13px] text-red-500 font-semibold mt-3 text-center">{fileErr}</p>}
              </div>

              {geojson && (() => {
                const areaHa = computeGeojsonAreaHa(geojson);
                const features = geojson.type === 'FeatureCollection' ? geojson.features?.length : 1;
                return (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {/* Project summary strip */}
                    <div className="px-4 py-3 bg-[#08292F] grid grid-cols-3 divide-x divide-white/10">
                      <div className="px-4 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Project</span>
                        <span className="text-[13px] font-bold text-white truncate">{form.name || '—'}</span>
                      </div>
                      <div className="px-4 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Standard</span>
                        <span className="text-[13px] font-bold text-white">{form.creditingStandard || '—'}</span>
                      </div>
                      <div className="px-4 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Area (from file)</span>
                        <span className="text-[13px] font-bold text-[#a4fca1]">
                          {areaHa > 0 ? `${Number(areaHa.toFixed(2)).toLocaleString('en-IN')} ha` : `${features} feature(s)`}
                        </span>
                      </div>
                    </div>
                    {/* Map preview */}
                    <div className="p-4">
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white h-[300px]">
                        <MapContainer center={[20, 78]} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                          <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution="&copy; Google" />
                          <GeoJSON data={geojson} style={{ color: '#a4fca1', weight: 2.5, fillOpacity: 0.2 }} />
                          <FitBounds geojson={geojson} />
                        </MapContainer>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-500 font-bold">Back to Details</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="px-8 shadow-lg bg-[#08292F] hover:bg-[#062125] text-white rounded-xl font-bold">
                {submitting ? 'Registering...' : 'Register Project'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   HUB SIDEBAR
════════════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'portfolio' },
  { key: 'my-projects', label: 'My Projects', icon: FolderOpen, group: 'portfolio' },
  { key: 'verification-pipeline', label: 'Verification Pipeline', icon: GitBranch, group: 'manage' },
  { key: 'carbon-credits', label: 'Carbon Credits', icon: Coins, group: 'manage' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, group: 'manage' },
  { key: 'activity', label: 'Activity Feed', icon: Activity, group: 'manage' },
  { key: 'add-project', label: 'Add New Project', icon: Plus, group: 'action' },
];

function HubSidebar({ active, onNav, user, onLogout, isOpen, setIsOpen }) {
  const groups = [
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'manage', label: 'Management' },
    { key: 'action', label: null },
  ];
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-[110] transform transition-transform duration-300 md:relative md:translate-x-0 w-[240px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full select-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-[64px] flex items-center gap-3 px-5 shrink-0">
          <img src={treeLogo} alt="Sylithe" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-[17px] font-bold text-[#08292F] leading-none tracking-tight">Sylithe</p>
            <p className="text-[10px] text-[#0fa958] font-semibold tracking-wider">Project Hub</p>
          </div>
        </div>

        <div className="mx-4 border-t border-dotted border-gray-200" />

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {groups.map(g => (
            <React.Fragment key={g.key}>
              {g.label && (
                <p className="px-4 pt-4 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-[0.12em]">{g.label}</p>
              )}
              {NAV_ITEMS.filter(n => n.group === g.key).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => onNav(key)}
                  className={`w-full flex items-center gap-2.5 px-4 py-[9px] rounded-md text-[14px] transition-all duration-100 text-left ${active === key
                    ? 'bg-[#E8F5E9] text-[#0F172A] font-semibold'
                    : key === 'add-project'
                      ? 'text-[#0fa958] hover:bg-gray-50 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}>
                  <Icon size={17} className={
                    active === key ? 'text-[#1B7A3D]' :
                      key === 'add-project' ? 'text-[#0fa958]' : 'text-gray-500'
                  } />
                  <span className="flex-1">{label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-3 py-3 space-y-1 shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#08292F] flex items-center justify-center text-white text-[11px] font-black shrink-0">
              {(user?.fullName || user?.email || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || 'Developer'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-[8px] text-[14px] text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-all">
            <LogOut size={17} className="text-gray-400" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════════════════════════ */
export default function ProjectDevHub() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const isPro = user?.tier === 'pro' || SUPER_EMAILS.includes(user?.email?.toLowerCase());

  const [activeSection, setActiveSection] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    // Show cached projects instantly so a refresh isn't a blank spinner while the
    // backend (possibly cold-starting) responds. Fresh data overwrites this below.
    let hadCache = false;
    try {
      const cached = localStorage.getItem('syl_dev_projects_cache');
      if (cached) {
        const { projects: cp, stats: cs } = JSON.parse(cached);
        if (cp?.length) { setProjects(cp); setStats(cs || null); hadCache = true; }
      }
    } catch { /* ignore corrupt cache */ }

    if (!hadCache) setLoading(true);
    try {
      // Primary fetch: projects + stats bundled in one response → dashboard renders immediately
      const pRes = await api.getProjects(token);
      const projects = pRes.projects || [];
      setProjects(projects);
      setStats(pRes.stats || null);
      try {
        localStorage.setItem('syl_dev_projects_cache', JSON.stringify({ projects, stats: pRes.stats }));
      } catch { /* quota — non-critical */ }
    } catch (err) {
      console.error('Failed to load projects', err);
      // Keep cached data on screen if we had it; otherwise surface the empty state
    } finally {
      setLoading(false); // always clear the spinner, even on timeout/error
    }
    // Activity loads lazily after — it's non-blocking for the initial render
    api.getActivity(token).then(aRes => setActivity(aRes.activity || [])).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadAll();
  }, [token, navigate, loadAll]);

  const refreshProject = async (id) => {
    const res = await api.getProject(token, id);
    if (res.status === 'success') {
      setSelectedProject(res.project);
      setProjects(prev => prev.map(p => p._id === id ? { ...p, ...res.project } : p));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.deleteProject(token, id);
    setProjects(prev => {
      const next = prev.filter(p => p._id !== id);
      // Recompute stats locally from remaining projects to avoid a round-trip
      const totalArea   = next.reduce((s, p) => s + (Number(p.area_ha) || 0), 0);
      const totalCarbon = next.reduce((s, p) => s + (Number(p.estimated_carbon) || 0), 0);
      setStats({
        total_projects: next.length,
        total_area_ha:  Math.round(totalArea * 100) / 100,
        total_carbon:   Math.round(totalCarbon * 100) / 100,
        verified_count: next.filter(p => ['verified','credits_issued'].includes(p.status)).length,
        in_verification: next.filter(p => p.status === 'under_verification').length,
        credits_issued: next.reduce((s, p) => s + ((p.carbon_credits?.issued) || 0), 0),
      });
      return next;
    });
    if (selectedProject?._id === id) {
      setSelectedProject(null);
      setActiveSection('my-projects');
    }
  };

  const handleNav = (section, project = null) => {
    setActiveSection(section);
    setIsSidebarOpen(false); // close sidebar on mobile after nav
    if (project) setSelectedProject(project);
  };

  const handleViewProject = (p) => {
    setSelectedProject(p); // Show immediately with list data
    setActiveSection('project-detail');
    api.getProject(token, p._id).then(r => {
      if (r.status === 'success') setSelectedProject(r.project); // Update with full data
    });
  };

  const handleEditSaved = (updated) => {
    setProjects(prev => {
      const next = prev.map(p => p._id === updated._id ? { ...p, ...updated } : p);
      const totalArea   = next.reduce((s, p) => s + (Number(p.area_ha) || 0), 0);
      const totalCarbon = next.reduce((s, p) => s + (Number(p.estimated_carbon) || 0), 0);
      setStats({
        total_projects: next.length,
        total_area_ha:  Math.round(totalArea * 100) / 100,
        total_carbon:   Math.round(totalCarbon * 100) / 100,
        verified_count: next.filter(p => ['verified','credits_issued'].includes(p.status)).length,
        in_verification: next.filter(p => p.status === 'under_verification').length,
        credits_issued: next.reduce((s, p) => s + ((p.carbon_credits?.issued) || 0), 0),
      });
      return next;
    });
    if (selectedProject?._id === updated._id) setSelectedProject(s => ({ ...s, ...updated }));
    setEditingProject(null);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F1F1F1]">
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          token={token}
          onClose={() => setEditingProject(null)}
          onSaved={handleEditSaved}
        />
      )}
      <HubSidebar active={activeSection} onNav={handleNav} user={user} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 overflow-y-auto flex flex-col h-screen">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <img src={treeLogo} alt="Sylithe" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[#08292F] tracking-tight">Sylithe</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          {activeSection === 'overview' && (
            <OverviewSection projects={projects} stats={stats} activity={activity} onNav={handleNav} onViewProject={handleViewProject} onEditProject={setEditingProject} loading={loading} />
          )}
          {activeSection === 'my-projects' && (
            <MyProjectsSection projects={projects} onView={handleViewProject} onAdd={() => handleNav('add-project')} onDelete={handleDelete} onEdit={setEditingProject} loading={loading} />
          )}
          {activeSection === 'project-detail' && selectedProject && (
            <ProjectDetailSection project={selectedProject} token={token} onBack={() => setActiveSection('my-projects')} onRefresh={refreshProject} isPro={isPro} onUpgrade={() => setShowUpgrade(true)} />
          )}
          {activeSection === 'verification-pipeline' && (
            <VerificationPipelineSection projects={projects} onViewProject={handleViewProject} loading={loading} isPro={isPro} onUpgrade={() => setShowUpgrade(true)} />
          )}
          {activeSection === 'carbon-credits' && (
            <CarbonCreditsSection projects={projects} loading={loading} />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsSection projects={projects} loading={loading} />
          )}
          {activeSection === 'activity' && (
            <ActivitySection activity={activity} loading={loading} />
          )}
          {activeSection === 'add-project' && (
            <AddProjectSection token={token} onSuccess={() => { loadAll(); setActiveSection('overview'); }} />
          )}
        </div>
      </main>
    </div>
  );
}
