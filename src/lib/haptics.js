const HAPTIC_PATTERNS = {
  light: { duration: 10 },
  medium: { duration: 25 },
  success: { pattern: [30, 50, 30] },
  heavy: { pattern: [50, 100, 50, 100, 50] },
  warning: { pattern: [100, 50, 100] },
  timerEnd: { pattern: [200, 100, 200] },
  tick: { duration: 5 }
};

let lastTickTime = 0;

export function hapticFeedback(type = "medium") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return false;
  }

  const pattern = HAPTIC_PATTERNS[type];
  if (!pattern) {
    return false;
  }

  if (pattern.pattern) {
    navigator.vibrate(pattern.pattern);
  } else {
    navigator.vibrate(pattern.duration);
  }

  return true;
}

export function hapticTick() {
  const now = Date.now();
  if (now - lastTickTime < 50) {
    return;
  }
  lastTickTime = now;
  hapticFeedback("tick");
}
