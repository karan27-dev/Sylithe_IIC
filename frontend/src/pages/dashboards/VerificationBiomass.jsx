import React from 'react';
import { HiDownload } from 'react-icons/hi';
import { TbLeaf } from 'react-icons/tb';

export default function BiomassEstimationPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF9] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A]">Above Ground Biomass (AGB)</h1>
          <p className="text-[14px] text-gray-500 mt-1">Carbon inventory estimation using allometric scaling</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
          <HiDownload size={16} /> Export AGB Raster
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mean Biomass Density</p>
          <p className="text-3xl font-bold text-[#0F172A]">245 <span className="text-lg text-gray-500">t/ha</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Estimated Carbon</p>
          <p className="text-3xl font-bold text-[#0F172A]">1.2M <span className="text-lg text-gray-500">tCO₂e</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Model Confidence</p>
          <p className="text-3xl font-bold text-emerald-600">89%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-[#0F172A]">Biomass Density Map</h3></div>
        <div className="h-[400px] bg-slate-100 flex items-center justify-center flex-col">
          <TbLeaf size={48} className="text-emerald-400 mb-4" />
          <p className="text-slate-500 font-medium tracking-wide">AGB Rendering Area</p>
          <div className="w-64 h-3 bg-gradient-to-r from-yellow-200 via-green-500 to-green-900 rounded-full mt-6" />
          <div className="flex justify-between w-64 mt-1">
            <span className="text-xs text-slate-400">0 t/ha</span>
            <span className="text-xs text-slate-400">400+ t/ha</span>
          </div>
        </div>
      </div>
    </div>
  );
}
