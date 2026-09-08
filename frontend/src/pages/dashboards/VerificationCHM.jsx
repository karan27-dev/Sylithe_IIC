import React, { useState, useEffect } from "react";
import ChmSidebar from "../../components/chm/ChmSidebar";
import ChmMap from "../../components/chm/ChmMap";

export default function CHMReportPage({ projectData, geojsonData, activeAoiIndex, onAoiChange, onReturn, savedProjects, onProjectSelect }) {
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [year, setYear] = useState(2023);
  const [activeLayers, setActiveLayers] = useState(new Set());
  
  const activeSection = "chm";

  const displayedGeojson = React.useMemo(() => {
    if (!geojsonData || activeAoiIndex === 'all') return geojsonData;
    if (geojsonData.type === 'FeatureCollection' && geojsonData.features) {
      return { ...geojsonData, features: [geojsonData.features[activeAoiIndex]] };
    }
    return geojsonData;
  }, [geojsonData, activeAoiIndex]);

  useEffect(() => {
    if (displayedGeojson) {
      setCurrentPolygon(displayedGeojson);
      setResult(null);
      setActiveLayers(new Set());
    } else if (projectData?.aoi || projectData?.kmlData) {
      setCurrentPolygon(projectData.aoi || projectData.kmlData);
      setResult(null);
      setActiveLayers(new Set());
    }
  }, [displayedGeojson, projectData]);

  // Automatic execution removed, wait for user to select an AOI and click run

  useEffect(() => {
    if (result?.status === "success" && result.results?.model_prediction?.distribution) {
      const keys = Object.keys(result.results.model_prediction.distribution);
      setActiveLayers(new Set(keys));
    }
  }, [result]);

  const handlePolygonComplete = (geojson) => {
    setCurrentPolygon(geojson);
    setResult(null); 
  };

  const handleLayerToggle = (id) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRunAnalysis = async (selectedYear, polygon = currentPolygon) => {
    if (!polygon) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chm/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geojson: polygon,
          year: selectedYear
        }),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.status === "error") {
        throw new Error(responseData.message || "GEE Engine Error");
      }

      setResult(responseData);

    } catch (err) {
      console.error("❌ Analysis Error:", err.message);
      setResult({ status: "error", message: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndNext = () => {
    if (result?.status === "success") {
      alert("Saving CHM Data... Moving to next step.");
    }
  };

  const [detectedTrees, setDetectedTrees] = useState(null);
  const [showTreeCount, setShowTreeCount] = useState(false);

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
        detectedTrees={detectedTrees}
        showTreeCount={showTreeCount}
        onToggleTreeCount={() => setShowTreeCount(!showTreeCount)}
        savedProjects={savedProjects}
        onProjectSelect={onProjectSelect}
      />

      <div className="relative flex-1 h-full">
        <ChmMap
          onPolygonComplete={handlePolygonComplete}
          result={result}
          activeLayers={activeLayers}
          currentPolygon={currentPolygon}
          onTreesDetected={setDetectedTrees}
          showTreeCount={showTreeCount}
        />

        {isAnalyzing && (
          <div className="absolute inset-0 z-[1000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-[#a4fca1] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#a4fca1] font-black uppercase tracking-[0.2em] animate-pulse text-sm">
              Processing Canopy Height Intelligence
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
