import React, { useState, useEffect } from "react";
import ChmSidebar from "../../components/chm/ChmSidebar";
import ChmMap from "../../components/chm/ChmMap";
import { getFeatureUsage, consumeFeature } from "../../services/freeScanApi";

export default function LandEligibilityPage({ projectData, geojsonData, activeAoiIndex, onAoiChange, onReturn, onResult, onNextSteps, onSaveNext, savedProjects, onProjectSelect, onExportReport, reportRemaining, reportUnlimited, reportBusy, onGetFullAccess, onToggleNav, navCollapsed }) {
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [year, setYear] = useState(2023);
  const [activeLayers, setActiveLayers] = useState(new Set());

  // Land Eligibility focuses exclusively on LULC
  const activeSection = "lulc";

  // ── Free-tier lifetime quotas (3/3 per action) ──
  // Cached in sessionStorage so the counts stay stable across tab/section
  // navigation for the whole session (cleared on logout / session timeout).
  const [usage, setUsage] = useState(() => { try { return JSON.parse(sessionStorage.getItem('syl_usage')) || null; } catch { return null; } });
  useEffect(() => { getFeatureUsage().then((u) => { if (u) setUsage(u); }); }, []);
  useEffect(() => { if (usage) { try { sessionStorage.setItem('syl_usage', JSON.stringify(usage)); } catch { /* */ } } }, [usage]);
  const remainOf = (a) => (usage?.unlimited ? 9999 : (usage?.usage?.[a]?.remaining ?? 3));
  const applyConsume = (a, r) => setUsage((u) => {
    const base = u || { unlimited: false, usage: {} };
    return { ...base, usage: { ...base.usage, [a]: { used: r.used, remaining: r.remaining } } };
  });
  const quotaExhausted = !!usage && !usage.unlimited &&
    remainOf('land_assess') <= 0 && remainOf('land_history') <= 0 && remainOf('aoi_import') <= 0;

  // ── Land History tab (open-data deep-dive) ──
  const [landTab, setLandTab] = useState('eligibility');
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const fetchHistory = React.useCallback(async (polygon) => {
    if (!polygon) return;
    setHistoryLoading(true);
    setHistoryError('');
    const gate = await consumeFeature('land_history');
    if (gate.limitReached) {
      applyConsume('land_history', { used: gate.used, remaining: 0 });
      setHistoryError('You have used all 3 free Land History lookups. Request Full dMRV access to continue.');
      setHistoryLoading(false);
      return;
    }
    if (gate.used != null) applyConsume('land_history', gate);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/chm/land-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson: polygon }),
      });
      const d = await resp.json();
      if (!resp.ok || d.status === 'error') throw new Error(d.message || 'Failed to load land history');
      setHistoryData(d.history);
    } catch (err) {
      setHistoryError(err.message || 'Failed to load land history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Load history the first time the History tab is opened for the current plot.
  useEffect(() => {
    if (landTab === 'history' && currentPolygon && !historyData && !historyLoading && !historyError) {
      fetchHistory(currentPolygon);
    }
  }, [landTab, currentPolygon, historyData, historyLoading, historyError, fetchHistory]);

  // Reset cached history when the plot changes.
  useEffect(() => { setHistoryData(null); setHistoryError(''); }, [geojsonData, activeAoiIndex]);

  // Compute the current polygon based on the selected AOI index
  const displayedGeojson = React.useMemo(() => {
    if (!geojsonData || activeAoiIndex === 'all') return geojsonData;
    if (geojsonData.type === 'FeatureCollection' && geojsonData.features) {
      return { ...geojsonData, features: [geojsonData.features[activeAoiIndex]] };
    }
    return geojsonData;
  }, [geojsonData, activeAoiIndex]);

  useEffect(() => {
    let poly = null;
    if (displayedGeojson) poly = displayedGeojson;
    else if (projectData?.aoi || projectData?.kmlData) poly = projectData.aoi || projectData.kmlData;

    if (poly) {
      setCurrentPolygon(poly);
      setResult(null);
      setActiveLayers(new Set());
    }
  }, [displayedGeojson, projectData]);

  // Automatic execution removed, wait for user to select an AOI and click run

  useEffect(() => {
    if (result?.status === "success") {
      setActiveLayers(new Set(["cropland", "grass", "bare"]));
    }
  }, [result]);

  const handlePolygonComplete = (geojson) => {
    setCurrentPolygon(geojson);
    setResult(null);
    handleRunAnalysis(year, geojson);
  };

  const handleLayerToggle = (id) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRunAnalysis = async (selectedYear, polygon = currentPolygon, _attempt = 0) => {
    if (!polygon) return;
    // Lifetime quota gate — only on the first attempt (retries don't re-consume).
    if (_attempt === 0) {
      const gate = await consumeFeature('land_assess');
      if (gate.limitReached) {
        applyConsume('land_assess', { used: gate.used, remaining: 0 });
        setResult({ status: 'error', message: 'You have used all 3 free land assessments. Request Full dMRV access to continue.' });
        return;
      }
      if (gate.used != null) applyConsume('land_assess', gate);
    }
    setIsAnalyzing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chm/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geojson: polygon, year: selectedYear }),
      });

      const responseData = await response.json();

      // GEE still warming up — auto-retry once after 5 s
      if (response.status === 503 && _attempt === 0) {
        setResult({ status: "error", message: "Analysis engine is warming up… retrying in 5 seconds." });
        setTimeout(() => handleRunAnalysis(selectedYear, polygon, 1), 5000);
        return;
      }

      if (!response.ok || responseData.status === "error") {
        throw new Error(responseData.message || "GEE Engine Error");
      }

      setResult(responseData);
      onResult?.(responseData, polygon);

    } catch (err) {
      // Network failure ("Failed to fetch") usually means the server is
      // cold-starting (Render free tier sleeps after inactivity). Retry a few
      // times with backoff before surfacing an error.
      const isNetwork = err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(err.message || '');
      if (isNetwork && _attempt < 3) {
        setResult({ status: "error", message: "Waking up the analysis server… retrying." });
        setTimeout(() => handleRunAnalysis(selectedYear, polygon, _attempt + 1), 6000);
        return;
      }
      console.error("❌ Analysis Error:", err.message);
      setResult({ status: "error", message: isNetwork ? "Could not reach the analysis server. It may be starting up — please try again in a minute." : err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndNext = () => {
    // Prefer the parent-provided handler (e.g. open the LULC Snapshot in the
    // sidebar). Only acts once a successful analysis exists.
    if (result?.status === "success") {
      if (onSaveNext) onSaveNext(result);
      else alert("Saving LULC Data... Moving to next step.");
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#0a0c0a] relative">
      <ChmSidebar
        activeSection={activeSection}
        hasPolygon={!!currentPolygon}
        isAnalyzing={isAnalyzing}
        result={result}
        year={year}
        setYear={setYear}
        onRunAnalysis={(y) => handleRunAnalysis(y, currentPolygon)}
        activeLayers={activeLayers}
        onLayerToggle={handleLayerToggle}
        onSaveNext={handleSaveAndNext}
        geojsonData={geojsonData}
        activeAoiIndex={activeAoiIndex}
        onAoiChange={onAoiChange}
        onReturn={onReturn}
        onToggleNav={onToggleNav}
        navCollapsed={navCollapsed}
        onNextSteps={onNextSteps}
        savedProjects={savedProjects}
        onProjectSelect={onProjectSelect}
        landTab={landTab}
        onLandTabChange={setLandTab}
        historyData={historyData}
        historyLoading={historyLoading}
        historyError={historyError}
        onHistoryRetry={() => fetchHistory(currentPolygon)}
        onExportReport={onExportReport ? () => onExportReport(result) : undefined}
        reportRemaining={reportRemaining}
        reportUnlimited={reportUnlimited}
        reportBusy={reportBusy}
        onGetFullAccess={onGetFullAccess}
        assessRemaining={remainOf('land_assess')}
        historyRemaining={remainOf('land_history')}
        quotaUnlimited={!!usage?.unlimited}
        quotaExhausted={quotaExhausted}
      />

      <div className="relative flex-1 h-full">
        <ChmMap
          onPolygonComplete={handlePolygonComplete}
          result={result}
          activeLayers={activeLayers}
          currentPolygon={currentPolygon}
        />
        {isAnalyzing && (
          <div className="absolute inset-0 z-[1000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-[#a4fca1] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#a4fca1] font-black uppercase tracking-[0.2em] animate-pulse text-sm">
              Processing Sylithe Intelligence
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
