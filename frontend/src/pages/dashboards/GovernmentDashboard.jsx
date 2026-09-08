import React from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  HiOutlineShieldExclamation, HiOutlineGlobeAlt, HiOutlinePresentationChartBar,
  HiOutlineClipboardCheck, HiOutlineScale, HiOutlineMap
} from 'react-icons/hi';
import { TbBuildingBank, TbTrees, TbWorld, TbAlertTriangle, TbLeaf, TbMenu2 } from 'react-icons/tb';
import SylitheLeftNav from '../../components/chm/SylitheLeftNav';

const forestLossData = [
  { year: '2019', loss: 450 },
  { year: '2020', loss: 420 },
  { year: '2021', loss: 480 },
  { year: '2022', loss: 390 },
  { year: '2023', loss: 310 },
  { year: '2024', loss: 280 },
];

const GovernmentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] font-sans">
      <SylitheLeftNav isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-md">
              <TbBuildingBank className="text-indigo-600 text-lg" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">National Monitoring</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <TbMenu2 size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex h-[64px] bg-white border-b border-gray-200 items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TbBuildingBank className="text-indigo-600 text-xl" />
            </div>
            <h1 className="text-lg font-bold text-[#0F172A]">National Climate Monitoring</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                <TbWorld className="text-indigo-600 animate-spin-slow" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">National Registry v2.4</span>
             </div>
             <button className="px-4 py-2 bg-[#08292F] text-white rounded-xl text-sm font-bold shadow-md">
                Generate Policy Brief
             </button>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto">
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Forest Cover', value: '71.3M', unit: 'Hectares', icon: TbTrees, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '-0.2%' },
              { label: 'Annual Carbon Stock', value: '7.21B', unit: 'tCO2e', icon: TbLeaf, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+1.4%' },
              { label: 'Compliance Rate', value: '88.4%', unit: 'Active Policy', icon: HiOutlineClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+5.2%' },
              { label: 'Active Alerts', value: '142', unit: 'Critical Points', icon: TbAlertTriangle, color: 'text-red-500', bg: 'bg-red-50', trend: 'High' },
            ].map((kpi, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2.5 ${kpi.bg} rounded-xl`}>
                      <kpi.icon className={`${kpi.color} text-xl`} />
                   </div>
                   <span className={`text-[10px] font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-500' : kpi.trend === 'High' ? 'text-red-500' : 'text-slate-400'}`}>
                      {kpi.trend}
                   </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-bold text-[#0F172A]">{kpi.value}</span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">{kpi.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* National LULC Map */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                     <h3 className="font-bold text-[#0F172A]">National Land Use (LULC) Heatmap</h3>
                     <p className="text-xs text-gray-500 font-medium">10m resolution satellite monitoring layer</p>
                  </div>
                  <div className="flex gap-2">
                     <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none">
                        <option>Current Year</option>
                        <option>2023 Analysis</option>
                        <option>Historical Baseline</option>
                     </select>
                  </div>
               </div>
               <div className="h-[500px] relative bg-slate-50">
                  {/* Mock Map View */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                     <TbWorld className="w-96 h-96 text-indigo-900" />
                  </div>
                  {/* Map Controls */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                     {[HiOutlineMap, HiOutlineGlobeAlt, HiOutlinePresentationChartBar].map((Icon, idx) => (
                        <button key={idx} className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors">
                           <Icon size={20} />
                        </button>
                     ))}
                  </div>
                  {/* Legend */}
                  <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-sm p-3 md:p-5 rounded-2xl shadow-2xl border border-white/20 z-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                     {[
                        { color: '#16a34a', label: 'Primary Forest' },
                        { color: '#fbbf24', label: 'Agriculture' },
                        { color: '#3b82f6', label: 'Water Bodies' },
                        { color: '#ef4444', label: 'Urban / Built' },
                        { color: '#7c3aed', label: 'Secondary Growth' },
                        { color: '#6b7280', label: 'Degraded Land' },
                     ].map((l, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                           <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                           <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{l.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Sidebar Column */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
               {/* Compliance Feed */}
               <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8">
                     <HiOutlineShieldExclamation className="text-red-500 text-2xl" />
                     <h3 className="font-bold text-[#0F172A]">Compliance Alerts</h3>
                  </div>
                  <div className="space-y-6 flex-1">
                     {[
                        { region: 'Amazon North', type: 'Illegal Mining', severity: 'Critical', time: '2h ago' },
                        { region: 'Boreal East', type: 'Forest Fire Risk', severity: 'High', time: '5h ago' },
                        { region: 'Coastal Sector 4', type: 'Mangrove Encroachment', severity: 'Medium', time: '12h ago' },
                        { region: 'Central Highlands', type: 'Unauthorized Logging', severity: 'Critical', time: '1d ago' },
                     ].map((alert, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 group transition-all">
                           <div className="flex justify-between mb-1.5">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alert.region}</span>
                              <span className="text-[10px] font-bold text-gray-400">{alert.time}</span>
                           </div>
                           <h4 className="text-[13px] font-bold text-[#0F172A] mb-1">{alert.type}</h4>
                           <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${alert.severity === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                              <span className={`text-[10px] font-bold uppercase ${alert.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                                 {alert.severity} Severity
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
                  <button className="w-full mt-10 py-4 bg-[#08292f] text-[#a4fca1] rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                     <HiOutlineScale /> Deploy Enforcement Units
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
