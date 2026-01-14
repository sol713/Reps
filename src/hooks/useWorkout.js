import { useCallback, useEffect, useState } from "react";
import { getTodayIsoDate } from "../lib/date.js";
import { normalizeSets } from "../lib/sets.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

const LOG_SELECT =
  "id,date,template_id,started_at,ended_at,notes,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,rest_seconds,rpe,notes,created_at,exercises(name,body_part))";

export function useWorkout() {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const initTodayLog = async () => {
      if (!user) {
        setTodayLog(null);
        setSets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const today = getTodayIsoDate();
      const { data, error: fetchError } = await supabase
        .from("workout_logs")
        .select(LOG_SELECT)
        .eq("date", today)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (data) {
        const normalizedSets = normalizeSets(data.workout_sets ?? []);
        setTodayLog({
          id: data.id,
          date: data.date,
          templateId: data.template_id,
          startedAt: data.started_at,
          endedAt: data.ended_at,
          notes: data.notes
        });
        setSets(normalizedSets);
        setLoading(false);
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("workout_logs")
        .insert({ date: today, user_id: user.id })
        .select("id,date,template_id,started_at,ended_at,notes")
        .single();

      if (!isActive) {
        return;
      }

      if (createError) {
        setError(createError.message);
        setLoading(false);
        return;
      }

      setTodayLog({
        id: created.id,
        date: created.date,
        templateId: created.template_id,
        startedAt: created.started_at,
        endedAt: created.ended_at,
        notes: created.notes
      });
      setSets([]);
      setLoading(false);
    };

    initTodayLog();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!todayLog?.id) return;

    const channel = supabase
      .channel(`workout-sets-${todayLog.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_sets",
          filter: `workout_log_id=eq.${todayLog.id}`
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data } = await supabase
              .from("workout_sets")
              .select(
                "id,exercise_id,set_number,set_type,weight,reps,segments,rest_seconds,rpe,notes,photo_url,created_at,exercises(name,body_part)"
              )
              .eq("id", payload.new.id)
              .single();

            if (data) {
              const normalizedSet = normalizeSets([data])[0];
              setSets((prev) => {
                if (prev.some((s) => s.id === normalizedSet.id)) return prev;
                return [...prev, normalizedSet];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { data } = await supabase
              .from("workout_sets")
              .select(
                "id,exercise_id,set_number,set_type,weight,reps,segments,rest_seconds,rpe,notes,photo_url,created_at,exercises(name,body_part)"
              )
              .eq("id", payload.new.id)
              .single();

            if (data) {
              const normalizedSet = normalizeSets([data])[0];
              setSets((prev) =>
                prev.map((s) => (s.id === normalizedSet.id ? normalizedSet : s))
              );
            }
          } else if (payload.eventType === "DELETE") {
            setSets((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [todayLog?.id]);

  const startWorkout = useCallback(async (templateId = null) => {
    if (!todayLog) return false;

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("workout_logs")
      .update({
        started_at: todayLog.startedAt ?? now,
        template_id: templateId
      })
      .eq("id", todayLog.id);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    setTodayLog((prev) => ({
      ...prev,
      startedAt: prev.startedAt ?? now,
      templateId
    }));
    return true;
  }, [todayLog]);

  const endWorkout = useCallback(async (notes = "") => {
    if (!todayLog) return false;

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("workout_logs")
      .update({
        ended_at: now,
        notes
      })
      .eq("id", todayLog.id);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    setTodayLog((prev) => ({
      ...prev,
      endedAt: now,
      notes
    }));
    return true;
  }, [todayLog]);

  const addSet = async (exercise, setData) => {
    if (!exercise || !todayLog) {
      return null;
    }

    if (!todayLog.startedAt) {
      await startWorkout();
    }

    const { data: maxData, error: maxError } = await supabase
      .from("workout_sets")
      .select("set_number")
      .eq("workout_log_id", todayLog.id)
      .eq("exercise_id", exercise.id)
      .order("set_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) {
      setError(maxError.message);
      return null;
    }

    const setNumber = (maxData?.set_number ?? 0) + 1;

    const payload = {
      workout_log_id: todayLog.id,
      exercise_id: exercise.id,
      set_number: setNumber,
      set_type: setData.set_type ?? "normal",
      weight: setData.weight ?? null,
      reps: setData.reps ?? null,
      segments: setData.segments ?? null,
      rest_seconds: setData.rest_seconds ?? null,
      rpe: setData.rpe ?? null,
      notes: setData.notes ?? null
    };

    const { data, error: insertError } = await supabase
      .from("workout_sets")
      .insert(payload)
      .select(
        "id,exercise_id,set_number,set_type,weight,reps,segments,rest_seconds,rpe,notes,created_at,exercises(name,body_part)"
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    setError("");
    const normalizedSet = normalizeSets([data])[0];
    setSets((prev) => [...prev, normalizedSet]);
    return normalizedSet;
  };

  const deleteSet = async (setId) => {
    const { error: deleteError } = await supabase
      .from("workout_sets")
      .delete()
      .eq("id", setId);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setError("");
    setSets((prev) => prev.filter((set) => set.id !== setId));
    return true;
  };

  const updateSet = async (setId, updates) => {
    if (!setId) {
      return null;
    }

    const payload = {
      set_type: updates.set_type ?? "normal",
      weight: updates.weight ?? null,
      reps: updates.reps ?? null,
      segments: updates.segments ?? null,
      rest_seconds: updates.rest_seconds ?? null,
      rpe: updates.rpe ?? null,
      notes: updates.notes ?? null
    };

    if (payload.set_type === "normal") {
      payload.segments = null;
    } else {
      payload.weight = null;
      payload.reps = null;
    }

    const { data, error: updateError } = await supabase
      .from("workout_sets")
      .update(payload)
      .eq("id", setId)
      .select(
        "id,exercise_id,set_number,set_type,weight,reps,segments,rest_seconds,rpe,notes,created_at,exercises(name,body_part)"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    setError("");
    const normalizedSet = normalizeSets([data])[0];
    setSets((prev) => prev.map((set) => (set.id === setId ? normalizedSet : set)));
    return normalizedSet;
  };

  const removeLocalSet = (setId) => {
    setSets((prev) => prev.filter((set) => set.id !== setId));
  };

  const restoreLocalSet = (set, index) => {
    if (!set) {
      return;
    }
    setSets((prev) => {
      const next = [...prev];
      if (index >= 0 && index <= next.length) {
        next.splice(index, 0, set);
      } else {
        next.push(set);
      }
      return next;
    });
  };

  const getExerciseHistory = useCallback(async (exerciseId, limit = 3) => {
    if (!exerciseId) {
      return [];
    }

    const { data, error: historyError } = await supabase
      .from("workout_sets")
      .select(
        "id,exercise_id,set_number,set_type,weight,reps,segments,rest_seconds,rpe,notes,created_at,exercises(name,body_part)"
      )
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (historyError) {
      setError(historyError.message);
      return [];
    }

    return normalizeSets(data ?? []);
  }, []);

  const getWorkoutDuration = useCallback(() => {
    if (!todayLog?.startedAt) return null;
    
    const start = new Date(todayLog.startedAt);
    const end = todayLog.endedAt ? new Date(todayLog.endedAt) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins;
  }, [todayLog]);

  return {
    todayLog,
    sets,
    loading,
    error,
    addSet,
    deleteSet,
    updateSet,
    removeLocalSet,
    restoreLocalSet,
    getExerciseHistory,
    startWorkout,
    endWorkout,
    getWorkoutDuration
  };
}
