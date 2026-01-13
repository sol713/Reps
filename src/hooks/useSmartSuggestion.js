import { useEffect, useState } from "react";
import { getTodayIsoDate } from "../lib/date.js";
import { normalizeSets } from "../lib/sets.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

const ROTATION = ["chest", "back", "shoulder", "chest", "back", "core"];

const LOG_SELECT =
  "id,date,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,rpe,notes,created_at,exercises(name,body_part))";

function getMainBodyPart(sets) {
  const counts = {};
  sets.forEach((set) => {
    const part = set.body_part;
    if (part) {
      counts[part] = (counts[part] || 0) + 1;
    }
  });
  let maxPart = null;
  let maxCount = 0;
  for (const [part, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxPart = part;
    }
  }
  return maxPart;
}

function predictNextBodyPart(recentParts) {
  if (recentParts.length === 0) return "chest";
  
  const lastPart = recentParts[0];
  const lastIndex = ROTATION.indexOf(lastPart);
  
  if (lastIndex === -1) {
    return "chest";
  }
  
  const nextIndex = (lastIndex + 1) % ROTATION.length;
  return ROTATION[nextIndex];
}

export function useSmartSuggestion() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [suggestedPart, setSuggestedPart] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [recentParts, setRecentParts] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const today = getTodayIsoDate();
      const { data, error } = await supabase
        .from("workout_logs")
        .select(LOG_SELECT)
        .lt("date", today)
        .order("date", { ascending: false })
        .limit(10);

      if (error) {
        setLoading(false);
        return;
      }

      const logs = (data ?? []).map((log) => ({
        id: log.id,
        date: log.date,
        sets: normalizeSets(log.workout_sets ?? [])
      }));

      const parts = logs
        .map((log) => getMainBodyPart(log.sets))
        .filter(Boolean);

      setRecentParts(parts);

      const nextPart = predictNextBodyPart(parts);
      setSuggestedPart(nextPart);

      const lastSamePartLog = logs.find(
        (log) => getMainBodyPart(log.sets) === nextPart
      );

      if (lastSamePartLog) {
        setLastWorkout({
          date: lastSamePartLog.date,
          sets: lastSamePartLog.sets.filter(
            (set) => set.body_part === nextPart
          )
        });
      } else {
        setLastWorkout(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getExercisesFromLastWorkout = () => {
    if (!lastWorkout) return [];

    const exerciseMap = new Map();
    lastWorkout.sets.forEach((set) => {
      if (!exerciseMap.has(set.exercise_id)) {
        exerciseMap.set(set.exercise_id, {
          exerciseId: set.exercise_id,
          exerciseName: set.exercise_name,
          bodyPart: set.body_part,
          sets: []
        });
      }
      exerciseMap.get(set.exercise_id).sets.push({
        weight: set.weight,
        reps: set.reps,
        setType: set.set_type,
        segments: set.segments,
        rpe: set.rpe,
        notes: set.notes
      });
    });

    return Array.from(exerciseMap.values());
  };

  return {
    loading,
    suggestedPart,
    lastWorkout,
    recentParts,
    getExercisesFromLastWorkout
  };
}
