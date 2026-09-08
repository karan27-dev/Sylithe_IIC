import React from 'react';

const CanopyStructure3D = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="mt-6 p-4 bg-[#F1F1F1] rounded-xl border border-gray-100 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-widest">3D Canopy Profile (GEDI)</p>
      <div className="space-y-3">
        {data.map((layer, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-500">{layer.label}</span>
              <span className="font-bold text-gray-700">{layer.value.toFixed(1)}m</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-700" 
                style={{ width: `${(layer.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanopyStructure3D; // CRITICAL: This was missing