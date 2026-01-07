import { useEffect, useState } from "react";

export function useTimer(initialSeconds = 60) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      return undefined;
    }

    const id = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, seconds]);

  const start = () => {
    setSeconds(initialSeconds);
    setIsRunning(true);
  };
  const stop = () => setIsRunning(false);
  const skip = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return {
    seconds,
    isRunning,
    start,
    stop,
    skip
  };
}
