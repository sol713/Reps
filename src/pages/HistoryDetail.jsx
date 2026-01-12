import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bodyParts } from "../data/bodyParts.js";
import { formatDate } from "../lib/date.js";
import { normalizeSets } from "../lib/sets.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.jsx";

const LOG_SELECT =
  "id,date,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,created_at,exercises(name,body_part))";

function groupSetsByExercise(sets) {
  const groups = new Map();
  sets.forEach((set) => {
    const existing = groups.get(set.exercise_id) ?? {
      exerciseId: set.exercise_id,
      exerciseName: set.exercise_name,
      bodyPart: set.body_part,
      sets: []
    };
    existing.sets.push(set);
    groups.set(set.exercise_id, existing);
  });
  return Array.from(groups.values());
}

export default function HistoryDetail() {
  const { date } = useParams();
  const { user } = useAuth();
  const [log, setLog] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadLog = async () => {
      if (!user || !date) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("workout_logs")
        .select(LOG_SELECT)
        .eq("date", date)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setLog(null);
        setSets([]);
        setLoading(false);
        return;
      }

      if (!data) {
        setLog(null);
        setSets([]);
        setLoading(false);
        return;
      }

      const normalizedSets = normalizeSets(data.workout_sets ?? []);
      setLog({ id: data.id, date: data.date });
      setSets(normalizedSets);
      setLoading(false);
    };

    loadLog();

    return () => {
      isActive = false;
    };
  }, [date, user]);
  const exerciseGroups = groupSetsByExercise(sets);

  const bodyPartLabels = Array.from(
    new Set(
      exerciseGroups
        .map((group) => bodyParts.find((part) => part.key === group.bodyPart)?.label)
        .filter(Boolean)
    )
  );

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
        <header className="flex items-center justify-between">
          <Link className="text-xs font-semibold text-app-muted" to="/history">
            返回
          </Link>
          <h1 className="text-lg font-semibold">训练详情</h1>
          <span className="text-xs font-semibold text-app-muted">加载中</span>
        </header>
        <p className="text-sm text-app-muted">正在加载记录...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
        <header className="flex items-center justify-between">
          <Link className="text-xs font-semibold text-app-muted" to="/history">
            返回
          </Link>
          <h1 className="text-lg font-semibold">训练详情</h1>
          <span className="text-xs font-semibold text-app-muted">错误</span>
        </header>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
        <header className="flex items-center justify-between">
          <Link className="text-xs font-semibold text-app-muted" to="/history">
            返回
          </Link>
          <h1 className="text-lg font-semibold">训练详情</h1>
          <span className="text-xs font-semibold text-app-muted">暂无</span>
        </header>
        <p className="text-sm text-app-muted">未找到该日期的训练记录。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <Link className="text-xs font-semibold text-app-muted" to="/history">
          返回
        </Link>
        <h1 className="text-lg font-semibold">{formatDate(date)}</h1>
        <span className="text-xs font-semibold text-app-muted">详情</span>
      </header>

      <section className="grid gap-3 rounded-card border border-app-divider bg-app-card p-4 neo-surface-soft">
        <div>
          <p className="text-xs text-app-muted">训练部位</p>
          <p className="text-sm font-semibold">
            {bodyPartLabels.length > 0 ? bodyPartLabels.join("、") : "-"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-input border border-app-divider px-3 py-2 text-center neo-inset">
            <p className="text-xs text-app-muted">动作数</p>
            <p className="text-base font-semibold">{exerciseGroups.length}</p>
          </div>
          <div className="rounded-input border border-app-divider px-3 py-2 text-center neo-inset">
            <p className="text-xs text-app-muted">总组数</p>
            <p className="text-base font-semibold">{sets.length}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {exerciseGroups.length === 0 ? (
          <p className="text-sm text-app-muted">当天没有训练记录。</p>
        ) : (
          exerciseGroups.map((group) => (
            <div
              className="rounded-card border border-app-divider bg-app-card p-4 neo-surface-soft"
              key={group.exerciseId}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{group.exerciseName}</p>
                  <p className="text-xs text-app-muted">
                    {bodyParts.find((part) => part.key === group.bodyPart)?.label ??
                      ""}
                  </p>
                </div>
                <span className="text-xs text-app-muted">
                  {group.sets.length} 组
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {group.sets.map((set) => (
                  <div
                    className="rounded-input border border-app-divider px-3 py-2 neo-inset"
                    key={set.id}
                  >
                    <p className="text-xs text-app-muted">第 {set.set_number} 组</p>
                    {set.set_type === "drop_set" ? (
                      <p className="text-sm font-semibold">
                        {set.segments?.map((segment, index) => (
                          <span key={`${segment.weight}-${segment.reps}-${index}`}>
                            {segment.weight}kg × {segment.reps}
                            {index < (set.segments?.length ?? 0) - 1 && " / "}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold">
                        {set.weight}kg × {set.reps}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
