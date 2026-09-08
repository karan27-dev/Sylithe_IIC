import React from 'react';
import { HiDownload } from 'react-icons/hi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const mockBaselineData = [
  { year: '2015', project: 100, synthetic: 100 },
  { year: '2016', project: 99.5, synthetic: 99.1 },
  { year: '2017', project: 99.2, synthetic: 97.5 },
  { year: '2018', project: 98.8, synthetic: 95.2 },
  { year: '2019', project: 98.5, synthetic: 92.4 },
  { year: '2020', project: 98.1, synthetic: 89.1 },
  { year: '2021', project: 97.9, synthetic: 86.5 },
  { year: '2022', project: 97.6, synthetic: 83.2 },
  { year: '2023', project: 97.4, synthetic: 80.1 },
  { year: '2024', project: 97.2, synthetic: 77.5 },
];

export default function DynamicBaselinePage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF9] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A]">Dynamic Baseline</h1>
          <p className="text-[14px] text-gray-500 mt-1">Synthetic Control Area Comparison</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
          <HiDownload size={16} /> Export Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-[#0F172A]">Cumulative Deforestation (%)</h3></div>
        <div className="p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockBaselineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="project" name="Project Area Forest Cover" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="synthetic" name="Synthetic Baseline (Matched Control)" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-[#0F172A] mb-4">Matching Covariates</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex justify-between border-b border-gray-100 pb-2"><span>Elevation</span> <span className="font-semibold text-gray-800">450m ± 50m</span></li>
            <li className="flex justify-between border-b border-gray-100 pb-2"><span>Slope</span> <span className="font-semibold text-gray-800">12% ± 3%</span></li>
            <li className="flex justify-between border-b border-gray-100 pb-2"><span>Distance to roads</span> <span className="font-semibold text-gray-800">2.4km ± 0.5km</span></li>
            <li className="flex justify-between pb-2"><span>Forest Edge</span> <span className="font-semibold text-gray-800">High fragmentation</span></li>
          </ul>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center text-center">
          <p className="text-emerald-600 font-bold uppercase tracking-wider text-xs mb-2">Estimated Avoided Loss</p>
          <p className="text-4xl font-black text-[#0F172A]">19.7%</p>
          <p className="text-sm text-gray-500 mt-2">Relative difference since 2015</p>
        </div>
      </div>
    </div>
  );
}
