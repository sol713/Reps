import { useEffect, useState } from "react";
import { getPreviousDayIso, getTodayIsoDate, getYesterdayIsoDate } from "../lib/date.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

export function useStreak(refreshKey) {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const calculateStreak = async () => {
      if (!user) {
        setStreak(0);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("workout_logs")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error || !data || data.length === 0) {
        setStreak(0);
        setLoading(false);
        return;
      }

      const dates = new Set(data.map((log) => log.date));
      const today = getTodayIsoDate();
      const yesterday = getYesterdayIsoDate();

      let currentDate = null;
      if (dates.has(today)) {
        currentDate = today;
      } else if (dates.has(yesterday)) {
        currentDate = yesterday;
      } else {
        setStreak(0);
        setLoading(false);
        return;
      }

      let currentStreak = 0;
      while (currentDate && dates.has(currentDate)) {
        currentStreak += 1;
        currentDate = getPreviousDayIso(currentDate);
      }

      setStreak(currentStreak);
      setLoading(false);
    };

    calculateStreak();

    return () => {
      isActive = false;
    };
  }, [user, refreshKey]);

  return { streak, loading };
}
