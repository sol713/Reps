import { useMemo } from "react";
import { calculateProgressionSuggestion, formatSuggestionMessage } from "../lib/progression.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function QuickRecordPanel({
  exerciseHistory,
  currentWeight,
  currentReps,
  onApply,
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
      {lastSet && lastSet.set_type === "normal" && !isCurrentSameAsLast && (
        <button
          className="flex w-full items-center justify-between rounded-xl bg-bg-secondary p-3 text-left transition-all active:scale-[0.98]"
          type="button"
          onClick={() => handleQuickApply(lastSet.weight, lastSet.reps)}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tertiary text-lg">
              🔄
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">
                复制上次: {lastSet.weight}kg × {lastSet.reps}
              </p>
              <p className="text-xs text-text-tertiary">一键使用上次数据</p>
            </div>
          </div>
          <span className="text-primary">应用</span>
        </button>
      )}

      {suggestion && suggestionMessage && !isCurrentSameAsSuggestion && (
        <button
          className="flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-left transition-all active:scale-[0.98]"
          type="button"
          onClick={() =>
            handleQuickApply(suggestion.suggestedWeight, suggestion.suggestedReps)
          }
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {suggestionMessage.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">
                建议: {suggestionMessage.primary}
              </p>
              <p className="text-xs text-text-secondary">{suggestionMessage.secondary}</p>
            </div>
          </div>
          <span className="text-primary">应用</span>
        </button>
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
