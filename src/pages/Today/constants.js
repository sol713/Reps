import { clamp } from "../../lib/math.js";

export const WEIGHT = {
  MIN: 5,
  MAX: 300,
  DEFAULT: 20,
  STEP: 2.5
};

export const REPS = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 8,
  STEP: 1
};

export const REST = {
  DEFAULT: 60,
  MAX: 300
};

export function clampWeight(value) {
  return clamp(Number(value ?? WEIGHT.DEFAULT), WEIGHT.MIN, WEIGHT.MAX);
}

export function clampReps(value) {
  return clamp(Number(value ?? REPS.DEFAULT), REPS.MIN, REPS.MAX);
}

export function groupSets(sets) {
  const groups = new Map();
  sets.forEach((set) => {
    const current = groups.get(set.exercise_id) ?? {
      exerciseId: set.exercise_id,
      exerciseName: set.exercise_name,
      sets: []
    };
    current.sets.push(set);
    groups.set(set.exercise_id, current);
  });
  return Array.from(groups.values()).reverse();
}
