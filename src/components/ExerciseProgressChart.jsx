import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function ExerciseProgressChart({ exercises = [] }) {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  useEffect(() => {
    if (!user || !selectedExercise) return;

    const fetchProgress = async () => {
      setLoading(true);

      const { data: sets, error } = await supabase
        .from("workout_sets")
        .select("id, weight, reps, set_type, segments, created_at")
        .eq("exercise_id", selectedExercise.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        setLoading(false);
        return;
      }

      const dateMap = new Map();
      (sets || []).forEach((set) => {
        const date = set.created_at.split("T")[0];
        let weight = 0;
        let reps = 0;

        if (set.set_type === "drop_set" && set.segments) {
          const maxSegment = set.segments.reduce(
            (max, seg) => (seg.weight > max.weight ? seg : max),
            { weight: 0, reps: 0 }
          );
          weight = maxSegment.weight || 0;
          reps = maxSegment.reps || 0;
        } else {
          weight = set.weight || 0;
          reps = set.reps || 0;
        }

        const existing = dateMap.get(date);
        if (!existing || weight > existing.weight) {
          dateMap.set(date, { date, weight, reps });
        }
      });

      const progressData = Array.from(dateMap.values()).slice(-30);
      setData(progressData);
      setLoading(false);
    };

    fetchProgress();
  }, [user, selectedExercise]);

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-bg-tertiary px-3 py-2 shadow-lg border border-border-primary backdrop-blur-md">
          <p className="text-xs text-text-secondary">{formatXAxis(item.date)}</p>
          <p className="text-sm font-bold text-primary">{item.weight}kg</p>
          <p className="text-xs text-text-tertiary">{item.reps} 次</p>
        </div>
      );
    }
    return null;
  };

  if (exercises.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">暂无动作数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">动作进步</h3>
        <select
          className="rounded-lg bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary border border-border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={selectedExercise?.id || ""}
          onChange={(e) => {
            const ex = exercises.find((ex) => ex.id === e.target.value);
            setSelectedExercise(ex);
          }}
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-text-secondary">加载中...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-text-secondary">暂无训练记录</p>
        </div>
      ) : (
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
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-primary)" }} />
            <Line
              activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
              dataKey="weight"
              dot={{ r: 3, fill: "#8b5cf6" }}
              name="重量"
              stroke="#8b5cf6"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-bg-tertiary/50 p-3">
            <p className="text-xs text-text-secondary">最高重量</p>
            <p className="text-lg font-bold text-primary">
              {Math.max(...data.map((d) => d.weight))}kg
            </p>
          </div>
          <div className="rounded-xl bg-bg-tertiary/50 p-3">
            <p className="text-xs text-text-secondary">最近重量</p>
            <p className="text-lg font-bold text-text-primary">
              {data[data.length - 1]?.weight || 0}kg
            </p>
          </div>
          <div className="rounded-xl bg-bg-tertiary/50 p-3">
            <p className="text-xs text-text-secondary">记录次数</p>
            <p className="text-lg font-bold text-text-primary">{data.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
