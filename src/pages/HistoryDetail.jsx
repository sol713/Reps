import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
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

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header className="flex items-center gap-4">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary text-text-secondary transition-colors active:bg-bg-tertiary"
          type="button"
          onClick={() => navigate("/history")}
          aria-label="返回"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            训练详情
          </p>
          <h1 className="text-xl font-bold text-text-primary">
            {date ? formatDate(date) : "训练详情"}
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
        </div>
      ) : error ? (
        <div className="card text-center">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : !log ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">未找到记录</p>
          <p className="empty-state-description">该日期没有训练记录</p>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">训练部位</p>
              <p className="mt-1 font-semibold text-text-primary">
                {bodyPartLabels.length > 0 ? bodyPartLabels.join("、") : "-"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-bg-secondary px-4 py-3 text-center">
                <p className="text-xs font-medium text-text-secondary">动作数</p>
                <p className="text-xl font-bold text-text-primary">{exerciseGroups.length}</p>
              </div>
              <div className="rounded-lg bg-bg-secondary px-4 py-3 text-center">
                <p className="text-xs font-medium text-text-secondary">总组数</p>
                <p className="text-xl font-bold text-text-primary">{sets.length}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {exerciseGroups.length === 0 ? (
              <p className="text-sm text-text-secondary">当天没有训练记录。</p>
            ) : (
              exerciseGroups.map((group) => (
                <div className="card" key={group.exerciseId}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{group.exerciseName}</p>
                      <p className="text-sm text-text-secondary">
                        {bodyParts.find((part) => part.key === group.bodyPart)?.label ?? ""}
                      </p>
                    </div>
                    <span className="badge">{group.sets.length} 组</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.sets.map((set) => (
                      <div
                        className="flex items-center justify-between rounded-lg bg-bg-secondary px-4 py-3"
                        key={set.id}
                      >
                        <span className="text-sm text-text-secondary">第 {set.set_number} 组</span>
                        {set.set_type === "drop_set" ? (
                          <span className="font-semibold text-text-primary">
                            {set.segments?.map((segment, index) => (
                              <span key={`${segment.weight}-${segment.reps}-${index}`}>
                                {segment.weight}kg×{segment.reps}
                                {index < (set.segments?.length ?? 0) - 1 && " → "}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="font-semibold text-text-primary">
                            {set.weight}kg × {set.reps}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
