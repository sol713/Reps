import { hapticFeedback } from "../lib/haptics.js";

const RPE_OPTIONS = [
  { value: 6, label: "轻松", description: "还能做很多次" },
  { value: 7, label: "适中", description: "可以再做3-4次" },
  { value: 8, label: "有挑战", description: "可以再做2次" },
  { value: 9, label: "接近力竭", description: "只能再做1次" },
  { value: 10, label: "力竭", description: "无法再做一次" }
];

export default function RPESelector({ value, onChange, compact = false }) {
  const handleSelect = (rpeValue) => {
    hapticFeedback("light");
    if (value === rpeValue) {
      onChange(null);
    } else {
      onChange(rpeValue);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {RPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`rpe-chip ${isSelected ? "rpe-chip-selected" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.value}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rpe-selector">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          RPE (主观疲劳度)
        </p>
        {value && (
          <button
            type="button"
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            onClick={() => onChange(null)}
          >
            清除
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {RPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const isHigh = option.value >= 9;
          return (
            <button
              key={option.value}
              type="button"
              className={`rpe-chip flex-1 ${isSelected ? "rpe-chip-selected" : ""} ${isSelected && isHigh ? "rpe-chip-high" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className="text-base font-bold">{option.value}</span>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="mt-2 text-center text-sm text-text-secondary animate-fade-in">
          {RPE_OPTIONS.find((o) => o.value === value)?.label} - {RPE_OPTIONS.find((o) => o.value === value)?.description}
        </p>
      )}
    </div>
  );
}

export function RPEBadge({ rpe, size = "sm" }) {
  if (!rpe) return null;

  const isHigh = rpe >= 9;
  const sizeClass = size === "sm" ? "rpe-badge-sm" : "rpe-badge";

  return (
    <span className={`${sizeClass} ${isHigh ? "rpe-badge-high" : ""}`}>
      RPE {rpe}
    </span>
  );
}
