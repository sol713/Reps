import { useCallback, useEffect, useRef, useState } from "react";
import { formatDuration } from "../lib/date.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function RestTimer({
  duration = 60,
  onComplete = () => {},
  onSkip = () => {}
}) {
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  
  const endTimeRef = useRef(Date.now() + duration * 1000);
  const onCompleteRef = useRef(onComplete);
  const onSkipRef = useRef(onSkip);
  
  onCompleteRef.current = onComplete;
  onSkipRef.current = onSkip;

  useEffect(() => {
    endTimeRef.current = Date.now() + duration * 1000;
    setRemaining(duration);
    setIsPaused(false);
  }, [duration]);

  useEffect(() => {
    if (isPaused || remaining <= 0) {
      return undefined;
    }

    const tick = () => {
      const now = Date.now();
      const msLeft = endTimeRef.current - now;
      const secondsLeft = Math.ceil(msLeft / 1000);

      if (secondsLeft <= 0) {
        setRemaining(0);
        hapticFeedback("timerEnd");
        onCompleteRef.current();
        return;
      }

      setRemaining(secondsLeft);
    };

    tick();
    const timer = setInterval(tick, 250);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isPaused, remaining <= 0]);

  const handlePause = useCallback(() => {
    setIsPaused((prev) => {
      if (prev) {
        endTimeRef.current = Date.now() + remaining * 1000;
      }
      return !prev;
    });
  }, [remaining]);

  const handleSkip = useCallback(() => {
    setIsPaused(true);
    setRemaining(0);
    onSkipRef.current();
  }, []);

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
            onClick={handlePause}
          >
            {isPaused ? "继续" : "暂停"}
          </button>
          <button
            className="btn btn-primary text-sm"
            type="button"
            onClick={handleSkip}
          >
            跳过
          </button>
        </div>
      </div>
    </div>
  );
}
