import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/** Carbon Direct UI Clones */

const CarbonBox = ({ title, subtitle, rightElement, children, footerText }) => (
  <div className="bg-white border border-gray-200 rounded-[8px] flex flex-col h-full shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
    <div className="flex justify-between items-start p-5 pb-4 border-b border-gray-100">
      <div>
        <h3 className="text-[18px] font-bold tracking-tight text-[#1f2937] leading-tight">{title}</h3>
        {subtitle && <p className="text-[14px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
    <div className="p-5 flex-1 relative">
      {children}
    </div>
    {footerText && (
      <div className="px-5 py-4 bg-white border-t border-gray-100 rounded-b-[8px]">
        <p className="text-[12px] leading-relaxed text-[#6b7280]">{footerText}</p>
      </div>
    )}
  </div>
);

const CarbonBarChart = ({ data, color, yUnit }) => (
  <div className="w-full h-[280px]">
    <div className="text-[13px] font-bold text-gray-500 mb-4">{yUnit}</div>
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
        <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
        <Bar dataKey="value" fill={color} isAnimationActive={true} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const CarbonProgressBarList = ({ data, valueUnit, totalColor = "#d8b4e2" }) => {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {data.map(item => (
        <div key={item.label} className="flex justify-between items-end gap-6">
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#1f2937] mb-2">{item.label}</p>
            <div className="w-full h-3.5 bg-gray-100 rounded-[2px] overflow-hidden">
              <div className="h-full transition-all duration-1000" style={{ width: `${Math.max(item.pct, 0.5)}%`, backgroundColor: item.color || '#d8b4e2' }} />
            </div>
          </div>
          <div className="text-right shrink-0 pb-1">
            <p className="text-[14px] font-bold tracking-tight text-[#1f2937] leading-none mb-1">
              {item.amount.toLocaleString()} <span className="text-[12px] font-normal text-gray-500">{valueUnit}</span>
            </p>
            <p className="text-[12px] text-gray-400 leading-none">{item.pct.toFixed(2)}%</p>
          </div>
        </div>
      ))}
      <div className="pt-5 border-t border-gray-100 flex justify-between items-center mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-[2px]" style={{ backgroundColor: totalColor }} />
          <span className="text-[13px] font-medium text-[#1f2937]">Pixels in <span className="font-normal text-gray-500">{valueUnit}</span></span>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-bold text-[#1f2937]">Total {total.toLocaleString()} <span className="font-normal text-gray-500 text-[12px]">{valueUnit}</span></p>
          <p className="text-[12px] text-gray-400">100.00% of analyzed boundary</p>
        </div>
      </div>
    </div>
  );
};

const CarbonDonutChart = ({ data }) => {
  return (
    <div className="flex justify-center items-center h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={140}
            paddingAngle={2}
            dataKey="amount"
            stroke="none"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            formatter={(value) => `${value.toLocaleString()}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const LoadingState = ({ text }) => (
  <div className="bg-white border border-gray-200 rounded-[8px] min-h-[400px] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
      <span className="text-gray-500 font-medium text-sm">{text}</span>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="bg-white border border-gray-200 rounded-[8px] p-8">
    <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start gap-4">
      <div className="p-2 bg-red-100 rounded-full shrink-0"><span className="text-red-600 font-bold text-lg">!</span></div>
      <div>
        <h4 className="font-bold text-red-900 text-lg mb-1">{error.error || "Analytics Error"}</h4>
        <p className="text-red-700 text-sm whitespace-pre-wrap">{error.message}</p>
      </div>
    </div>
  </div>
);

/** Main API Integration Components */

// In-memory cache to prevent re-computing GEE data when navigating between tabs
const geeCache = new Map();

const fetchGeeData = async (url, payload) => {
  const cacheKey = `${payload.metric}-${payload.year}-${JSON.stringify(payload.geojson)}`;
  if (geeCache.has(cacheKey)) {
    return geeCache.get(cacheKey);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();

  if (!json.error) {
    geeCache.set(cacheKey, json);
  }
  return json;
};

const NdviSection = ({ projectGeojson, initialYear }) => {
  const [year, setYear] = useState(initialYear || "2026");
  const [data, setData] = useState({ result: null, loading: true, error: null });
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setYear(initialYear);
  }, [initialYear]);

  useEffect(() => {
    let isCancelled = false;
    const fetchNdvi = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        const payloadGeojson = projectGeojson || { type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] };
        const payload = { geojson: payloadGeojson, metric: 'ndvi', year };

        const json = await fetchGeeData(`${API}/api/gee/analytics`, payload);
        if (isCancelled) return;

        if (json.error) {
          setData({ result: null, loading: false, error: json });
        } else {
          setData({ result: json, loading: false, error: null });
        }
      } catch (err) {
        if (!isCancelled) {
          setData({ result: null, loading: false, error: { title: "Network Error", message: "Failed to connect to stats API." } });
        }
      }
    };
    fetchNdvi();
    return () => { isCancelled = true; };
  }, [year, API, projectGeojson]);

  if (data.loading) return <LoadingState text={`Fetching ${year} 12-month NDVI vectors...`} />;
  if (data.error) return <ErrorState error={data.error} />;
  if (!data.result) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CarbonBox
        title="Vegetation Health (NDVI) trends"
        subtitle="Sentinel-2 Satellite"
        rightElement={
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-[4px] px-2 py-1.5 text-[13px] font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50 outline-none focus:border-[#16a34a]"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        }
        footerText={`This bar chart details the average NDVI trends across all 12 months in ${year} for your project boundary. Gathered from Sentinel-2.`}
      >
        <CarbonBarChart data={data.result.trend} color="#00a8e1" yUnit="NDVI" />
      </CarbonBox>

      <CarbonBox
        title="NDVI Pixel Distribution"
        subtitle={`Annual Average Profile (${year})`}
        footerText="This list details the precise fraction of project pixels falling into each health bucket over the selected operational year."
      >
        <CarbonProgressBarList data={data.result.distribution} valueUnit="px" totalColor="#0bd4e3" />
      </CarbonBox>
    </div>
  );
};

const TempSection = ({ projectGeojson, initialYear }) => {
  const [year, setYear] = useState(initialYear || "2026");
  const [data, setData] = useState({ result: null, loading: true, error: null });
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setYear(initialYear);
  }, [initialYear]);

  useEffect(() => {
    let isCancelled = false;
    const fetchTemp = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        const payloadGeojson = projectGeojson || { type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] };
        const payload = { geojson: payloadGeojson, metric: 'temperature', year };

        const json = await fetchGeeData(`${API}/api/gee/analytics`, payload);
        if (isCancelled) return;

        if (json.error) {
          setData({ result: null, loading: false, error: json });
        } else {
          setData({ result: json, loading: false, error: null });
        }
      } catch (err) {
        if (!isCancelled) setData({ result: null, loading: false, error: { title: "Error", message: "Failed API link." } });
      }
    };
    fetchTemp();
    return () => { isCancelled = true; };
  }, [year, API, projectGeojson]);

  if (data.loading) return <LoadingState text={`Fetching ${year} 12-month Thermal distributions...`} />;
  if (data.error) return <ErrorState error={data.error} />;
  if (!data.result) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CarbonBox
        title="Land Surface Temperature trends"
        subtitle="1km Average"
        rightElement={
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-[4px] px-2 py-1.5 text-[13px] font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50 outline-none focus:border-[#f59e0b]"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        }
        footerText={`This chart details daytime land surface temperature trends across all 12 months in ${year} for your boundary.`}
      >
        <CarbonBarChart data={data.result.trend} color="#f59e0b" yUnit="°C" />
      </CarbonBox>

      <CarbonBox
        title="Temperature Distribution"
        subtitle={`Annual Average Profile (${year})`}
        footerText="Categorical groupings of pixel temperatures representing localized micro-climates across your project area."
      >
        <CarbonProgressBarList data={data.result.distribution} valueUnit="px" totalColor="#fcd34d" />
      </CarbonBox>
    </div>
  );
};

export const GeeAnalyticsPanel = ({ selectedFY, projectGeojson }) => {
  return (
    <div className="space-y-8">
      <NdviSection projectGeojson={projectGeojson} initialYear={selectedFY} />
      <TempSection projectGeojson={projectGeojson} initialYear={selectedFY} />
    </div>
  );
};

export const GeeLandCoverPanel = ({ selectedFY, projectGeojson, onMapReady }) => {
  const [year, setYear] = useState(selectedFY || "2026");
  const [data, setData] = useState({ distribution: null, loading: true, error: null });
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setYear(selectedFY);
  }, [selectedFY]);

  useEffect(() => {
    let isCancelled = false;
    const fetchLandCover = async () => {
      try {
        setData({ distribution: null, loading: true, error: null });
        const payloadGeojson = projectGeojson || { type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] };
        const payload = { geojson: payloadGeojson, metric: 'landcover', year };

        const json = await fetchGeeData(`${API}/api/gee/analytics`, payload);
        if (isCancelled) return;

        if (json.error) {
          setData({ distribution: null, loading: false, error: json });
          return;
        }

        if (json.distribution) {
          setData({ distribution: json.distribution, loading: false, error: null });
          if (json.tile_url && onMapReady) {
            onMapReady(json.tile_url, 'lulc');
          }
        } else {
          setData({ distribution: null, loading: false, error: null });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to fetch land cover", err);
          setData({ distribution: null, loading: false, error: { message: "Failed to connect to backend." } });
        }
      }
    };
    fetchLandCover();
    return () => { isCancelled = true; };
  }, [year, API, projectGeojson]);

  if (data.loading) return <LoadingState text={`Classifying ${year} high-resolution Dynamic World arrays...`} />;
  if (data.error) return <ErrorState error={data.error} />;
  if (!data.distribution) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CarbonBox
        title="Land Cover details"
        subtitle="Sylithe World Cover(10m)"
        rightElement={
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-[4px] px-2 py-1.5 text-[13px] font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50 outline-none focus:border-[#4ade80]"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        }
        footerText={`This sunburst chart details global land cover classes covering your boundary during ${year}. The innermost ring represents total area tracked. Each sector translates to pixels categorized by the Sylithe LULC.`}
      >
        <CarbonDonutChart data={data.distribution} />
      </CarbonBox>

      <CarbonBox
        title="Land Cover by class"
        subtitle={`Sylithe World cover(${year})`}
        footerText="Prioritize strategic reforestation efforts with deep dives into spatial distributions. The bars represent total area classified, ranked from highest to lowest prevalence."
      >
        <CarbonProgressBarList data={data.distribution} valueUnit="px" totalColor="#e5e7eb" />
      </CarbonBox>
    </div>
  );
};
