import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { storage } from "../lib/storage.js";
import { useAuth } from "./useAuth.jsx";

const RECENT_KEY = "reps:recent-exercises";

export function useExercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [recentIds, setRecentIds] = useState(() => {
    const stored = storage.read(RECENT_KEY, []);
    return Array.isArray(stored) ? stored : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadExercises = async () => {
      if (!user) {
        setExercises([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("exercises")
        .select("id,name,body_part,is_preset")
        .order("is_preset", { ascending: false })
        .order("name", { ascending: true });

      if (!isActive) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setExercises([]);
      } else {
        setExercises(data ?? []);
      }

      setLoading(false);
    };

    loadExercises();

    return () => {
      isActive = false;
    };
  }, [user]);

  const recentExercises = useMemo(
    () =>
      recentIds
        .map((id) => exercises.find((exercise) => exercise.id === id))
        .filter(Boolean),
    [exercises, recentIds]
  );

  const searchExercises = (query, bodyPart) => {
    const keyword = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchQuery = keyword
        ? exercise.name.toLowerCase().includes(keyword)
        : true;
      const matchPart = bodyPart ? exercise.body_part === bodyPart : true;
      return matchQuery && matchPart;
    });
  };

  const addExercise = async (name, bodyPart) => {
    const trimmedName = name.trim();
    if (!trimmedName || !bodyPart) {
      return { ok: false, error: "请填写动作名称和部位。" };
    }

    if (!user) {
      return { ok: false, error: "请先登录。" };
    }

    const exists = exercises.some(
      (exercise) =>
        exercise.name === trimmedName && exercise.body_part === bodyPart
    );

    if (exists) {
      return { ok: false, error: "该动作已存在。" };
    }

    const { data, error: insertError } = await supabase
      .from("exercises")
      .insert({
        name: trimmedName,
        body_part: bodyPart,
        is_preset: false,
        user_id: user.id
      })
      .select("id,name,body_part,is_preset")
      .single();

    if (insertError) {
      return { ok: false, error: insertError.message };
    }

    setError("");
    setExercises((prev) => [data, ...prev]);
    return { ok: true, exercise: data };
  };

  const deleteExercise = async (id) => {
    const { error: deleteError } = await supabase
      .from("exercises")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setError("");
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
  };

  const markAsRecent = (exerciseId) => {
    const nextRecent = [
      exerciseId,
      ...recentIds.filter((id) => id !== exerciseId)
    ].slice(0, 6);
    setRecentIds(nextRecent);
    storage.write(RECENT_KEY, nextRecent);
  };

  return {
    exercises,
    recentExercises,
    loading,
    error,
    searchExercises,
    addExercise,
    deleteExercise,
    markAsRecent
  };
}
