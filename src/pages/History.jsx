import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bodyParts } from "../data/bodyParts.js";
import { formatDate, formatWeekday } from "../lib/date.js";
import { normalizeSets } from "../lib/sets.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.jsx";

const LOG_SELECT =
  "id,date,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,created_at,exercises(name,body_part))";

function buildSummary(log) {
  const sets = log.sets ?? [];
  const exerciseIds = new Set(sets.map((set) => set.exercise_id));
  const parts = Array.from(
    new Set(
      sets
        .map((set) => bodyParts.find((part) => part.key === set.body_part)?.label)
        .filter(Boolean)
    )
  );
  return {
    exerciseCount: exerciseIds.size,
    totalSets: sets.length,
    bodyParts: parts
  };
}

export default function History() {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const loadLogs = async () => {
      if (!user) {
        setWorkoutLogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("workout_logs")
        .select(LOG_SELECT)
        .order("date", { ascending: false });

      if (!isActive) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setWorkoutLogs([]);
        setLoading(false);
        return;
      }

      const logs = (data ?? [])
        .map((log) => ({
          id: log.id,
          date: log.date,
          sets: normalizeSets(log.workout_sets ?? [])
        }))
        .filter((log) => log.sets.length > 0);

      setWorkoutLogs(logs);
      setLoading(false);
    };

    loadLogs();

    return () => {
      isActive = false;
    };
  }, [user]);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          训练历史
        </p>
        <h1 className="text-2xl font-bold text-text-primary">历史记录</h1>
      </header>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
        </div>
      ) : error ? (
        <div className="card text-center">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : workoutLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">还没有训练记录</p>
          <p className="empty-state-description">去记录你的第一次训练吧</p>
          <button
            className="btn btn-primary mt-4"
            type="button"
            onClick={() => navigate("/")}
          >
            开始训练
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workoutLogs.map((log, index) => {
            const summary = buildSummary(log);
            return (
              <button
                className="card card-interactive animate-fade-in flex w-full items-center justify-between text-left"
                key={log.id}
                type="button"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/history/${log.date}`)}
              >
                <div>
                  <p className="text-xs font-medium text-text-secondary">{formatWeekday(log.date)}</p>
                  <p className="mt-0.5 text-base font-bold text-text-primary">{formatDate(log.date)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {summary.bodyParts.map((part) => (
                      <span
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary"
                        key={part}
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">
                      {summary.exerciseCount} 动作
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                      {summary.totalSets} 组
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
