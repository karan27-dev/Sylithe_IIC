import React, { useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Eye, EyeOff, Ruler, Info, Download, Loader2 } from "lucide-react";
import LandHistoryPanel from "./LandHistoryPanel";
import GeneratingStatus, { useGeneratingStep } from "./ReportGeneratingOverlay";

// Inline "Request" button → files a Full dMRV access request to the admin panel.
const RequestAccessButton = () => {
  const [state, setState] = useState('idle');
  const submit = async () => {
    if (state !== 'idle') return;
    setState('sending');
    try {
      const token = localStorage.getItem('sylithe_token');
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'Full dMRV Access' }),
      });
      setState(resp.ok ? 'done' : 'idle');
    } catch { setState('idle'); }
  };
  return (
    <button
      onClick={submit}
      disabled={state !== 'idle'}
      className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.08em] border transition-all
        ${state === 'done'
          ? 'border-[#a4fca1]/40 text-[#a4fca1] cursor-default'
          : 'border-[#a4fca1]/50 text-[#a4fca1] hover:bg-[#a4fca1] hover:text-[#0d0f0d]'}`}>
      {state === 'done' ? 'Requested ✓' : state === 'sending' ? 'Sending…' : 'Request'}
    </button>
  );
};

// The new hollow-pill style row (used for sub-items)
const ClassificationRow = ({ title, area, color, onToggle, isActive }) => {
  const isHex = color?.startsWith('#');

  return (
    <div className="flex items-center justify-between py-2 pl-4 hover:bg-[#F1F1F1]/[0.05] transition-all group cursor-pointer rounded-r-lg mr-2" onClick={onToggle}>
      <div className="flex items-center gap-3">
        {/* Hollow Pill inside */}
        <div className="flex items-center justify-center w-3 h-[18px]">
          <div
            className={`w-[6px] h-[14px] rounded-full border-[1.5px] ${isHex ? '' : color}`}
            style={isHex ? { borderColor: color } : {}}
          />
        </div>
        <span className="text-[13px] text-gray-200 group-hover:text-white font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-3 pr-2">
        <span className="text-[12px] text-gray-300 font-mono tracking-tight">
          {area || 0}{String(area).includes('px') ? '' : ' ha'}
        </span>
        <button className={`p-1 rounded transition-all ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
          {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
    </div>
  );
};

export default function ChmSidebar({
  result,
  activeSection = 'lulc',
  activeLayers = new Set(),
  onLayerToggle,
  onRunAnalysis,
  isAnalyzing,
  hasPolygon,
  onSaveNext,
  geojsonData,
  activeAoiIndex,
  onAoiChange,
  onReturn,
  year,
  setYear,
  detectedTrees,
  showTreeCount,
  onToggleTreeCount,
  onNextSteps,
  savedProjects = [],
  onProjectSelect,
  landTab = 'eligibility',
  onLandTabChange,
  historyData,
  historyLoading,
  historyError,
  onHistoryRetry,
  onExportReport,
  reportRemaining,
  reportUnlimited,
  reportBusy,
  onGetFullAccess,
  onToggleNav,
  navCollapsed,
  assessRemaining,
  historyRemaining,
  quotaUnlimited = false,
  quotaExhausted = false,
}) {
  const data = result?.status === "success" ? result.results : null;
  const isHistory = activeSection === 'lulc' && landTab === 'history';
  const [open, setOpen] = useState({ eligible: true, ineligible: true, eligibleClass: true, ineligibleClass: true, treeData: true });

  const formatHa = (val) => val ? val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0;

  return (
    <div className={`${isHistory ? 'w-[860px] max-w-[80vw]' : 'w-[450px]'} h-screen bg-[#2c3327]/80 backdrop-blur-[24px] text-white flex flex-col font-sans border-r border-white/5 shadow-2xl relative z-50 transition-[width] duration-300`}>

      {/* Header Area */}
      <div className="px-6 pt-10 pb-2 shrink-0">
        <div className="flex flex-col mb-4">
          <button
            onClick={() => (onToggleNav ? onToggleNav() : onReturn?.())}
            title={navCollapsed ? 'Show menu' : 'Hide menu'}
            className="flex items-center justify-center w-9 h-9 -ml-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors mb-5 self-start">
            {navCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-[26px] font-bold tracking-tight text-white">
              {activeSection === 'chm' ? 'Tree height' : 'Assess land'}
            </h1>
            {activeSection !== 'chm' && !quotaUnlimited && assessRemaining != null && (
              <span className="shrink-0 mt-2 text-[12px] font-semibold text-gray-300 whitespace-nowrap">
                {Math.max(0, assessRemaining)} / 3 free assessments
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/20 items-center">
            {activeSection === 'chm' ? (
              <button className="pb-3 text-[14px] font-semibold text-white border-b-2 border-white whitespace-nowrap">
                Canopy Heights
              </button>
            ) : (
              <>
                <button
                  onClick={() => onLandTabChange?.('eligibility')}
                  className={`pb-3 text-[14px] font-semibold whitespace-nowrap border-b-2 transition-colors ${landTab === 'eligibility' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`}>
                  Land eligibility
                </button>
                <button
                  onClick={() => onLandTabChange?.('history')}
                  className={`pb-3 text-[14px] font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${landTab === 'history' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`}>
                  Land History
                </button>
              </>
            )}
          </div>

          {/* Project / AOI selectors */}
          <div className="flex flex-col gap-2 mt-4 max-w-[200px]">
            {savedProjects?.length > 0 && (
              <select
                className="bg-black/40 border border-white/20 text-white text-[11px] rounded-none px-2.5 py-1.5 outline-none font-sans font-medium w-full"
                onChange={(e) => { if (e.target.value && onProjectSelect) onProjectSelect(e.target.value); }}
                defaultValue=""
              >
                <option value="" disabled>Select a saved project...</option>
                {savedProjects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            )}
            {geojsonData?.features?.length > 1 && (
              <select
                className="bg-black/40 border border-white/20 text-white text-[11px] rounded-none px-2.5 py-1.5 outline-none font-sans font-medium w-full"
                value={activeAoiIndex}
                onChange={(e) => { const val = e.target.value; onAoiChange(val === 'all' ? 'all' : Number(val)); }}
              >
                <option value="all">All Features (Combined)</option>
                {geojsonData.features.map((f, i) => (
                  <option key={i} value={i}>Polygon {i + 1}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {isHistory && (
        <LandHistoryPanel data={historyData} loading={historyLoading} error={historyError} onRetry={onHistoryRetry} />
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 mt-2" style={isHistory ? { display: 'none' } : undefined}>
        {result?.status === "error" && (
          <div className="px-4 py-3 mx-4 mb-4 bg-red-500/20 border border-red-500/30 rounded text-red-100 text-[13px] leading-relaxed">
            <span className="font-bold">Analysis Failed:</span> {result.message}
          </div>
        )}

        {/* CHM VIEW LOGIC */}
        {activeSection === 'chm' && (
          <div className="px-4 space-y-6 mt-4">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Ruler size={18} className="text-[#a4fca1]" />
              <span className="text-[14px] font-bold uppercase tracking-tight">Canopy Heights</span>
            </div>

            {data?.model_prediction ? (
              <>
                <div className="grid grid-cols-2 gap-4 px-2 mb-8">
                  <div className="bg-black/20 p-5 rounded-xl border border-white/10 shadow-inner">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-black mb-2">Average Height</p>
                    <p className="text-3xl font-black text-[#a4fca1]">{data.model_prediction.avg}m</p>
                  </div>
                  <div className="bg-black/20 p-5 rounded-xl border border-white/10 shadow-inner">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-black mb-2">Max Height</p>
                    <p className="text-3xl font-black text-white">{data.model_prediction.max}m</p>
                  </div>
                </div>

                {/* Pixel Distribution List */}
                {data.model_prediction.distribution && (
                  <div className="space-y-1">
                    <div className="px-2 mb-3">
                      <span className="text-[12px] uppercase tracking-widest text-gray-400 font-bold">Predicted Pixel Distribution</span>
                    </div>
                    {Object.entries(data.model_prediction.distribution).map(([label, info]) => {
                      return (
                        <ClassificationRow
                          key={label}
                          title={label}
                          area={`${info.count} px`}
                          color={info.color}
                          isActive={activeLayers.has(label)}
                          onToggle={() => onLayerToggle(label)}
                        />
                      );
                    })}

                    {/* Tree Count Layer Toggle */}
                    {detectedTrees !== null && detectedTrees.length > 0 && (
                      <div className="mt-4 border-t border-white/10 pt-2">
                        <ClassificationRow
                          title="Tree Count Layer"
                          area={`${detectedTrees.length} trees`}
                          color="#a4fca1"
                          isActive={showTreeCount}
                          onToggle={onToggleTreeCount}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Tree List */}
                {detectedTrees !== null ? (
                  detectedTrees.length > 0 ? (
                    <div className="mt-6 px-2">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] uppercase tracking-widest text-gray-400 font-bold">Detected Trees</span>
                        <span className="text-[12px] font-bold text-[#a4fca1]">Total: {detectedTrees.length}</span>
                      </div>
                      <div className="max-h-[240px] overflow-y-auto scrollbar-hide space-y-1 border border-white/10 rounded-lg p-2 bg-black/20">
                        {detectedTrees.map((tree) => (
                          <div key={tree.id} className="flex items-center justify-between py-2 px-3 hover:bg-[#F1F1F1]/5 rounded transition-colors group">
                            <span className="text-[13px] text-gray-300 group-hover:text-white font-medium">Tree #{tree.id}</span>
                            <span className="text-[13px] font-mono font-bold text-[#a4fca1]">{tree.height}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 px-2 text-center text-[12px] text-gray-400 p-4 border border-white/10 rounded-lg bg-black/20">
                      No trees &ge; 2m detected in this area.
                    </div>
                  )
                ) : data?.model_prediction?.points ? (
                  <div className="mt-6 px-2 text-center text-[12px] text-gray-400 animate-pulse p-4 border border-white/10 rounded-lg bg-black/20">
                    Computing tree intelligence...
                  </div>
                ) : null}
              </>
            ) : (
              <div className="bg-[#F1F1F1]/[0.02] p-8 mx-2 rounded-xl border border-dashed border-white/10 text-center">
                <p className="text-gray-400 text-[13px] leading-relaxed">Run analysis on a forested area to see height data.</p>
              </div>
            )}
          </div>
        )}

        {/* LULC VIEW LOGIC */}
        {activeSection === 'lulc' && data && data.lulc && data.eligibility && (
          <div className="space-y-2 px-3">

            {/* Progress Bar Header */}
            <div className="mb-8 mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] tracking-wide text-white uppercase">Results</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-300 leading-snug">
                Land must be an eligible classification type to qualify for carbon crediting.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1 h-[14px] bg-[#F1F1F1] rounded-md overflow-hidden flex shadow-inner">
                  <div className="h-full bg-[#a4fca1] transition-all duration-700" style={{ width: `${data.eligibility.percentage}%` }} />
                </div>
                <span className="text-[14px] font-bold text-white shrink-0">{data.eligibility.percentage}% eligible</span>
              </div>
            </div>

            {/* 1. ELIGIBLE LAND */}
            <div>
              <button onClick={() => setOpen({ ...open, eligible: !open.eligible })} className="w-full flex items-center justify-between py-3 px-1 hover:bg-[#F1F1F1]/5 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  {open.eligible ? <ChevronDown size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
                  <div className="w-[7px] h-[18px] rounded-full bg-[#a4fca1]" />
                  <span className="text-[15px] font-semibold tracking-wide text-white">Eligible land</span>
                </div>
                <div className="flex items-center gap-3 pr-2">
                  <span className="text-[13px] text-gray-300 font-medium tracking-wide">
                    {formatHa(Math.min(
                      (data?.lulc?.cropland || 0) + (data?.lulc?.grass || 0) + (data?.lulc?.bare || 0),
                      data?.total_area_ha || Infinity
                    ))} ha
                  </span>
                  <EyeOff size={16} className="text-gray-400 opacity-80" />
                </div>
              </button>

              {open.eligible && (
                <div className="pl-6 border-l-[1.5px] border-white/[0.08] ml-[10px] pb-2">
                  <button onClick={() => setOpen({ ...open, eligibleClass: !open.eligibleClass })} className="w-full flex items-center justify-between py-2 pl-2 hover:bg-[#F1F1F1]/5 rounded transition-colors mt-1 group">
                    <div className="flex items-center gap-3">
                      {open.eligibleClass ? <ChevronDown size={14} className="text-gray-500 group-hover:text-white" /> : <ChevronRight size={14} className="text-gray-500 group-hover:text-white" />}
                      <span className="text-[13px] text-gray-200">Eligible land classification</span>
                    </div>
                    <div className="flex items-center gap-3 pr-4">
                      <EyeOff size={14} className="text-gray-500 opacity-50" />
                    </div>
                  </button>

                  {open.eligibleClass && (
                    <div className="pl-6 border-l-[1.5px] border-white/[0.08] ml-[11px] mt-1 space-y-1">
                      <ClassificationRow title="Cropland" area={formatHa(data?.lulc?.cropland)} color="border-[#E49635]" isActive={activeLayers.has('cropland')} onToggle={() => onLayerToggle('cropland')} />
                      {data?.model_prediction?.tree_chm_ha != null && (
                        <ClassificationRow
                          title="Tree"
                          area={formatHa(data.model_prediction.tree_chm_ha)}
                          color="#1a5c2a"
                          isActive={activeLayers.has('tree_chm')}
                          onToggle={() => onLayerToggle('tree_chm')}
                        />
                      )}
                      <ClassificationRow title="Range/grass/shrubland" area={formatHa(data?.lulc?.grass)} color="border-[#88B053]" isActive={activeLayers.has('grass')} onToggle={() => onLayerToggle('grass')} />
                      <ClassificationRow title="Bareland" area={formatHa(data?.lulc?.bare)} color="border-[#A59B8F]" isActive={activeLayers.has('bare')} onToggle={() => onLayerToggle('bare')} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. INELIGIBLE LAND */}
            <div className="mt-4">
              <button onClick={() => setOpen({ ...open, ineligible: !open.ineligible })} className="w-full flex items-center justify-between py-3 px-1 hover:bg-[#F1F1F1]/5 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  {open.ineligible ? <ChevronDown size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
                  <div className="w-[7px] h-[18px] rounded-full bg-[#F1F1F1]" />
                  <span className="text-[15px] font-semibold tracking-wide text-white">Ineligible land</span>
                </div>
                <div className="flex items-center gap-3 pr-2">
                  <span className="text-[13px] text-gray-300 font-medium tracking-wide">{formatHa((data?.lulc?.water || 0) + (data?.lulc?.mangroves || 0) + (data?.lulc?.urban || 0) + (data?.lulc?.trees || 0) + (data?.lulc?.ice_snow || 0) + (data?.lulc?.clouds || 0))} ha</span>
                  <EyeOff size={16} className="text-gray-400 opacity-80" />
                </div>
              </button>

              {open.ineligible && (
                <div className="pl-6 border-l-[1.5px] border-white/[0.08] ml-[10px] pb-4">
                  <button onClick={() => setOpen({ ...open, ineligibleClass: !open.ineligibleClass })} className="w-full flex items-center justify-between py-2 pl-2 hover:bg-[#F1F1F1]/5 rounded transition-colors mt-1 group">
                    <div className="flex items-center gap-3">
                      {open.ineligibleClass ? <ChevronDown size={14} className="text-gray-500 group-hover:text-white" /> : <ChevronRight size={14} className="text-gray-500 group-hover:text-white" />}
                      <span className="text-[13px] text-gray-200">Ineligible land classification</span>
                    </div>
                    <div className="flex items-center gap-3 pr-4">
                      <span className="text-[12px] text-gray-300 font-medium tracking-wide">{formatHa((data?.lulc?.water || 0) + (data?.lulc?.mangroves || 0) + (data?.lulc?.urban || 0) + (data?.lulc?.trees || 0) + (data?.lulc?.ice_snow || 0) + (data?.lulc?.clouds || 0))} ha</span>
                      <EyeOff size={14} className="text-gray-500 opacity-50" />
                    </div>
                  </button>

                  {open.ineligibleClass && (
                    <div className="pl-6 border-l-[1.5px] border-white/[0.08] ml-[11px] mt-1 space-y-1">
                      <ClassificationRow title="Forest land" area={formatHa(data?.lulc?.trees)} color="border-[#397D49]" isActive={activeLayers.has('trees')} onToggle={() => onLayerToggle('trees')} />
                      <ClassificationRow title="Water bodies" area={formatHa(data?.lulc?.water)} color="border-[#419BDF]" isActive={activeLayers.has('water')} onToggle={() => onLayerToggle('water')} />
                      <ClassificationRow title="Flooded vegetation" area={formatHa(data?.lulc?.mangroves)} color="border-[#7A87C6]" isActive={activeLayers.has('mangroves')} onToggle={() => onLayerToggle('mangroves')} />
                      <ClassificationRow title="Ice/snow" area={formatHa(data?.lulc?.ice_snow)} color="border-[#B39FE1]" isActive={activeLayers.has('ice_snow')} onToggle={() => onLayerToggle('ice_snow')} />
                      <ClassificationRow title="Urban/built-up land" area={formatHa(data?.lulc?.urban)} color="border-[#C4281B]" isActive={activeLayers.has('urban')} onToggle={() => onLayerToggle('urban')} />
                      <ClassificationRow title="Clouds" area={formatHa(data?.lulc?.clouds)} color="border-[#8b0000]" isActive={activeLayers.has('clouds')} onToggle={() => onLayerToggle('clouds')} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-8 space-y-3 z-10 w-full shrink-0">
        {!isHistory && (!data ? (
          (() => { const assessOut = !quotaUnlimited && assessRemaining != null && assessRemaining <= 0; return (
          <div className="space-y-1.5">
            <button
              onClick={() => (assessOut ? onGetFullAccess?.() : onRunAnalysis(year || 2023))}
              disabled={(!hasPolygon || isAnalyzing) && !assessOut}
              className="w-full bg-[#a4fca1] text-[#0d0f0d] font-bold py-3.5 rounded-full text-[13px] disabled:opacity-30 uppercase tracking-[0.1em] transition-all hover:bg-[#F1F1F1]"
            >
              {isAnalyzing ? "Processing Region..." : assessOut ? "Limit reached — Request access" : "RUN INITIAL BOUNDARY"}
            </button>
          </div>
          ); })()
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={onExportReport}
              disabled={reportBusy || (!reportUnlimited && reportRemaining === 0)}
              className={`w-full flex items-center justify-center gap-2 bg-[#a4fca1] text-[#0d0f0d] font-bold py-3.5 rounded-full text-[13px] ${reportBusy ? '' : 'uppercase tracking-[0.1em]'} hover:bg-[#F1F1F1] disabled:opacity-90 disabled:cursor-not-allowed transition-all shadow-lg`}
            >
              {reportBusy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {reportBusy ? <GeneratingStatus open /> : "EXPORT LULC REPORT"}
            </button>
            <p className="text-center text-[11px] font-semibold text-gray-300">
              {reportUnlimited
                ? <span className="text-[#a4fca1]">Unlimited exports</span>
                : `${reportRemaining ?? 3} out of 3 free exports`}
            </p>
          </div>
        ))}

        <style>{`@keyframes sylGlow{0%,100%{text-shadow:0 0 0 rgba(164,252,161,0);opacity:.75}50%{text-shadow:0 0 14px rgba(164,252,161,.9);opacity:1}}`}</style>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onGetFullAccess?.()}
            style={{ animation: 'sylGlow 2.8s ease-in-out infinite' }}
            className="text-[12px] text-[#a4fca1] underline decoration-[#a4fca1]/60 underline-offset-2 font-bold tracking-[0.15em] hover:text-white transition-colors">
            GET FULL dMRV
          </button>
          {quotaExhausted && <RequestAccessButton />}
        </div>
      </div>
    </div>
  );
}