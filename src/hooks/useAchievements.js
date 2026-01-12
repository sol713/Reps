import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { ACHIEVEMENTS, calculateProgress } from "../data/achievements.js";
import { useAuth } from "./useAuth.jsx";

const STORAGE_KEY = "reps_achievements";

export function useAchievements() {
  const { user } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [stats, setStats] = useState({
    streak: 0,
    total_workouts: 0,
    total_sets: 0,
    total_prs: 0,
    total_volume: 0,
    early_workout: 0,
    late_workout: 0,
    weekend_streak: 0,
    body_parts_in_workout: 0,
    workout_duration: 0,
    weekly_workouts: 0
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnlockedIds([]);
      setLoading(false);
      return;
    }

    loadAchievements();
    loadStats();
  }, [user]);

  const loadAchievements = useCallback(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (stored) {
        setUnlockedIds(JSON.parse(stored));
      }
    } catch {
      setUnlockedIds([]);
    }
  }, [user]);

  const saveAchievements = useCallback(
    (ids) => {
      if (!user) return;
      try {
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(ids));
      } catch {
      }
    },
    [user]
  );

  const loadStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const [workoutsResult, setsResult, prsResult] = await Promise.all([
        supabase
          .from("workout_logs")
          .select("id, date, started_at, ended_at")
          .eq("user_id", user.id)
          .not("started_at", "is", null),

        supabase
          .from("workout_sets")
          .select("id, weight, reps, segments, created_at, workout_log_id")
          .in(
            "workout_log_id",
            (
              await supabase
                .from("workout_logs")
                .select("id")
                .eq("user_id", user.id)
            ).data?.map((w) => w.id) ?? []
          ),

        supabase.from("pr_records").select("id").eq("user_id", user.id)
      ]);

      const workouts = workoutsResult.data ?? [];
      const sets = setsResult.data ?? [];
      const prs = prsResult.data ?? [];

      let totalVolume = 0;
      sets.forEach((set) => {
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
        } else if (set.segments) {
          set.segments.forEach((seg) => {
            if (seg.weight && seg.reps) {
              totalVolume += seg.weight * seg.reps;
            }
          });
        }
      });

      const streak = calculateStreak(workouts);
      const weeklyWorkouts = calculateWeeklyWorkouts(workouts);
      const weekendStreak = calculateWeekendStreak(workouts);

      let earlyWorkout = 0;
      let lateWorkout = 0;
      let maxDuration = 0;

      workouts.forEach((w) => {
        if (w.started_at) {
          const hour = new Date(w.started_at).getHours();
          if (hour < 6) earlyWorkout++;
          if (hour >= 22) lateWorkout++;
        }
        if (w.started_at && w.ended_at) {
          const duration = (new Date(w.ended_at) - new Date(w.started_at)) / 60000;
          if (duration > maxDuration) maxDuration = duration;
        }
      });

      const newStats = {
        streak,
        total_workouts: workouts.length,
        total_sets: sets.length,
        total_prs: prs.length,
        total_volume: Math.round(totalVolume),
        early_workout: earlyWorkout,
        late_workout: lateWorkout,
        weekend_streak: weekendStreak,
        body_parts_in_workout: 0,
        workout_duration: Math.round(maxDuration),
        weekly_workouts: weeklyWorkouts
      };

      setStats(newStats);
      checkNewAchievements(newStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user, unlockedIds]);

  const checkNewAchievements = useCallback(
    (currentStats) => {
      const newUnlocks = [];

      ACHIEVEMENTS.forEach((achievement) => {
        if (unlockedIds.includes(achievement.id)) return;

        const progress = calculateProgress(achievement, currentStats);
        if (progress >= 100) {
          newUnlocks.push(achievement.id);
        }
      });

      if (newUnlocks.length > 0) {
        const updatedIds = [...unlockedIds, ...newUnlocks];
        setUnlockedIds(updatedIds);
        saveAchievements(updatedIds);

        const firstNew = ACHIEVEMENTS.find((a) => a.id === newUnlocks[0]);
        setNewlyUnlocked(firstNew);
      }
    },
    [unlockedIds, saveAchievements]
  );

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  const getProgress = useCallback(
    (achievementId) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return 0;
      return calculateProgress(achievement, stats);
    },
    [stats]
  );

  const isUnlocked = useCallback(
    (achievementId) => {
      return unlockedIds.includes(achievementId);
    },
    [unlockedIds]
  );

  return {
    achievements: ACHIEVEMENTS,
    unlockedIds,
    stats,
    loading,
    newlyUnlocked,
    clearNewlyUnlocked,
    refreshStats,
    getProgress,
    isUnlocked
  };
}

function calculateStreak(workouts) {
  if (workouts.length === 0) return 0;

  const dates = [...new Set(workouts.map((w) => w.date))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = (prevDate - currDate) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateWeeklyWorkouts(workouts) {
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const recentWorkouts = workouts.filter((w) => w.date >= oneWeekAgo);
  const uniqueDays = new Set(recentWorkouts.map((w) => w.date));
  return uniqueDays.size;
}

function calculateWeekendStreak(workouts) {
  const weekendDates = workouts
    .filter((w) => {
      const day = new Date(w.date).getDay();
      return day === 0 || day === 6;
    })
    .map((w) => w.date);

  const uniqueWeekends = new Set();
  weekendDates.forEach((date) => {
    const d = new Date(date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    uniqueWeekends.add(weekStart.toISOString().split("T")[0]);
  });

  const sortedWeekends = [...uniqueWeekends].sort().reverse();
  let streak = 0;

  for (let i = 0; i < sortedWeekends.length; i++) {
    if (i === 0) {
      streak = 1;
      continue;
    }

    const prev = new Date(sortedWeekends[i - 1]);
    const curr = new Date(sortedWeekends[i]);
    const diffWeeks = (prev - curr) / (7 * 86400000);

    if (Math.abs(diffWeeks - 1) < 0.1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
