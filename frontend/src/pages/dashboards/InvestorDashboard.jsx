import React from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import { 
  HiOutlineSearch, HiOutlineFilter, HiOutlineGlobe,
  HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineBriefcase
} from 'react-icons/hi';
import { TbCoin, TbMap2, TbChartPie, TbAlertTriangle, TbMenu2 } from 'react-icons/tb';
import SylitheLeftNav from '../../components/chm/SylitheLeftNav';

const s = {
  bg: '#FAFAF9',
  bgDark: '#08292F',
  accent: '#16a34a',
  accentSoft: 'rgba(22,163,74,0.12)',
};

const portfolioImpact = [
  { name: 'Reforestation', value: 45, color: '#08292F' },
  { name: 'Conservation', value: 30, color: '#16a34a' },
  { name: 'Blue Carbon', value: 15, color: '#a4fca1' },
  { name: 'Cookstoves', value: 10, color: '#fbbf24' },
];

const investorProjects = [
  { id: 1, name: 'Amazon Rainforest Protection', lat: -3.4653, lng: -62.2159, type: 'REDD+', integrity: 98, credits: '1.2M' },
  { id: 2, name: 'Coastal Mangrove Restoration', lat: 10.8505, lng: 76.2711, type: 'Blue Carbon', integrity: 95, credits: '450k' },
  { id: 3, name: 'Kenya Reforestation Project', lat: -0.0236, lng: 37.9062, type: 'ARR', integrity: 92, credits: '800k' },
  { id: 4, name: 'Sumatra Peatland Conservation', lat: -0.5897, lng: 101.3431, type: 'IFM', integrity: 89, credits: '2.1M' },
];

const InvestorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] font-sans">
      <SylitheLeftNav isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-md">
              <TbCoin className="text-amber-600 text-lg" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">Investor Dashboard</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <TbMenu2 size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex h-[64px] bg-white border-b border-gray-200 items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TbCoin className="text-amber-600 text-xl" />
            </div>
            <h1 className="text-lg font-bold text-[#0F172A]">Buyer & Investor Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Find carbon projects..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
             </div>
             <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <HiOutlineFilter className="text-gray-500" />
             </button>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Stats & Map */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Portfolio Credits', value: '4.55M', unit: 'tCO2e', icon: HiOutlineTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg. Project Integrity', value: '94.8%', unit: 'Sylithe Score', icon: HiOutlineShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Capital Deployed', value: '$84.2M', unit: 'Total USD', icon: HiOutlineBriefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <kpi.icon className={`${kpi.color} text-xl`} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#0F172A]">{kpi.value}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{kpi.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Discovery Map */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0F172A]">Global Project Discovery</h3>
                  <p className="text-xs text-gray-500 font-medium">Verified high-quality carbon projects</p>
                </div>
                <div className="flex gap-2">
                   <button className="px-3 py-1.5 bg-[#08292F] text-white rounded-lg text-xs font-bold">Map View</button>
                   <button className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold">List View</button>
                </div>
              </div>
              <div className="h-[450px] relative">
                <MapContainer center={[10, 0]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {investorProjects.map((p) => (
                    <CircleMarker 
                      key={p.id} 
                      center={[p.lat, p.lng]} 
                      radius={8}
                      pathOptions={{ color: '#08292F', fillColor: '#16a34a', fillOpacity: 0.8 }}
                    >
                      <LeafletTooltip>
                        <div className="p-2">
                          <p className="font-bold text-xs mb-1">{p.name}</p>
                          <div className="flex gap-2 mb-1">
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">{p.type}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">Score: {p.integrity}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{p.credits} Credits</p>
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100 z-[1000] flex flex-col gap-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Project Types</p>
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#08292F]" />
                      <span className="text-xs text-gray-600 font-medium">REDD+</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                      <span className="text-xs text-gray-600 font-medium">Blue Carbon</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#a4fca1]" />
                      <span className="text-xs text-gray-600 font-medium">ARR</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Portfolio Analysis */}
          <div className="lg:col-span-4 flex flex-col gap-8">
             {/* Portfolio Mix Pie Chart */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#0F172A] mb-8">Portfolio Impact Mix</h3>
                <div className="h-[240px] mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioImpact}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {portfolioImpact.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {portfolioImpact.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0F172A]">{item.value}%</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Integrity Alerts Feed */}
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-bold text-[#0F172A]">Integrity Alerts</h3>
                   <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full font-bold uppercase tracking-wider">2 Critical</span>
                </div>
                <div className="space-y-6">
                   {[
                      { title: 'Sumatra Peatland Risk', desc: 'Deforestation detected 5km from boundary.', level: 'critical' },
                      { title: 'Kenya Project Update', desc: 'New biomass data indicates 12% growth increase.', level: 'positive' },
                      { title: 'Global Credit Price', desc: 'Blue carbon credit floor up by 8.5% this week.', level: 'neutral' },
                   ].map((alert, i) => (
                      <div key={i} className="group cursor-pointer">
                         <div className="flex items-center gap-3 mb-2">
                            <div className={`w-2 h-2 rounded-full ${
                               alert.level === 'critical' ? 'bg-red-500' : 
                               alert.level === 'positive' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`} />
                            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#16a34a] transition-colors">{alert.title}</h4>
                         </div>
                         <p className="text-xs text-gray-500 leading-relaxed font-medium pl-5">{alert.desc}</p>
                      </div>
                   ))}
                </div>
                <button className="w-full mt-10 py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">
                   View Continuous MRV Feed
                </button>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvestorDashboard;
