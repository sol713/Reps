function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateInput) {
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateInput);
}

export function getTodayIsoDate() {
  return toLocalIsoDate(new Date());
}

export function getYesterdayIsoDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toLocalIsoDate(date);
}

export function getPreviousDayIso(isoDate) {
  if (!isoDate) {
    return null;
  }
  const date = parseLocalDate(isoDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setDate(date.getDate() - 1);
  return toLocalIsoDate(date);
}

export function formatDate(dateInput) {
  const date = parseLocalDate(dateInput);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function formatShortDate(dateInput) {
  const date = parseLocalDate(dateInput);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric"
  }).format(date);
}

export function formatWeekday(dateInput) {
  const date = parseLocalDate(dateInput);
  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "short"
  }).format(date);
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
