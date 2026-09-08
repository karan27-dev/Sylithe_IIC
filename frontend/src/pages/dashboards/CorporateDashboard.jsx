import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  HiOutlineOfficeBuilding, HiOutlineTruck, HiOutlineShieldCheck,
  HiOutlineChartBar, HiOutlineDocumentReport, HiOutlineDotsVertical
} from 'react-icons/hi';
import { TbBuilding, TbChartPie, TbCloudStorm, TbTruckDelivery, TbLeaf, TbBriefcase, TbMenu2 } from 'react-icons/tb';
import SylitheLeftNav from '../../components/chm/SylitheLeftNav';
import DataManagement from '../../components/esg/DataManagement';

const s = {
  bg: '#FAFAF9',
  bgDark: '#08292F',
  accent: '#16a34a',
  accentSoft: 'rgba(22,163,74,0.12)',
};

/* ═══════════════════════════════════════════════════════
   CORPORATE DASHBOARD
═══════════════════════════════════════════════════════ */
const CorporateDashboard = () => {
  const [activeSection, setActiveSection] = useState('emissions');
  const [scope3Total, setScope3Total] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic emission data — Scope 3 total feeds into "Your Footprints"
  const emissionsData = [
    { month: 'Jan', scope1: 400, scope2: 240, scope3: 800 },
    { month: 'Feb', scope1: 300, scope2: 139, scope3: 700 },
    { month: 'Mar', scope1: 200, scope2: 980, scope3: 600 },
    { month: 'Apr', scope1: 278, scope2: 390, scope3: 850 },
    { month: 'May', scope1: 189, scope2: 480, scope3: 900 },
    { month: 'Jun', scope1: 239, scope2: 380, scope3: 950 },
  ];

  const baseScopeValues = { scope1: 1606, scope2: 2609, scope3: 4800 };
  const liveScope3 = baseScopeValues.scope3 + Math.round(scope3Total * 1000);
  const liveTotal = baseScopeValues.scope1 + baseScopeValues.scope2 + liveScope3;

  const scopeBreakdown = [
    { name: 'Scope 1', value: Math.round((baseScopeValues.scope1 / liveTotal) * 100), color: '#08292F' },
    { name: 'Scope 2', value: Math.round((baseScopeValues.scope2 / liveTotal) * 100), color: '#16a34a' },
    { name: 'Scope 3', value: Math.round((liveScope3 / liveTotal) * 100), color: '#a4fca1' },
  ];

  /* ─── Section renderers ─── */

  const renderFootprints = () => (
    <main className="p-4 md:p-8 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#0F172A]">Your Carbon Footprint</h2>
        <p className="text-sm text-gray-500">Live summary reflecting your data entries across all scopes.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Footprint', value: liveTotal.toLocaleString(), unit: 'tCO₂e', icon: TbChartPie, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Scope 1 (Direct)', value: baseScopeValues.scope1.toLocaleString(), unit: 'tCO₂e', icon: TbCloudStorm, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Scope 2 (Indirect)', value: baseScopeValues.scope2.toLocaleString(), unit: 'tCO₂e', icon: TbBuilding, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Scope 3 (Value Chain)', value: liveScope3.toLocaleString(), unit: 'tCO₂e', icon: TbTruckDelivery, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 ${kpi.bg} rounded-xl`}>
                <kpi.icon className={`${kpi.color} text-xl`} />
              </div>
              <HiOutlineDotsVertical className="text-gray-300" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172A]">{kpi.value}</span>
              <span className="text-xs text-slate-400 font-medium">{kpi.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scope pie chart */}
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] mb-6">Scope Distribution</h3>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div className="h-[220px] w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={scopeBreakdown} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {scopeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4">
            {scopeBreakdown.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">{item.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${item.value}%` }} transition={{ duration: 0.4 }}
                    className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {scope3Total > 0 && (
          <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <TbLeaf className="text-emerald-600" />
            <p className="text-[12px] text-emerald-700 font-medium">
              Scope 3 includes <span className="font-bold">{scope3Total.toFixed(3)} tCO₂e</span> from your data entries.
            </p>
          </div>
        )}
      </div>
    </main>
  );

  const renderEmissions = () => (
    <main className="p-4 md:p-8 overflow-y-auto">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Carbon Footprint', value: liveTotal.toLocaleString(), unit: 'tCO₂e', icon: TbChartPie, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Supply Chain Risk', value: 'High', unit: 'Level 4/5', icon: TbCloudStorm, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Offset Portfolio', value: '12', unit: 'Projects', icon: TbBuilding, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Net Zero Target', value: '2035', unit: 'Commitment', icon: HiOutlineShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 ${kpi.bg} rounded-xl`}>
                <kpi.icon className={`${kpi.color} text-xl`} />
              </div>
              <HiOutlineDotsVertical className="text-gray-300" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172A]">{kpi.value}</span>
              <span className="text-xs text-slate-400 font-medium">{kpi.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Emissions Trend</h3>
              <p className="text-sm text-gray-500 font-medium">Monthly breakdown across all scopes</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              {[
                { label: 'Scope 1', color: 'bg-[#08292F]' },
                { label: 'Scope 2', color: 'bg-[#16a34a]' },
                { label: 'Scope 3', color: 'bg-[#a4fca1]' },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} /> {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsData}>
                <defs>
                  <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#08292F" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#08292F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="scope1" stroke="#08292F" strokeWidth={3} fillOpacity={1} fill="url(#colorS1)" />
                <Area type="monotone" dataKey="scope2" stroke="#16a34a" strokeWidth={3} fill="transparent" />
                <Area type="monotone" dataKey="scope3" stroke="#a4fca1" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Scope Breakdown */}
          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#0F172A] mb-8">Scope Distribution</h3>
            <div className="h-[200px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={scopeBreakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {scopeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {scopeBreakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supply Chain Status */}
          <div className="bg-[#08292F] p-8 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-6">
              <TbTruckDelivery className="text-[#a4fca1] text-2xl" />
              <h3 className="text-lg font-bold">Supply Chain Audit</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Compliance</span>
                  <span className="text-xs font-bold text-[#a4fca1]">72%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#a4fca1] rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                12 suppliers are currently flagged for high deforestation risk in Southeast Asia.
              </p>
              <button className="w-full py-3 bg-[#a4fca1] text-[#08292F] rounded-xl font-bold text-sm hover:scale-[1.02] transition-all">
                View Risk Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  const renderPlaceholder = (title, desc) => (
    <main className="flex items-center justify-center flex-1">
      <div className="text-center py-20">
        <TbBriefcase className="text-gray-200 text-5xl mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-300 mb-2">{title}</h3>
        <p className="text-sm text-gray-300 max-w-xs mx-auto">{desc}</p>
      </div>
    </main>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'footprints':
        return renderFootprints();
      case 'emissions':
        return renderEmissions();
      case 'data_management':
        return <DataManagement onScope3Change={setScope3Total} />;
      case 'curated_portfolios':
        return renderPlaceholder('Curated Portfolios', 'Browse verified carbon offset projects matched to your industry and reduction targets.');
      case 'removals_tracking':
        return renderPlaceholder('Removals Tracking', 'Track your purchased carbon removal credits and their verification status.');
      case 'portfolio_overview':
        return renderPlaceholder('Portfolio Overview', 'View and manage your carbon credit portfolio.');
      case 'contracts':
        return renderPlaceholder('Contracts', 'View and manage your carbon credit contracts here.');
      case 'projects_list':
        return renderPlaceholder('Projects', 'Browse projects in your carbon portfolio.');
      case 'suppliers':
        return renderPlaceholder('Suppliers', 'Manage your supplier network and their ESG data.');
      case 'deliveries':
        return renderPlaceholder('Deliveries & Payments', 'Track credit deliveries and payment status.');
      default:
        return renderEmissions();
    }
  };

  /* Header title based on section */
  const getHeaderTitle = () => {
    const titles = {
      footprints: 'Your Carbon Footprint',
      emissions: 'Corporate ESG Dashboard',
      data_management: 'Data Management',
      curated_portfolios: 'Curated Portfolios',
      removals_tracking: 'Removals Tracking',
      portfolio_overview: 'Portfolio Overview',
      contracts: 'Contracts',
      projects_list: 'Projects',
      suppliers: 'Suppliers',
      deliveries: 'Deliveries & Payments',
    };
    return titles[activeSection] || 'Corporate ESG Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] font-sans">
      <SylitheLeftNav activeSection={activeSection} onSectionChange={setActiveSection} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-md">
              <TbBuilding className="text-blue-600 text-lg" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">{getHeaderTitle()}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <TbMenu2 size={20} />
          </button>
        </div>

        {/* Header — hidden when DataManagement has its own */}
        {activeSection !== 'data_management' && (
          <header className="hidden md:flex h-[64px] bg-white border-b border-gray-200 items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TbBuilding className="text-blue-600 text-xl" />
              </div>
              <h1 className="text-lg font-bold text-[#0F172A]">{getHeaderTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-[#08292F] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#062125] transition-all">
                Export ESG Report
              </button>
            </div>
          </header>
        )}

        {renderSection()}
      </div>
    </div>
  );
};

export default CorporateDashboard;
