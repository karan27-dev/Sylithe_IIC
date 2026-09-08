import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
  } from "recharts";
  
  export default function TimeSeriesChart({ series }) {
    // Safety: no data yet
    if (!series || series.length === 0) {
      return (
        <div className="mt-4 text-sm text-gray-400">
          No time-series data available
        </div>
      );
    }
  
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Canopy Height Growth
        </h3>
  
        {/* IMPORTANT: explicit height */}
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="heightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
  
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                unit=" m"
              />
              <Tooltip
                formatter={(v) => [`${v.toFixed(2)} m`, "Height"]}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Area
                type="monotone"
                dataKey="height"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#heightFill)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
  