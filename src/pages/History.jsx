import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
      <header className="flex items-center gap-4">
        <Link
          className="flex h-9 w-9 items-center justify-center rounded-full border border-app-divider bg-white text-app-muted shadow-sm transition-all hover:bg-gray-50 active:scale-95"
          to="/"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-app-text">历史记录</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-app-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-card border border-dashed border-app-divider bg-gray-50 p-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : workoutLogs.length === 0 ? (
        <div className="rounded-card border border-dashed border-app-divider bg-gray-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-app-primary/10">
            <svg className="h-8 w-8 text-app-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-bold text-app-text">还没有训练记录</p>
          <p className="mt-2 text-sm text-app-muted">
            去记录你的第一次训练吧
          </p>
          <Link
            className="btn-primary mt-4 inline-block rounded-button px-6 py-2.5 text-sm font-semibold text-white"
            to="/"
          >
            开始训练
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workoutLogs.map((log, index) => {
            const summary = buildSummary(log);
            return (
              <button
                className="fade-in interactive-card flex w-full items-center justify-between rounded-card border border-app-divider bg-white p-4 text-left shadow-card"
                key={log.id}
                type="button"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/history/${log.date}`)}
              >
                <div>
                  <p className="text-xs font-medium text-app-muted">{formatWeekday(log.date)}</p>
                  <p className="mt-0.5 text-base font-bold text-app-text">{formatDate(log.date)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {summary.bodyParts.map((part) => (
                      <span
                        className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-app-primary"
                        key={part}
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-app-muted">
                      {summary.exerciseCount} 动作
                    </p>
                    <p className="text-sm font-bold text-app-text">
                      {summary.totalSets} 组
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-app-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
