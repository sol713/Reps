import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

export function usePRDetector() {
  const { user } = useAuth();
  const [newPR, setNewPR] = useState(null);

  const checkForPR = async ({ exerciseId, weight, setId, exerciseName }) => {
    const normalizedWeight = Number(weight);
    if (!user || !exerciseId || !normalizedWeight) {
      return null;
    }

    const { data, error } = await supabase
      .from("workout_sets")
      .select("id, weight")
      .eq("exercise_id", exerciseId)
      .neq("id", setId)
      .order("weight", { ascending: false })
      .limit(1);

    if (error) {
      return null;
    }

    const previousMax = Number(data?.[0]?.weight ?? 0);
    if (normalizedWeight <= previousMax) {
      return null;
    }

    const prData = {
      exerciseId,
      exerciseName,
      weight: normalizedWeight,
      previousMax,
      improvement: normalizedWeight - previousMax
    };

    setNewPR(prData);

    await supabase.from("pr_records").insert({
      user_id: user.id,
      exercise_id: exerciseId,
      weight: normalizedWeight
    });

    return prData;
  };

  const clearPR = () => setNewPR(null);

  return { newPR, checkForPR, clearPR };
}
