import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const EXERCISE_COLORS = [
  "#8b5cf6", // Purple (primary)
  "#d946ef", // Pink
  "#6366f1", // Indigo
  "#10b981", // Emerald (success)
  "#f59e0b", // Amber (warning)
];

export default function PRProgressChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">暂无PR数据</p>
      </div>
    );
  }

  const exercises = [...new Set(data.map((d) => d.exerciseName))];
  
  const chartData = data.reduce((acc, curr) => {
    const existing = acc.find((item) => item.date === curr.date);
    if (existing) {
      existing[curr.exerciseName] = curr.weight;
    } else {
      acc.push({
        date: curr.date,
        [curr.exerciseName]: curr.weight
      });
    }
    return acc;
  }, []);

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-bg-tertiary px-3 py-2 shadow-lg border border-border-primary backdrop-blur-md">
          <p className="text-xs text-text-secondary">{formatXAxis(payload[0].payload.date)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}kg
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">PR进步</h3>
      <ResponsiveContainer height={250} width="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-primary)" }} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "var(--text-secondary)" }} />
          {exercises.map((exercise, index) => (
            <Line
              key={exercise}
              activeDot={{ r: 6 }}
              dataKey={exercise}
              dot={{ r: 4 }}
              name={exercise}
              stroke={EXERCISE_COLORS[index % EXERCISE_COLORS.length]}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
