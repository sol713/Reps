import { useEffect, useState } from "react";

export default function AnimatedCounter({
  value,
  duration = 500,
  className = "",
  suffix = ""
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue === value) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const diff = value - startValue;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + diff * easeOutQuart;

      setDisplayValue(Math.round(current * 10) / 10);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={`${className} ${isAnimating ? "tabular-nums" : ""}`}>
      {typeof displayValue === "number" && Number.isInteger(displayValue)
        ? displayValue
        : displayValue.toFixed(1)}
      {suffix}
    </span>
  );
}
