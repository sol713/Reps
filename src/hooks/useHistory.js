import { useCallback, useEffect, useState } from "react";
import { normalizeSets } from "../lib/sets.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

const LOG_SELECT =
  "id,date,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,created_at,exercises(name,body_part))";

export function useHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("workout_logs")
      .select(LOG_SELECT)
      .order("date", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLogs([]);
      setLoading(false);
      return;
    }

    const normalizedLogs = (data ?? [])
      .map((log) => ({
        id: log.id,
        date: log.date,
        sets: normalizeSets(log.workout_sets ?? [])
      }))
      .filter((log) => log.sets.length > 0);

    setLogs(normalizedLogs);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      await loadLogs();
    };

    if (isActive) {
      load();
    }

    return () => {
      isActive = false;
    };
  }, [loadLogs]);

  return { logs, loading, error, refresh: loadLogs };
}
