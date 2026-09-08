import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import SylitheLeftNav from '../components/chm/SylitheLeftNav';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  HiSearch, HiX, HiArrowRight, HiRefresh, HiChevronDown,
  HiOutlineExternalLink, HiOutlineDownload, HiViewGrid, HiViewList,
} from 'react-icons/hi';
import { TbMap2, TbSatellite, TbFilter, TbMenu2 } from 'react-icons/tb';
import { Lock } from 'lucide-react';

// ─── Registry config ────────────────────────────────────────────────────────
const REGISTRY_CONFIG = {
  'Verra VCS': { color: '#2563eb', bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'Gold Standard': { color: '#d97706', bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
  'ACR': { color: '#ea580c', bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  'CAR': { color: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9', dot: '#8b5cf6' },
  'Plan Vivo': { color: '#16a34a', bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
};

const STATUS_CONFIG = {
  'Registered': { color: '#16a34a', bg: '#dcfce7', label: 'Registered' },
  'Under Validation': { color: '#d97706', bg: '#fef3c7', label: 'Under Validation' },
  'Completed': { color: '#6b7280', bg: '#f3f4f6', label: 'Completed' },
  'ACTIVE': { color: '#16a34a', bg: '#dcfce7', label: 'Active' },
};

const TYPE_STYLES = {
  'REDD+': { color: '#16a34a', bg: '#dcfce7' },
  'ARR': { color: '#059669', bg: '#d1fae5' },
  'IFM': { color: '#0d9488', bg: '#ccfbf1' },
  'Blue Carbon': { color: '#0284c7', bg: '#e0f2fe' },
  'Cookstoves': { color: '#ea580c', bg: '#fff7ed' },
  'Renewable Energy': { color: '#7c3aed', bg: '#f5f3ff' },
  'Agriculture': { color: '#ca8a04', bg: '#fefce8' },
};

const getTypeCfg = (type = '') =>
  TYPE_STYLES[type] || { color: '#6b7280', bg: '#f3f4f6' };

// ─── Type Label ──────────────────────────────────────────────────────────────
const TypeLabel = ({ type }) => {
  const cfg = getTypeCfg(type);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {type || 'Other'}
    </span>
  );
};

const getStatusCfg = (status = '') => {
  return STATUS_CONFIG[status] || { color: '#6b7280', bg: '#f3f4f6', label: status };
};

const getRegCfg = (registry = '') => {
  return REGISTRY_CONFIG[registry] || { color: '#6b7280', bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
};

const fmt = (n) => (n ? Number(n).toLocaleString() : '—');

// ─── Registry Badge ──────────────────────────────────────────────────────────
const RegistryBadge = ({ registry }) => {
  const cfg = getRegCfg(registry);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {registry}
    </span>
  );
};

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusCfg(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ring-1 ring-inset"
      style={{ backgroundColor: cfg.bg, color: cfg.color, '--tw-ring-color': `${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
};

// ─── Project Card (Grid) ─────────────────────────────────────────────────────
const ProjectCard = ({ project, onSelect, selected }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(project)}
      className={`bg-white rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${selected ? 'border-[#08292F] shadow-md ring-1 ring-[#08292F]/20' : 'border-slate-200'
        }`}
    >
      {/* Top colour bar by registry */}
      <div className="h-0.5 w-full" style={{ backgroundColor: getRegCfg(project.registry).color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getRegCfg(project.registry).color }} />
              <span className="text-[10px] font-bold text-gray-700">
                {project.registry}
              </span>
            </div>
            <span className="text-gray-300 mx-0.5">•</span>
            <span className="text-[10px] text-gray-500 font-medium">{project.type}</span>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-[#0F172A] text-[14px] leading-snug mb-0.5 line-clamp-2">
          {project.name}
        </h3>
        <p className="text-[11px] text-gray-400 mb-0.5">
          {project.id} · {project.state || 'India'}
        </p>
        {project.developer && (
          <p className="text-[11px] text-gray-400 mb-3 truncate">{project.developer}</p>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="bg-[#FAFAF9] rounded-lg p-2 text-center">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Issued</p>
            <p className="text-[13px] font-bold text-[#0F172A]">{fmt(project.credits_issued)}</p>
          </div>
          <div className="bg-[#FAFAF9] rounded-lg p-2 text-center">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Available</p>
            <p className="text-[13px] font-bold text-[#16a34a]">{fmt(project.credits_available)}</p>
          </div>
          <div className="bg-[#FAFAF9] rounded-lg p-2 text-center">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Area</p>
            <p className="text-[13px] font-bold text-[#0F172A]">{project.area_ha ? fmt(project.area_ha) : '—'}</p>
          </div>
        </div>

        {/* SDGs */}
        {project.sdg_goals?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.sdg_goals.slice(0, 4).map((sdg) => (
              <span key={sdg} className="text-[9px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded">
                SDG {sdg}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(project); }}
            className="flex-1 py-1.5 text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(project); }}
            className="flex-1 py-1.5 text-[11px] font-semibold text-white bg-[#08292f] rounded-lg hover:bg-[#062125] transition-colors flex items-center justify-center gap-1"
          >
            <TbSatellite size={12} /> Analyze
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Project Row (List) ──────────────────────────────────────────────────────
const ProjectRow = ({ project, onSelect, selected }) => {
  return (
    <tr
      onClick={() => onSelect(project)}
      className={`group cursor-pointer transition-all duration-150 border-b border-gray-100/80 hover:bg-[#F8F9FA] ${selected ? 'bg-[#08292F]/[0.03] border-l-2 border-l-[#08292F]' : 'border-l-2 border-l-transparent'
        }`}
    >
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="font-semibold text-[#0F172A] text-[13px] leading-snug line-clamp-1 group-hover:text-[#08292F]">{project.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{project.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-5"><RegistryBadge registry={project.registry} /></td>
      <td className="py-3.5 px-5"><TypeLabel type={project.type} /></td>
      <td className="py-3.5 px-5 text-[13px] text-gray-600">{project.state || '—'}</td>
      <td className="py-3.5 px-5 text-[13px] text-right text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(project.credits_issued)}</td>
      <td className="py-3.5 px-5 text-[13px] text-right font-semibold text-[#16a34a]" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(project.credits_available)}</td>
      <td className="py-3.5 px-5"><StatusBadge status={project.status} /></td>
      <td className="py-3.5 px-5">
        <button className="text-[11px] font-semibold text-[#08292f] border border-[#08292f]/20 bg-transparent px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#08292f] hover:text-white transition-all duration-150 whitespace-nowrap">
          <TbSatellite size={12} /> Analyze
        </button>
      </td>
    </tr>
  );
};

// ─── Detail Panel ────────────────────────────────────────────────────────────
const DetailPanel = ({ project, onClose }) => {
  if (!project) return null;
  const regCfg = getRegCfg(project.registry);
  const issuanceData = [
    { year: '2018', credits: Math.round((project.credits_issued || 0) * 0.08) },
    { year: '2019', credits: Math.round((project.credits_issued || 0) * 0.11) },
    { year: '2020', credits: Math.round((project.credits_issued || 0) * 0.13) },
    { year: '2021', credits: Math.round((project.credits_issued || 0) * 0.16) },
    { year: '2022', credits: Math.round((project.credits_issued || 0) * 0.18) },
    { year: '2023', credits: Math.round((project.credits_issued || 0) * 0.18) },
    { year: '2024', credits: Math.round((project.credits_issued || 0) * 0.16) },
  ].filter(d => d.credits > 0);

  const infoItems = [
    { label: 'Type', value: project.type },
    { label: 'Sub-type', value: project.subtype },
    { label: 'Country', value: 'India' },
    { label: 'State', value: project.state },
    { label: 'Developer', value: project.developer },
    { label: 'Validator', value: project.validated_by },
    { label: 'Start Year', value: project.start_year },
    { label: 'Area', value: project.area_ha ? `${fmt(project.area_ha)} ha` : null },
    { label: 'Updated', value: project.last_updated },
  ].filter(i => i.value);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-[2000] overflow-y-auto border-l border-gray-200/80 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 px-5 py-4 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: regCfg.color }} />
                  <span className="text-[11px] font-bold text-gray-700">
                    {project.registry}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{project.id}</span>
              </div>
              <h2 className="font-bold text-[#0F172A] text-[16px] leading-snug">{project.name}</h2>
              {project.developer && (
                <p className="text-[12px] text-gray-400 mt-1">{project.developer}</p>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0 mt-0.5">
              <HiX size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 space-y-5">

          {/* Credit metrics row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-gray-200/80 rounded-lg p-3 text-center">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Issued</p>
              <p className="text-[17px] font-bold text-[#0F172A] leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(project.credits_issued)}</p>
              <p className="text-[9px] text-gray-400 mt-1">tCO2e</p>
            </div>
            <div className="border border-gray-200/80 rounded-lg p-3 text-center">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Available</p>
              <p className="text-[17px] font-bold text-[#16a34a] leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(project.credits_available)}</p>
              <p className="text-[9px] text-gray-400 mt-1">tCO2e</p>
            </div>
            <div className="border border-gray-200/80 rounded-lg p-3 text-center">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Retired</p>
              <p className="text-[17px] font-bold text-gray-600 leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(project.credits_retired)}</p>
              <p className="text-[9px] text-gray-400 mt-1">tCO2e</p>
            </div>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            {project.standards?.map(s => (
              <span key={s} className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded">{s}</span>
            ))}
          </div>

          {/* Project details */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.06em] mb-2.5">Project Details</p>
            <div className="border border-gray-200/60 rounded-lg overflow-hidden">
              {infoItems.map(({ label, value }, idx) => (
                <div key={label} className={`flex items-center justify-between px-3.5 py-2.5 ${idx < infoItems.length - 1 ? 'border-b border-gray-100/80' : ''}`}>
                  <span className="text-[11px] text-gray-400 font-medium">{label}</span>
                  <span className="text-[11px] text-[#0F172A] font-semibold text-right max-w-[55%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issuance chart */}
          {issuanceData.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.06em] mb-2.5">Issuance History</p>
              <div className="border border-gray-200/60 rounded-lg p-3">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={issuanceData} barSize={18}>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v) => [`${fmt(v)} tCO2e`, 'Credits']}
                      contentStyle={{ fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                    <Bar dataKey="credits" radius={[3, 3, 0, 0]}>
                      {issuanceData.map((_, i) => (
                        <Cell key={i} fill={i === issuanceData.length - 1 ? '#08292F' : '#d1d5db'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SDGs */}
          {project.sdg_goals?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.06em] mb-2.5">SDG Co-Benefits</p>
              <div className="flex flex-wrap gap-1.5">
                {project.sdg_goals.map(sdg => (
                  <span key={sdg} className="text-[10px] bg-[#FAFAF9] text-gray-600 font-semibold px-2 py-1 rounded border border-gray-200/60">
                    SDG {sdg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location mini-map */}
          {project.lat && project.lng && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.06em] mb-2.5">Location</p>
              <div className="h-[140px] rounded-lg overflow-hidden border border-gray-200/60">
                <MapContainer
                  center={[project.lat, project.lng]}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution=""
                  />
                  <CircleMarker
                    center={[project.lat, project.lng]}
                    radius={8}
                    pathOptions={{ color: regCfg.color, fillColor: regCfg.color, fillOpacity: 0.8, weight: 2 }}
                  />
                </MapContainer>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{project.lat?.toFixed(4)}, {project.lng?.toFixed(4)}</p>
            </div>
          )}

          {/* Sylithe analysis CTA */}
          <div className="bg-[#08292F] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#a4fca1]/15 flex items-center justify-center">
                <TbSatellite size={14} className="text-[#a4fca1]" />
              </div>
              <p className="text-white font-semibold text-[13px]">Satellite Analysis</p>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
              Run LULC, CHM, AGB, and DCAB analysis on this project area.
            </p>
            <button
              onClick={() => window.location.href = '/chm-verification'}
              className="w-full bg-[#a4fca1] text-[#08292F] font-semibold py-2.5 rounded-lg text-[12px] hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Launch Analysis <HiArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200/60 px-5 py-3 flex gap-2">
          {project.registry_url && (
            <a
              href={project.registry_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <HiOutlineExternalLink size={13} /> Registry
            </a>
          )}
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <HiOutlineDownload size={15} /> Export
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Filter Dropdown ─────────────────────────────────────────────────────────
const FilterDropdown = ({ label, value, options, onChange, allLabel = 'All', isLocked = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = value !== 'all';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all ${active
            ? 'bg-[#08292F] text-white border-[#08292F]'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
      >
        {label}{active ? `: ${value}` : ''} <HiChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1.5 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-[2000] min-w-[170px] py-1.5 max-h-60 overflow-y-auto"
          >
            {isLocked ? (
              <div className="px-4 py-3 text-center">
                <Lock size={16} className="text-gray-400 mx-auto mb-2" />
                <p className="text-[12px] font-bold text-[#0F172A] mb-1">Pro Feature</p>
                <p className="text-[10px] text-gray-500 mb-3">Upgrade to unlock advanced filters.</p>
                <a href="mailto:info@sylithe.com?subject=Upgrade to Pro" className="text-[11px] font-semibold text-white bg-[#08292F] px-3 py-1.5 rounded-lg hover:bg-[#062125] transition-colors">
                  Upgrade Now
                </a>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { onChange('all'); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${value === 'all' ? 'font-bold text-[#16a34a]' : 'text-gray-700'}`}
                >
                  {allLabel}
                </button>
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${value === opt ? 'font-bold text-[#16a34a]' : 'text-gray-700'}`}
                  >
                    {opt}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ProjectsRegistry = () => {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ registries: [], types: [], states: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [registry, setRegistry] = useState('all');
  const [type, setType] = useState('all');
  const [state, setState] = useState('all');
  const [sort, setSort] = useState('credits_issued');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list'); // list | grid | map

  const [selectedProject, setSelectedProject] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        search, registry, type, state, sort, page, per_page: view === 'map' ? 100 : 18,
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects?${params}`);
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
        if (data.filters) setFilters(data.filters);
      } else {
        setError(data.message || 'Failed to load projects');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }, [search, registry, type, state, sort, page, view]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/projects/refresh`, { method: 'POST' });
      await fetchProjects();
    } finally {
      setRefreshing(false);
    }
  };

  const resetFilters = () => {
    setRegistry('all'); setType('all'); setState('all');
    setSearch(''); setSearchInput(''); setSort('credits_issued'); setPage(1);
  };

  const hasActiveFilters = registry !== 'all' || type !== 'all' || state !== 'all' || search;

  // Indian state/UT center coordinates for geocoding projects without lat/lng
  const STATE_COORDS = {
    'andhra pradesh': [15.9129, 79.7400], 'arunachal pradesh': [28.2180, 94.7278],
    'assam': [26.2006, 92.9376], 'bihar': [25.0961, 85.3131],
    'chhattisgarh': [21.2787, 81.8661], 'goa': [15.2993, 74.1240],
    'gujarat': [22.3090, 72.1373], 'haryana': [29.0588, 76.0856],
    'himachal pradesh': [31.1048, 77.1734], 'jharkhand': [23.6102, 85.2799],
    'karnataka': [15.3173, 75.7139], 'kerala': [10.8505, 76.2711],
    'madhya pradesh': [22.9734, 78.6569], 'maharashtra': [19.7515, 75.7139],
    'manipur': [24.6637, 93.9063], 'meghalaya': [25.4670, 91.3662],
    'mizoram': [23.1645, 92.9376], 'nagaland': [26.1584, 94.5624],
    'odisha': [20.9517, 85.0985], 'punjab': [31.1471, 75.3412],
    'rajasthan': [27.0238, 74.2179], 'sikkim': [27.5330, 88.5122],
    'tamil nadu': [11.1271, 78.6569], 'telangana': [18.1124, 79.0193],
    'tripura': [23.9408, 91.9882], 'uttar pradesh': [26.8467, 80.9462],
    'uttarakhand': [30.0668, 79.0193], 'west bengal': [22.9868, 87.8550],
    'delhi': [28.7041, 77.1025], 'jammu and kashmir': [33.7782, 76.5762],
    'ladakh': [34.1526, 77.5771], 'chandigarh': [30.7333, 76.7794],
    'puducherry': [11.9416, 79.8083], 'andaman and nicobar': [11.7401, 92.6586],
    'dadra and nagar haveli': [20.1809, 73.0169], 'daman and diu': [20.4283, 72.8397],
    'lakshadweep': [10.5667, 72.6417], 'asia': [22.5, 82.5],
  };

  const isLoggedIn = !!localStorage.getItem('sylithe_token');
  const userObj = JSON.parse(localStorage.getItem('sylithe_user') || '{}');
  const userTier = userObj.tier || 'free';
  const isFree = false; // all signed-up users get full project registry access

  const verraProjects = projects.filter(p => p.registry === 'Verra VCS');
  const gsProjects = projects.filter(p => p.registry === 'Gold Standard');

  const displayedProjects = useMemo(() => {
    return projects;
  }, [projects]);

  const mapProjects = useMemo(() => {
    return displayedProjects.map((p, idx) => {
      if (p.lat && p.lng) return p;
      const stateStr = typeof p.state === 'string' ? p.state : '';
      const stateKey = stateStr.toLowerCase().trim();
      const coords = STATE_COORDS[stateKey];
      // Add slight jitter so overlapping projects spread out
      const jitter = () => (Math.random() - 0.5) * (coords ? 1.5 : 4);
      const baseLat = coords ? coords[0] : 22.5;
      const baseLng = coords ? coords[1] : 82.5;
      return { ...p, lat: baseLat + jitter(), lng: baseLng + jitter() };
    }).filter(p => p.lat && p.lng);
  }, [displayedProjects]);

  return (
    <div className={`flex min-h-screen bg-[#FAFAF9] font-sans ${!isLoggedIn ? 'pt-20' : ''}`}>

      {isLoggedIn && <SylitheLeftNav isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

      <div className={`flex-1 min-w-0 ${isLoggedIn ? 'md:ml-[260px]' : ''}`}>

        {/* Mobile Header (Only when logged in) */}
        {isLoggedIn && (
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F172A] text-sm">Project Registry</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <TbMenu2 size={20} />
            </button>
          </div>
        )}

        {/* ── Compact Header (Sylvera-style) ── */}
        <div className="bg-white border-b border-gray-200/80">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            {/* Top row: title + search */}
            <div className="hidden md:flex items-center justify-between h-[64px]">
              <div className="flex items-center gap-4">
                <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Project Registry</h1>
                <span className="text-[12px] text-gray-400 font-medium hidden md:block">
                  {total > 0 ? `${total.toLocaleString()} projects` : ''}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search projects..."
                    className="w-[260px] pl-9 pr-8 py-2 bg-[#F5F5F4] border border-transparent rounded-lg text-[13px] focus:outline-none focus:border-[#08292F]/20 focus:bg-white transition-all"
                  />
                  {searchInput && (
                    <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <HiX size={13} />
                    </button>
                  )}
                </form>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title="Refresh data"
                >
                  <HiRefresh size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary KPI Strip (Carbon Direct-style) ── */}
        <div className="bg-white border-b border-gray-200/60">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Projects', value: total > 0 ? total.toLocaleString() : '--', sub: 'Across all registries' },
                { label: 'Verra VCS', value: verraProjects.length > 0 ? verraProjects.length : '--', sub: 'Projects', dot: '#2563eb' },
                { label: 'Gold Standard', value: gsProjects.length > 0 ? gsProjects.length : '--', sub: 'Projects', dot: '#d97706' },
                { label: 'Total Credits Issued', value: projects.length > 0 ? fmt(projects.reduce((s, p) => s + (p.credits_issued || 0), 0)) : '--', sub: 'tCO\u2082e' },
                { label: 'Available Credits', value: projects.length > 0 ? fmt(projects.reduce((s, p) => s + (p.credits_available || 0), 0)) : '--', sub: 'tCO\u2082e', highlight: true },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    {kpi.dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: kpi.dot }} />}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                  </div>
                  <p className={`text-2xl font-bold tracking-tight leading-none ${kpi.highlight ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter + View bar ── */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-2.5 flex items-center gap-2 flex-wrap">

            {/* Registry quick filters (Verra + Gold Standard only) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mr-1">
              {Object.entries(REGISTRY_CONFIG).filter(([name]) => name === 'Verra VCS' || name === 'Gold Standard').map(([name, cfg]) => (
                <button
                  key={name}
                  onClick={() => { setRegistry(registry === name ? 'all' : name); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm shrink-0 border ${registry === name
                      ? 'bg-[#08292F] text-white border-[#08292F]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: registry === name ? 'white' : cfg.color }} />
                  {name}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1 hidden md:block" />

            <FilterDropdown
              label="Type"
              value={type}
              options={filters.types}
              onChange={(v) => { setType(v); setPage(1); }}
              allLabel="All Types"
              isLocked={isFree}
            />
            <FilterDropdown
              label="State"
              value={state}
              options={(filters.states || []).filter(s => s && typeof s === 'string' && Object.keys(STATE_COORDS).includes(s.toLowerCase().trim()))}
              onChange={(v) => { setState(v); setPage(1); }}
              allLabel="All States"
              isLocked={isFree}
            />
            <FilterDropdown
              label="Sort"
              value={sort}
              options={['credits_issued', 'credits_available', 'name', 'start_year', 'area']}
              onChange={setSort}
              allLabel="Most Credits"
            />

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors ml-1"
              >
                <HiX size={11} /> Clear
              </button>
            )}

            <div className="flex-1" />

            {/* View toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-px">
              {[
                { id: 'list', icon: <HiViewList size={15} />, tip: 'Table' },
                { id: 'grid', icon: <HiViewGrid size={15} />, tip: 'Cards' },
                { id: 'map', icon: <TbMap2 size={15} />, tip: 'Map' },
              ].map(({ id, icon, tip }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  title={tip}
                  className={`p-1.5 rounded-md transition-all ${view === id ? 'bg-[#08292F] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-gray-400 tabular-nums shrink-0 hidden lg:block">
              Page {page}/{totalPages}
            </span>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-6">

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] font-medium">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-0'}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`bg-white rounded-xl border border-gray-100 animate-pulse ${view === 'grid' ? 'h-48' : 'h-14 mb-px'}`} />
              ))}
            </div>
          )}

          {/* Free tier banner */}
          {isFree && projects.length > 0 && (
            <div className="mb-5 bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#08292F] flex items-center justify-center shrink-0">
                    <Lock size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-bold text-[#0F172A] flex items-center gap-1.5">
                      Free Tier Access
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Showing exactly 5 unlocked preview projects out of {total.toLocaleString()} available. To view the rest, please upgrade.</p>
                  </div>
                </div>
                <a
                  href="mailto:info@sylithe.com?subject=Upgrade to Pro"
                  className="shrink-0 bg-[#08292F] text-white text-[11px] font-semibold px-4 py-2 rounded-lg hover:bg-[#062125] transition-all"
                >
                  Upgrade Access
                </a>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="px-5 py-2.5 bg-[#FAFAF9] flex items-center gap-4">
                <span className="text-[10px] text-gray-400 font-medium">Unlock full registry data, advanced filters, export tools, and satellite analysis.</span>
              </div>
            </div>
          )}

          {/* ══ LIST VIEW (default, Sylvera-style) ══ */}
          {!loading && view === 'list' && (
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80">
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[30%]">Project</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registry</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="text-right py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Issued</th>
                      <th className="text-right py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-5 w-[90px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProjects.map((p, idx) => (
                      p._locked ? (
                        <tr key={p.id} className="border-b border-slate-100 last:border-0 relative bg-slate-50/30">
                          <td className="py-4 px-5 blur-[4px] opacity-40 select-none pointer-events-none">
                            <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">{p.name || 'Project Name Placeholder'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{p.id} {p.developer ? `\u00b7 ${p.developer}` : ''}</p>
                          </td>
                          <td className="py-4 px-5 blur-[4px] opacity-40 select-none pointer-events-none">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400" />
                              <span className="text-sm font-medium text-slate-500">{p.registry}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 max-w-[140px] blur-[4px] opacity-40 select-none pointer-events-none">
                            <span className="text-xs text-slate-500 font-medium line-clamp-1">{p.type || '--'}</span>
                          </td>
                          <td className="py-4 px-5 blur-[4px] opacity-40 select-none pointer-events-none">
                            <span className="text-sm text-slate-500">{p.state || '--'}</span>
                          </td>
                          <td className="py-4 px-5 text-right blur-[4px] opacity-40 select-none pointer-events-none shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <span className="text-sm text-slate-500 font-medium">{fmt(p.credits_issued)}</span>
                          </td>
                          <td className="py-4 px-5 text-right blur-[4px] opacity-40 select-none pointer-events-none shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <span className="text-sm text-slate-500 font-semibold">{fmt(p.credits_available)}</span>
                          </td>
                          <td className="py-4 px-5 blur-[4px] opacity-40 select-none pointer-events-none">
                            <span className="bg-slate-200/80 text-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ring-1 ring-inset ring-slate-500/10">Locked</span>
                          </td>
                          <td className="py-4 px-5 w-[100px]">
                            <div className="flex items-center justify-end gap-1.5 shrink-0">
                              <Lock size={12} className="text-slate-400" />
                              <a href="mailto:info@sylithe.com?subject=Upgrade to Pro" className="text-xs text-[#08292F] font-bold hover:underline whitespace-nowrap">Unlock</a>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProject(p)}
                          className={`border-b border-slate-100 last:border-0 cursor-pointer transition-colors duration-200 group ${selectedProject?.id === p.id
                              ? 'bg-[#08292F]/[0.03]'
                              : 'hover:bg-slate-50/70'
                            }`}
                        >
                          <td className="py-4 px-5">
                            <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#08292F]">{p.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{p.id} {p.developer ? `\u00b7 ${p.developer}` : ''}</p>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getRegCfg(p.registry).color }} />
                              <span className="text-sm font-medium text-slate-700">
                                {p.registry}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 max-w-[140px]">
                            <span className="text-xs text-slate-600 font-medium line-clamp-1">{p.type || '--'}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-sm text-slate-600">{p.state || '--'}</span>
                          </td>
                          <td className="py-4 px-5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <span className="text-sm text-slate-900 font-medium">{fmt(p.credits_issued)}</span>
                          </td>
                          <td className="py-4 px-5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <span className="text-sm text-emerald-600 font-semibold">{fmt(p.credits_available)}</span>
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="py-4 px-5">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 px-3.5 py-1.5 rounded-lg whitespace-nowrap"
                            >
                              Analyze
                            </button>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
              {projects.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <TbMap2 size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-[14px]">No projects found</p>
                  <p className="text-[12px] mt-1">Adjust your search or filters</p>
                </div>
              )}
            </div>
          )}

          {/* ══ GRID VIEW ══ */}
          {!loading && view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedProjects.map((p) => (
                p._locked ? (
                  <div key={p.id} className="relative rounded-xl overflow-hidden">
                    <div className="blur-sm pointer-events-none select-none">
                      <ProjectCard project={p} onSelect={() => { }} selected={false} />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl">
                      <Lock size={16} className="text-gray-400 mb-2" />
                      <p className="text-[11px] font-semibold text-gray-600 mb-1">Pro Feature</p>
                      <a href="mailto:info@sylithe.com?subject=Upgrade to Pro" className="text-[11px] text-[#08292F] font-semibold hover:underline">Unlock Access</a>
                    </div>
                  </div>
                ) : (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onSelect={setSelectedProject}
                    selected={selectedProject?.id === p.id}
                  />
                )
              ))}
              {projects.length === 0 && (
                <div className="col-span-3 text-center py-20 text-gray-400">
                  <TbMap2 size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-[14px]">No projects found</p>
                  <p className="text-[12px] mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}

          {/* ══ MAP VIEW ══ */}
          {!loading && view === 'map' && (
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden h-[600px] relative shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <MapContainer
                center={[22.5, 82.5]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {mapProjects.map(p => (
                  <CircleMarker
                    key={p.id}
                    center={[p.lat, p.lng]}
                    radius={3}
                    pathOptions={{
                      color: p._locked ? '#9ca3af' : getRegCfg(p.registry).color,
                      fillColor: p._locked ? '#d1d5db' : getRegCfg(p.registry).dot,
                      fillOpacity: p._locked ? 0.6 : 0.9,
                      weight: 1.5,
                    }}
                    eventHandlers={{
                      click: () => {
                        if (!p._locked) setSelectedProject(p);
                      }
                    }}
                  >
                    <LeafletTooltip direction="top" offset={[0, -5]} opacity={1}>
                      <div className="text-[11px] font-sans">
                        <p className="font-bold text-[#0F172A] mb-0.5 max-w-[200px] truncate">{p.name}</p>
                        <p className="text-gray-500 mb-1">{p.registry} · {p.state || 'Unknown State'}</p>
                        {p._locked ? (
                          <p className="text-red-500 font-semibold flex items-center gap-1"><Lock size={10} /> Pro Feature (Locked)</p>
                        ) : (
                          <p className="text-[#16a34a] font-bold">{fmt(p.credits_issued)} tCO2e issued</p>
                        )}
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-3 shadow-lg z-[999]">
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Registry</p>
                {Object.entries(REGISTRY_CONFIG).filter(([name]) => name === 'Verra VCS' || name === 'Gold Standard').map(([name, cfg]) => (
                  <div key={name} className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                    <span className="text-[11px] text-gray-600 font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/60">
              <p className="text-[12px] text-gray-400">
                Page {page} of {totalPages} ({total.toLocaleString()} total)
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail slide-over */}
        {selectedProject && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedProject(null)}
            />
            <DetailPanel
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsRegistry;
