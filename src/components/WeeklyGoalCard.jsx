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
    <div className="weekly-goal-card">
      <div className="weekly-goal-header">
        <div>
          <p className="weekly-goal-label">本周目标</p>
          <p className="weekly-goal-progress">
            <span className="weekly-goal-current">{completedDays}</span>
            <span className="weekly-goal-divider">/</span>
            <span className="weekly-goal-target">{targetDays} 天</span>
          </p>
        </div>
        <div className="weekly-goal-status">
          {completedDays >= targetDays ? (
            <span className="weekly-goal-complete">🎉 达成!</span>
          ) : (
            <span className="weekly-goal-remaining">还差 {remaining} 天</span>
          )}
        </div>
      </div>

      <div className="weekly-goal-bar">
        <div 
          className="weekly-goal-bar-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="weekly-goal-days">
        {weekDayLabels.map((label, index) => {
          const dayDate = new Date(mondayDate);
          dayDate.setDate(mondayDate.getDate() + index);
          const dateStr = dayDate.toISOString().split("T")[0];
          const isCompleted = workoutDays.includes(dateStr);
          const isToday = dateStr === new Date().toISOString().split("T")[0];
          
          return (
            <div
              key={label}
              className={`weekly-goal-day ${isCompleted ? "completed" : ""} ${isToday ? "today" : ""}`}
            >
              <span className="weekly-goal-day-label">{label}</span>
              {isCompleted && <span className="weekly-goal-day-check">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
