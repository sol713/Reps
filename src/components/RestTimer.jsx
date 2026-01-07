import { useEffect, useState } from "react";
import { formatDuration } from "../lib/date.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function RestTimer({
  duration = 60,
  onComplete = () => { },
  onSkip = () => { }
}) {
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setRemaining(duration);
    setIsPaused(false);
  }, [duration]);

  useEffect(() => {
    if (isPaused || remaining <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
          hapticFeedback("timerEnd");
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onComplete, remaining]);

  const progress = ((duration - remaining) / duration) * 100;

  return (
    <div className="glass rounded-card border border-white/20 p-4 shadow-floating">
      <div className="h-2 w-full overflow-hidden rounded-full bg-app-divider/50">
        <div
          className="progress-bar h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
            休息中
          </p>
          <p className={`text-2xl font-bold tabular-nums ${remaining <= 10 ? "animate-pulse-soft text-app-danger" : "text-app-text"}`}>
            {remaining > 0 ? formatDuration(remaining) : "已完成"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-button border border-app-divider bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-app-muted shadow-sm transition-all duration-150 hover:border-app-muted hover:bg-gray-50 active:scale-95"
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? "继续" : "暂停"}
          </button>
          <button
            className="btn-primary rounded-button px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
            type="button"
            onClick={() => {
              setIsPaused(true);
              setRemaining(0);
              onSkip();
            }}
          >
            跳过
          </button>
        </div>
      </div>
    </div>
  );
}
