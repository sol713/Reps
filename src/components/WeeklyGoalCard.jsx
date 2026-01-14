import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
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
      
      const { data, error } = await supabase
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
    <div className="card relative overflow-hidden">
      <div className="absolute top-0 left-0 -mt-6 -ml-6 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            本周目标
          </p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-gradient">{completedDays}</span>
            <span className="text-lg text-text-tertiary">/</span>
            <span className="text-lg font-semibold text-text-secondary">{targetDays} 天</span>
          </p>
        </div>
        <div>
          {completedDays >= targetDays ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-sm font-bold text-success">
              🎉 达成!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1.5 text-sm font-medium text-warning">
              还差 {remaining} 天
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 h-2 overflow-hidden rounded-full bg-bg-tertiary">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`,
            background: completedDays >= targetDays 
              ? 'var(--gradient-success)' 
              : 'var(--gradient-primary)'
          }}
        />
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-7 gap-2">
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
                flex flex-col items-center justify-center rounded-xl py-2 transition-all
                ${isCompleted 
                  ? "bg-primary text-white" 
                  : isToday 
                    ? "bg-bg-tertiary ring-2 ring-primary/50" 
                    : "bg-bg-tertiary/50"
                }
              `}
            >
              <span className={`text-xs font-medium ${isCompleted ? "text-white/80" : "text-text-tertiary"}`}>
                {label}
              </span>
              {isCompleted && (
                <span className="mt-0.5 text-sm">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
