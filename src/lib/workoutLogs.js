import { createId } from "./id.js";
import { storage } from "./storage.js";
import { getTodayIsoDate } from "./date.js";

const LOGS_KEY = "reps:workout-logs";

export function loadWorkoutLogs() {
  const logs = storage.read(LOGS_KEY, []);
  return Array.isArray(logs) ? logs : [];
}

export function saveWorkoutLogs(logs) {
  storage.write(LOGS_KEY, logs);
}

export function getOrCreateLog(date = getTodayIsoDate()) {
  const logs = loadWorkoutLogs();
  const existing = logs.find((log) => log.date === date);
  if (existing) {
    return { log: existing, logs };
  }

  const log = {
    id: createId("log"),
    date,
    sets: []
  };
  const updatedLogs = [log, ...logs];
  saveWorkoutLogs(updatedLogs);
  return { log, logs: updatedLogs };
}

export function updateWorkoutLog(updatedLog) {
  const logs = loadWorkoutLogs();
  const nextLogs = logs.filter((log) => log.id !== updatedLog.id);
  nextLogs.unshift(updatedLog);
  saveWorkoutLogs(nextLogs);
  return nextLogs;
}
