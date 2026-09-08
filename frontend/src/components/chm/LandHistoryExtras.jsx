import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { TreePine, Flame, CloudRain, Sprout } from 'lucide-react';

/* White, boxed land-history cards (deforestation / fire / rainfall / NDVI by year)
   styled to match the GeeAnalytics CarbonBox look. */

function Box({ icon: Icon, title, subtitle, color, footer, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[8px] flex flex-col shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-start gap-2 p-5 pb-4 border-b border-gray-100">
        <Icon size={18} style={{ color }} className="mt-0.5" />
        <div>
          <h3 className="text-[18px] font-bold tracking-tight text-[#1f2937] leading-tight">{title}</h3>
          {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5"><div style={{ width: '100%', height: 240 }}>{children}</div></div>
      {footer && <div className="px-5 py-4 border-t border-gray-100"><p className="text-[12px] leading-relaxed text-[#6b7280]">{footer}</p></div>}
    </div>
  );
}

const ax = { tick: { fill: '#6b7280', fontSize: 12 }, axisLine: { stroke: '#e5e7eb' }, tickLine: false };
const tip = { borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };

export default function LandHistoryExtras({ data }) {
  if (!data) return null;
  const defor = (data.deforestation || []).filter((d) => d.year >= 2010);
  const fire = (data.fire || []).filter((d) => d.year >= 2010);
  const ndvi = data.ndvi || [];
  const rain = data.rainfall || [];
  const totalLoss = defor.reduce((s, d) => s + (d.loss_ha || 0), 0);
  const totalFire = fire.reduce((s, d) => s + (d.burn_ha || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Box icon={TreePine} title="Deforestation by Year" subtitle="UMD / Hansen Global Forest Change" color="#ef4444"
          footer={`${totalLoss.toFixed(1)} ha of tree-cover loss recorded since 2010. Used to establish the baseline scenario and additionality for REDD+ crediting.`}>
          <ResponsiveContainer>
            <BarChart data={defor} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" {...ax} /><YAxis {...ax} />
              <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} ha`, 'Loss']} />
              <Bar dataKey="loss_ha" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box icon={Flame} title="Fire History by Year" subtitle="MODIS MCD64A1 burned area" color="#f97316"
          footer={`${totalFire.toFixed(1)} ha burned since 2010. Fire history informs permanence and reversal risk for the project.`}>
          <ResponsiveContainer>
            <BarChart data={fire} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" {...ax} /><YAxis {...ax} />
              <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} ha`, 'Burned']} />
              <Bar dataKey="burn_ha" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box icon={Sprout} title="Vegetation Greenness (NDVI)" subtitle="Sentinel-2 · yearly mean NDVI" color="#22c55e"
          footer="Year-over-year NDVI trend indicates vegetation recovery or degradation across the project boundary.">
          <ResponsiveContainer>
            <LineChart data={ndvi} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" {...ax} /><YAxis domain={[0, 1]} {...ax} />
              <Tooltip contentStyle={tip} formatter={(v) => [v, 'NDVI']} />
              <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box icon={CloudRain} title="Annual Rainfall" subtitle="CHIRPS · total precipitation (mm/yr)" color="#3b82f6"
          footer="Annual precipitation provides climate context for growth potential and drought risk.">
          <ResponsiveContainer>
            <BarChart data={rain} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" {...ax} /><YAxis {...ax} />
              <Tooltip contentStyle={tip} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} mm`, 'Rainfall']} />
              <Bar dataKey="mm" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>
    </div>
  );
}
