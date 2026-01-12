import { useEffect, useState } from "react";
import { formatDuration } from "../lib/date.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function RestTimer({
  duration = 60,
  onComplete = () => {},
  onSkip = () => {}
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
  const isWarning = remaining <= 10 && remaining > 0;

  return (
    <div className="rest-timer">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            休息中
          </p>
          <p className={`rest-timer-time ${isWarning ? "rest-timer-warning" : ""}`}>
            {remaining > 0 ? formatDuration(remaining) : "完成"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary text-sm"
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? "继续" : "暂停"}
          </button>
          <button
            className="btn btn-primary text-sm"
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
