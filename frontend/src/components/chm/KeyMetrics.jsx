import React from 'react';

// Define MetricCard here so it's available to KeyMetrics
const MetricCard = ({ label, value, gediValue }) => (
  <div className="bg-[#F1F1F1] p-4 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Model Prediction</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-green-600">{value?.toFixed(1) || "0.0"}</span>
          <span className="text-xs ml-0.5 text-green-600">m</span>
        </div>
        <p className="text-[11px] text-gray-500">{label}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-gray-400 uppercase">GEDI Actual</p>
        <p className="text-lg font-bold text-gray-700">{gediValue ? `${gediValue.toFixed(1)}m` : "N/A"}</p>
      </div>
    </div>
  </div>
);

export default function KeyMetrics({ result }) {
  if (!result) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* NDVI Section */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
        <p className="text-[10px] font-bold text-green-700 uppercase mb-2">Vegetation Health (NDVI)</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-[9px] text-green-600">Avg</p><p className="font-bold">{result.ndvi_avg?.toFixed(2)}</p></div>
          <div><p className="text-[9px] text-green-600">Min</p><p className="font-bold">{result.ndvi_min?.toFixed(2)}</p></div>
          <div><p className="text-[9px] text-green-600">Max</p><p className="font-bold">{result.ndvi_max?.toFixed(2)}</p></div>
        </div>
      </div>

      <MetricCard label="Avg Canopy Height" value={result.mean_height} gediValue={result.gedi_mean} />
      <MetricCard label="Max Canopy Height" value={result.max_height} gediValue={result.gedi_max} />
    </div>
  );
}