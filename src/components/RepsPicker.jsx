function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function RepsPicker({
  value = 1,
  onChange = () => { },
  min = 1,
  max = 50
}) {
  const handleAdjust = (nextValue) => {
    const adjusted = clamp(Math.round(nextValue), min, max);
    onChange(adjusted);
  };

  return (
    <div className="flex flex-col gap-3 rounded-input border border-app-divider bg-app-card px-4 py-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
          次数
        </span>
        <span className="text-base font-bold tabular-nums text-app-text">
          {value} <span className="text-sm font-medium text-app-muted">次</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-app-divider bg-white text-lg font-semibold text-app-primary shadow-sm transition-all duration-150 hover:border-app-primary hover:bg-blue-50 active:scale-90 active:shadow-none"
          type="button"
          onClick={() => handleAdjust(value - 1)}
        >
          −
        </button>
        <input
          className="w-full"
          max={max}
          min={min}
          step="1"
          type="range"
          value={value}
          onChange={(event) => handleAdjust(Number(event.target.value))}
        />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-app-divider bg-white text-lg font-semibold text-app-primary shadow-sm transition-all duration-150 hover:border-app-primary hover:bg-blue-50 active:scale-90 active:shadow-none"
          type="button"
          onClick={() => handleAdjust(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
