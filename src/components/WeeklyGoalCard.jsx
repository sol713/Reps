import { useEffect, useState } from "react";
import { insforge } from "../lib/insforge.js";
import { useAuth } from "../hooks/useAuth.jsx";

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0]
  };
}

export default function WeeklyGoalCard({ targetDays = 6 }) {
  const { user } = useAuth();
  const [workoutDays, setWorkoutDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWeekData = async () => {
      const { start, end } = getWeekDates();

      const { data, error } = await insforge.database
        .from("workout_logs")
        .select("date")
        .gte("date", start)
        .lte("date", end);

      if (!error && data) {
        const uniqueDays = [...new Set(data.map((d) => d.date))];
        setWorkoutDays(uniqueDays);
      }

      setLoading(false);
    };

    fetchWeekData();
  }, [user]);

  if (loading) {
    return null;
  }

  const completedDays = workoutDays.length;
  const progress = Math.min(100, Math.round((completedDays / targetDays) * 100));
  const remaining = Math.max(0, targetDays - completedDays);

  const weekDayLabels = ["一", "二", "三", "四", "五", "六", "日"];
  const { start } = getWeekDates();
  const mondayDate = new Date(start);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            本周目标
          </p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-text-primary tabular-nums">{completedDays}</span>
            <span className="text-sm text-text-tertiary">/ {targetDays} 天</span>
          </p>
        </div>
        <div>
          {completedDays >= targetDays ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              达成
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
              还差 {remaining} 天
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: completedDays >= targetDays
              ? 'var(--color-success)'
              : 'var(--color-primary)'
          }}
        />
      </div>

      {/* Week day indicators */}
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {weekDayLabels.map((label, index) => {
          const dayDate = new Date(mondayDate);
          dayDate.setDate(mondayDate.getDate() + index);
          const dateStr = dayDate.toISOString().split("T")[0];
          const isCompleted = workoutDays.includes(dateStr);
          const isToday = dateStr === new Date().toISOString().split("T")[0];

          return (
            <div
              key={label}
              className={`
                flex flex-col items-center justify-center rounded-lg py-1.5 transition-all
                ${isCompleted
                  ? "bg-text-primary text-bg-primary"
                  : isToday
                    ? "bg-bg-tertiary ring-1 ring-text-tertiary/30"
                    : "bg-bg-tertiary/50"
                }
              `}
            >
              <span className={`text-[11px] font-medium ${isCompleted ? "text-bg-primary/70" : isToday ? "text-text-primary" : "text-text-tertiary"}`}>
                {label}
              </span>
              {isCompleted && (
                <svg className="mt-0.5 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
