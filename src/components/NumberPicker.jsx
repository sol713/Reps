import { hapticTick } from "../lib/haptics.js";
import { clamp } from "../lib/math.js";

export default function NumberPicker({
  label,
  value = 0,
  onChange = () => {},
  unit,
  step = 1,
  min = 0,
  max = 100,
  precision = 0
}) {
  const handleAdjust = (nextValue) => {
    const rounded = precision > 0 
      ? Number(nextValue.toFixed(precision)) 
      : Math.round(nextValue);
    const adjusted = clamp(rounded, min, max);
    if (adjusted !== value) {
      hapticTick();
    }
    onChange(adjusted);
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums text-text-primary">
            {value}
          </span>
          <span className="text-sm font-medium text-text-secondary">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-xl font-semibold text-primary transition-all active:scale-90 active:bg-bg-tertiary"
          type="button"
          aria-label={`减少${label}`}
          onClick={() => handleAdjust(value - step)}
        >
          −
        </button>
        <input
          className="flex-1"
          max={max}
          min={min}
          step={step}
          type="range"
          value={value}
          onChange={(event) => handleAdjust(Number(event.target.value))}
        />
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-xl font-semibold text-primary transition-all active:scale-90 active:bg-bg-tertiary"
          type="button"
          aria-label={`增加${label}`}
          onClick={() => handleAdjust(value + step)}
        >
          +
        </button>
      </div>
    </div>
  );
}
