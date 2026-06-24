import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#18181b", // Zinc-900
  "#52525b", // Zinc-600
  "#a1a1aa", // Zinc-400
  "#d4d4d8", // Zinc-300
  "#71717a", // Zinc-500
  "#3f3f46"  // Zinc-700
];

export default function BodyPartPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">暂无数据</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-bg-tertiary px-3 py-2 shadow-lg border border-border-primary backdrop-blur-md">
          <p className="text-xs font-semibold text-text-primary">{data.name}</p>
          <p className="text-xs text-text-secondary">组数: {data.value}</p>
          <p className="text-xs text-text-secondary">容量: {data.volume}kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">部位分布</h3>
      <ResponsiveContainer height={250} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius={60}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
            outerRadius={80}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
