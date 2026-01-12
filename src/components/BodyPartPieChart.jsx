import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#A855F7", "#F59E0B", "#EF4444", "#EC4899"];

export default function BodyPartPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-app-muted">暂无数据</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-xl">
          <p className="text-xs font-semibold text-white">{data.name}</p>
          <p className="text-xs text-gray-400">组数: {data.value}</p>
          <p className="text-xs text-gray-400">容量: {data.volume}kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-app-text">部位分布</h3>
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
