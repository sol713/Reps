import { useMemo } from "react";
import { calculateProgressionSuggestion, formatSuggestionMessage } from "../lib/progression.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function QuickRecordPanel({
  exerciseHistory,
  currentWeight,
  currentReps,
  onApply,
  onQuickRecord,
  settings = {}
}) {
  const suggestion = useMemo(
    () => calculateProgressionSuggestion(exerciseHistory, settings),
    [exerciseHistory, settings]
  );

  const suggestionMessage = useMemo(
    () => formatSuggestionMessage(suggestion),
    [suggestion]
  );

  const lastSet = exerciseHistory?.[0];

  if (!lastSet && !suggestion) {
    return null;
  }

  const handleQuickApply = (weight, reps) => {
    hapticFeedback("light");
    onApply(weight, reps);
  };

  const handleQuickRecord = (weight, reps) => {
    hapticFeedback("success");
    if (onQuickRecord) {
      onQuickRecord(weight, reps);
    }
  };

  const isCurrentSameAsLast =
    lastSet &&
    lastSet.set_type === "normal" &&
    currentWeight === lastSet.weight &&
    currentReps === lastSet.reps;

  const isCurrentSameAsSuggestion =
    suggestion &&
    currentWeight === suggestion.suggestedWeight &&
    currentReps === suggestion.suggestedReps;

  return (
    <div className="space-y-2">
      {lastSet && lastSet.set_type === "normal" && (
        <div className="flex gap-2">
          <button
            className="flex flex-1 items-center gap-3 rounded-xl bg-bg-secondary p-3 text-left transition-all active:scale-[0.98]"
            type="button"
            onClick={() => handleQuickApply(lastSet.weight, lastSet.reps)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tertiary text-lg">
              🔄
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {lastSet.weight}kg × {lastSet.reps}
              </p>
              <p className="text-xs text-text-tertiary">上次数据</p>
            </div>
          </button>
          {onQuickRecord && (
            <button
              className="flex items-center justify-center rounded-xl bg-primary px-4 text-white transition-all active:scale-[0.98]"
              type="button"
              onClick={() => handleQuickRecord(lastSet.weight, lastSet.reps)}
            >
              <div className="text-center">
                <p className="text-lg font-bold">✓</p>
                <p className="text-[10px]">记录</p>
              </div>
            </button>
          )}
        </div>
      )}

      {suggestion && suggestionMessage && !isCurrentSameAsSuggestion && (
        <div className="flex gap-2">
          <button
            className="flex flex-1 items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-left transition-all active:scale-[0.98]"
            type="button"
            onClick={() =>
              handleQuickApply(suggestion.suggestedWeight, suggestion.suggestedReps)
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {suggestionMessage.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {suggestionMessage.primary}
              </p>
              <p className="text-xs text-text-secondary">{suggestionMessage.secondary}</p>
            </div>
          </button>
          {onQuickRecord && (
            <button
              className="flex items-center justify-center rounded-xl bg-primary/10 px-4 text-primary transition-all active:scale-[0.98]"
              type="button"
              onClick={() => handleQuickRecord(suggestion.suggestedWeight, suggestion.suggestedReps)}
            >
              <div className="text-center">
                <p className="text-lg font-bold">✓</p>
                <p className="text-[10px]">记录</p>
              </div>
            </button>
          )}
        </div>
      )}

      {suggestion?.stats && (
        <div className="flex gap-2 overflow-x-auto py-1 text-xs">
          <StatPill label="平均" value={`${suggestion.stats.avgWeight}kg`} />
          <StatPill label="最大" value={`${suggestion.stats.maxWeight}kg`} />
          <StatPill label="平均次数" value={`${suggestion.stats.avgReps}`} />
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="flex-shrink-0 rounded-full bg-bg-secondary px-3 py-1.5">
      <span className="text-text-tertiary">{label}: </span>
      <span className="font-medium text-text-secondary">{value}</span>
    </div>
  );
}
