import { bodyParts } from "../data/bodyParts.js";

export function calculateVolume(sets = []) {
  return sets.reduce((total, set) => {
    if (set.set_type === "drop_set") {
      const segmentVolume = (set.segments ?? []).reduce(
        (sum, segment) => sum + (segment.weight ?? 0) * (segment.reps ?? 0),
        0
      );
      return total + segmentVolume;
    }

    return total + (set.weight ?? 0) * (set.reps ?? 0);
  }, 0);
}

export function calculateWorkoutStats(sets = []) {
  const exerciseIds = new Set(sets.map((set) => set.exercise_id));
  const bodyPartLabels = Array.from(
    new Set(
      sets
        .map((set) => bodyParts.find((part) => part.key === set.body_part)?.label)
        .filter(Boolean)
    )
  );

  return {
    bodyParts: bodyPartLabels,
    exerciseCount: exerciseIds.size,
    totalSets: sets.length,
    totalVolume: calculateVolume(sets)
  };
}

export function formatVolume(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}t`;
  }
  return `${value.toFixed(0)}kg`;
}
