import React, { useState, useEffect } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi';
import { GeeAnalyticsPanel } from '../../components/chm/GeeAnalytics';

/* ═══════════════════════════════════════════════════════════
   REPORTS DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function ReportsDashboard({ projectData }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedFY, setSelectedFY] = useState('2026');

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'growth', label: 'Growth' },
    { id: 'baseline', label: 'Baseline' },
    { id: 'leakage', label: 'Leakage' },
    { id: 'risk', label: 'Risk' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF9]">
      
      {/* ─── Header (Carbon Direct FY View) ─── */}
      <div className="bg-white border-b border-gray-200 pt-6 px-8">
        
        {/* Title & Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <h1 className="text-[20px] md:text-[24px] font-bold text-[#0F172A]">Operations Emissions FY {selectedFY}</h1>
          <select 
            value={selectedFY} 
            onChange={(e) => setSelectedFY(e.target.value)} 
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-bold text-gray-700 hover:bg-gray-100 cursor-pointer outline-none"
          >
            <option value="2026">FY 2026</option>
            <option value="2025">FY 2025</option>
            <option value="2024">FY 2024</option>
          </select>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md uppercase tracking-wide">In Progress</span>
        </div>

        {/* Project Context Row */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[12px] font-bold rounded-md border border-gray-200">
            {projectData?.creditingStandard || 'VCS'}
          </span>
          <span className="text-[14px] text-gray-800 font-medium flex items-center gap-2">
            <span className="text-xl">🇬🇭</span> {projectData?.country || 'Volta, Ghana'}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-[14px] text-gray-500 font-medium">{projectData?.type || 'ARR'}</span>
          <span className="text-gray-300">|</span>
          <span className="text-[14px] text-gray-500 font-medium">CCP eligible: {projectData?.ccpEligible || 'Yes'}</span>
          <span className="text-gray-300">|</span>
          <span className="text-[14px] text-gray-500 font-medium">Project length: {projectData?.projectLength || '40'} years</span>
        </div>

        <h2 className="text-[24px] md:text-[32px] font-bold text-[#0F172A] mb-8">Sample: {projectData?.name || 'Ghanian Regeneration'}</h2>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 md:gap-8 border-b-2 border-transparent -mb-[2px] overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-[14px] font-bold transition-all relative
                ${activeTab === tab.id ? 'text-[#0F172A]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#16a34a] rounded-t-full" />
              )}
            </button>
          ))}
          
          <div className="flex-1" />
          
          <button className="pb-4 text-[13px] text-gray-400 font-medium hover:text-gray-600 flex items-center gap-1.5 opacity-60">
            Credit Projection <HiOutlineInformationCircle size={16} />
          </button>
          <button className="pb-4 text-[13px] text-gray-400 font-medium hover:text-gray-600 flex items-center gap-1.5 ml-4 opacity-60">
            Monitoring <HiOutlineInformationCircle size={16} />
          </button>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="p-8">
        
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 3 Column Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-[#BBF7D0]">
                <div className="flex items-center gap-2 mb-4">
                  <HiCheckCircle className="text-[#16a34a]" size={22} />
                  <span className="font-bold text-[#0F172A] text-[16px]">Strengths</span>
                </div>
                <ul className="space-y-3 text-[14px] text-gray-700 leading-relaxed">
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                    The regional change in canopy height during the pre-project period is very low - less than +0.5m - indicating low potential baseline deduction and high additionality.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                    The project is expected to have very low potential leakage liability, less than 1% of total project removals.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                    89.6% of expected leakage is likely to be mitigated within 5 years.
                  </li>
                </ul>
              </div>

              <div className="bg-[#FFFBEB] rounded-2xl p-6 border border-[#FDE68A]">
                <div className="flex items-center gap-2 mb-4">
                  <HiExclamationCircle className="text-[#d97706]" size={22} />
                  <span className="font-bold text-[#0F172A] text-[16px]">Concerns</span>
                </div>
                <ul className="space-y-3 text-[14px] text-gray-700 leading-relaxed">
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
                    The project's growth projection is more than 20% above empirical benchmarks from canopy height models in 6 out of 8 timesteps assessed.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
                    The project has high fire risk relative to other areas of the tropics - in the 79th percentile - and fire risk increases under all climate scenarios.
                  </li>
                </ul>
              </div>

              <div className="bg-[#F0F9FF] rounded-2xl p-6 border border-[#BAE6FD]">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineInformationCircle className="text-[#0284c7]" size={22} />
                  <span className="font-bold text-[#0F172A] text-[16px]">Potential mitigations</span>
                </div>
                <ul className="space-y-3 text-[14px] text-gray-700 leading-relaxed">
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0" />
                    Scenario plan for lower growth potential, especially for issuances expected in years 15-20.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0" />
                    Strong fire prevention and response plan.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0" />
                    Robust drought plan especially for early planting years. Plans to water saplings to ensure low mortality rates.
                  </li>
                </ul>
              </div>
            </div>

            {/* Satellite Analytics */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-8 pb-4">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Earth Engine Satellite Analytics</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Real-time statistics derived from Sentinel-2 & ERA5 data.</p>
                </div>
              </div>
              
              <div className="p-8">
                <GeeAnalyticsPanel selectedFY={selectedFY} />
              </div>
            </div>
          </div>
        )}

        {/* GROWTH TAB (Placeholder for visual completeness) */}
        {activeTab === 'growth' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">↑</div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">Growth Modeling</h3>
            <p className="text-gray-500 max-w-sm">Detailed tree growth and carbon yield curves will be generated post-field inventory.</p>
          </div>
        )}

      </div>
    </div>
  );
}
