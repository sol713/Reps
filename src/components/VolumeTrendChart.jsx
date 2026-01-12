import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const METRICS = {
  volume: { label: "容量", color: "#10B981", unit: "kg" },
  sets: { label: "组数", color: "#3B82F6", unit: "组" },
  reps: { label: "次数", color: "#A855F7", unit: "次" }
};

export default function VolumeTrendChart({ data, period, metric, onPeriodChange, onMetricChange }) {
  const currentMetric = METRICS[metric];

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-xl">
          <p className="text-xs text-gray-400">{formatXAxis(payload[0].payload.date)}</p>
          <p className="text-sm font-bold text-emerald-400">
            {payload[0].value} {currentMetric.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-app-text">训练趋势</h3>
        <div className="flex gap-2">
          <button
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              period === "week"
                ? "bg-app-primary text-white"
                : "border border-app-divider bg-white text-app-muted hover:bg-gray-50"
            }`}
            onClick={() => onPeriodChange("week")}
            type="button"
          >
            周
          </button>
          <button
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              period === "month"
                ? "bg-app-primary text-white"
                : "border border-app-divider bg-white text-app-muted hover:bg-gray-50"
            }`}
            onClick={() => onPeriodChange("month")}
            type="button"
          >
            月
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {Object.entries(METRICS).map(([key, { label }]) => (
          <button
            key={key}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              metric === key
                ? "bg-app-primary text-white"
                : "border border-app-divider bg-white text-app-muted hover:bg-gray-50"
            }`}
            onClick={() => onMetricChange(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer height={200} width="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="date"
            dy={10}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickFormatter={formatXAxis}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            activeDot={{ r: 6, stroke: currentMetric.color, strokeWidth: 2 }}
            dataKey="value"
            dot={{ r: 4, fill: currentMetric.color, strokeWidth: 0 }}
            stroke={currentMetric.color}
            strokeWidth={3}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
