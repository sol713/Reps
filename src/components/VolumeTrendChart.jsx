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
  volume: { label: "容量", color: "#0A84FF", unit: "kg" },
  sets: { label: "组数", color: "#30D158", unit: "组" },
  reps: { label: "次数", color: "#AF52DE", unit: "次" }
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
        <div className="rounded-lg bg-bg-tertiary px-3 py-2 shadow-lg">
          <p className="text-xs text-text-secondary">{formatXAxis(payload[0].payload.date)}</p>
          <p className="text-sm font-bold text-text-primary">
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
        <h3 className="font-semibold text-text-primary">训练趋势</h3>
        <div className="flex gap-2">
          <button
            className={`chip text-xs ${period === "week" ? "chip-selected" : ""}`}
            onClick={() => onPeriodChange("week")}
            type="button"
          >
            周
          </button>
          <button
            className={`chip text-xs ${period === "month" ? "chip-selected" : ""}`}
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
            className={`chip text-xs ${metric === key ? "chip-selected" : ""}`}
            onClick={() => onMetricChange(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer height={200} width="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="date"
            dy={10}
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            tickFormatter={formatXAxis}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
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
