import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const data = [
{ year: '2015', clbj: 42.8, ukfs: 29.9, madMoist: 27.1, madDry: 20.6, gabonWet: 20.0, madWet: 19.4 },
{ year: '2016', clbj: 30.4, ukfs: 25.3, madMoist: 22.5, madDry: 16.9, gabonWet: 15.5, madWet: 14.6 },
{ year: '2017', clbj: 39.9, ukfs: 29.9, madMoist: 26.9, madDry: 20.4, gabonWet: 19.4, madWet: 18.5 },
{ year: '2018', clbj: 38.0, ukfs: 30.3, madMoist: 27.2, madDry: 20.6, gabonWet: 19.1, madWet: 18.2 },
{ year: '2019', clbj: 20.7, ukfs: 20.8, madMoist: 18.2, madDry: 13.5, gabonWet: 11.6, madWet: 10.8 },
{ year: '2020', clbj: 23.0, ukfs: 22.1, madMoist: 19.5, madDry: 14.5, gabonWet: 12.7, madWet: 11.8 },
{ year: '2021', clbj: 29.2, ukfs: 25.7, madMoist: 22.8, madDry: 17.1, gabonWet: 15.4, madWet: 14.4 },
{ year: '2022', clbj: 39.2, ukfs: 31.2, madMoist: 28.0, madDry: 21.2, gabonWet: 19.7, madWet: 18.8 },
{ year: '2023', clbj: 28.6, ukfs: 25.6, madMoist: 22.7, madDry: 17.0, gabonWet: 15.2, madWet: 14.2 },
{ year: '2024', clbj: 15.5, ukfs: 17.8, madMoist: 15.5, madDry: 11.4, gabonWet: 9.3, madWet: 8.6 }];


export const AgbReportWidget = () => {
  return (
    <div className="bg-[#0f291e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-7 w-full max-w-[540px] shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(132,204,22,0.15)] mx-auto relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#16a34a] blur-[100px] opacity-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-white text-xl font-bold font-sans tracking-tight">Aboveground Biomass (AGB)</h3>
                    <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mt-1">Multi-Region • Mg / Ha</p>
                </div>
                <div className="bg-[#16a34a]/10 text-[#16a34a] p-2.5 rounded-xl border border-[#16a34a]/20">
                    <Activity size={22} className="stroke-[2.5]" />
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-[250px] w-full text-xs relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
              dataKey="year"
              stroke="#ffffff40"
              tick={{ fill: '#ffffff80', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={10} />
            
                        <YAxis
              stroke="#ffffff40"
              tick={{ fill: '#ffffff80', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 50]}
              tickCount={6} />
            
                        <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 28, 20, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(132, 204, 22, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                color: '#fff'
              }}
              itemStyle={{ fontSize: '13px', paddingTop: '4px' }}
              labelStyle={{ color: '#16a34a', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '4px' }} />
            

                        <Line type="monotone" dataKey="clbj" name="CLBJ (Cushman)" stroke="#c084fc" strokeWidth={2.5} dot={{ r: 3, fill: '#0f291e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#c084fc', stroke: '#fff' }} />
                        <Line type="monotone" dataKey="ukfs" name="UKFS (Cushman)" stroke="#92400e" strokeWidth={2.5} dot={{ r: 3, fill: '#0f291e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#92400e', stroke: '#fff' }} />
                        <Line type="monotone" dataKey="madMoist" name="Madagascar Moist" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3, fill: '#0f291e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff' }} />
                        <Line type="monotone" dataKey="madDry" name="Madagascar Dry" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: '#0f291e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#34d399', stroke: '#fff' }} />
                        <Line type="monotone" dataKey="madWet" name="Madagascar Wet" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3, fill: '#0f291e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff' }} />
                        <Line type="monotone" dataKey="gabonWet" name="Gabon Wet" stroke="#f87171" strokeWidth={2.5} dot={{ r: 3, fill: '#0f291e', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f87171', stroke: '#fff' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend / Details box */}
            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-2 text-[11px] text-gray-400 font-medium relative z-10 w-full">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_rgba(192,132,252,0.5)]"></span> cushman_CLBJ</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#92400e] shadow-[0_0_8px_rgba(146,64,14,0.5)]"></span> cushman_UKFS</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span> asner_mada_moist</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> asner_mada_dry</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.5)]"></span> asner_mada_wet</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]"></span> rodda_gabon_wet</div>
            </div>
        </div>);

};