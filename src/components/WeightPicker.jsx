import { hapticTick } from "../lib/haptics.js";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function WeightPicker({
  value = 0,
  onChange = () => {},
  unit = "kg",
  step = 2.5,
  min = 5,
  max = 50
}) {
  const handleAdjust = (nextValue) => {
    const adjusted = clamp(Number(nextValue.toFixed(2)), min, max);
    if (adjusted !== value) {
      hapticTick();
    }
    onChange(adjusted);
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          重量
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
          aria-label="减少重量"
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
          aria-label="增加重量"
          onClick={() => handleAdjust(value + step)}
        >
          +
        </button>
      </div>
    </div>
  );
}
