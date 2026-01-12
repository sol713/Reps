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

const EXERCISE_COLORS = ["#10B981", "#3B82F6", "#A855F7", "#F59E0B", "#EF4444"];

export default function PRProgressChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-app-muted">暂无PR数据</p>
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
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-xl">
          <p className="text-xs text-gray-400">{formatXAxis(payload[0].payload.date)}</p>
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
      <h3 className="text-sm font-semibold text-app-text">PR进步</h3>
      <ResponsiveContainer height={250} width="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
          <Legend wrapperStyle={{ fontSize: "12px" }} />
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
