export function normalizeSet(record) {
  if (!record) {
    return null;
  }
  const { exercises, ...rest } = record;
  const exercise = exercises ?? {};
  return {
    ...rest,
    exercise_name: record.exercise_name ?? exercise.name ?? "",
    body_part: record.body_part ?? exercise.body_part ?? ""
  };
}

export function normalizeSets(records = []) {
  return records.map(normalizeSet).filter(Boolean);
}
