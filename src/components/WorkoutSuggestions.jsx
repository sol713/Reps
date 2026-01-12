import { useMemo, useState } from "react";
import BottomSheet from "../components/BottomSheet.jsx";
import { hapticFeedback } from "../lib/haptics.js";

const WORKOUT_SUGGESTIONS = [
  {
    id: "push",
    name: "推系训练",
    description: "胸、肩、三头",
    icon: "💪",
    color: "#FF6B6B",
    exercises: ["胸", "肩", "手臂"],
    duration: "45-60分钟",
    difficulty: "中等"
  },
  {
    id: "pull",
    name: "拉系训练",
    description: "背、二头",
    icon: "🔙",
    color: "#4ECDC4",
    exercises: ["背", "手臂"],
    duration: "45-60分钟",
    difficulty: "中等"
  },
  {
    id: "legs",
    name: "腿部训练",
    description: "股四头、腘绳肌、臀部",
    icon: "🦵",
    color: "#95E1D3",
    exercises: ["腿"],
    duration: "50-70分钟",
    difficulty: "高"
  },
  {
    id: "upper",
    name: "上肢综合",
    description: "胸背肩手臂",
    icon: "🏋️",
    color: "#F38181",
    exercises: ["胸", "背", "肩", "手臂"],
    duration: "60-75分钟",
    difficulty: "高"
  },
  {
    id: "full",
    name: "全身训练",
    description: "全身主要肌群",
    icon: "⚡",
    color: "#AA96DA",
    exercises: ["胸", "背", "腿", "肩"],
    duration: "60-90分钟",
    difficulty: "高"
  },
  {
    id: "core",
    name: "核心专项",
    description: "腹肌、下背",
    icon: "🎯",
    color: "#FCBAD3",
    exercises: ["核心"],
    duration: "20-30分钟",
    difficulty: "低"
  }
];

export default function WorkoutSuggestions({ lastWorkoutParts = [], onSelect }) {
  const [showDetails, setShowDetails] = useState(null);

  const suggestions = useMemo(() => {
    const sorted = [...WORKOUT_SUGGESTIONS].sort((a, b) => {
      const aRecent = a.exercises.some((e) => lastWorkoutParts.includes(e));
      const bRecent = b.exercises.some((e) => lastWorkoutParts.includes(e));

      if (aRecent && !bRecent) return 1;
      if (!aRecent && bRecent) return -1;
      return 0;
    });

    return sorted;
  }, [lastWorkoutParts]);

  const handleSelect = (suggestion) => {
    hapticFeedback("medium");
    onSelect?.(suggestion);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
        今日推荐
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {suggestions.slice(0, 4).map((suggestion) => {
          const isRecent = suggestion.exercises.some((e) =>
            lastWorkoutParts.includes(e)
          );

          return (
            <button
              key={suggestion.id}
              className="relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${suggestion.color}20, ${suggestion.color}05)`
              }}
              type="button"
              onClick={() => handleSelect(suggestion)}
            >
              {isRecent && (
                <div className="absolute right-2 top-2 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                  刚练过
                </div>
              )}

              <span className="text-2xl">{suggestion.icon}</span>

              <h4 className="mt-2 font-semibold text-text-primary">
                {suggestion.name}
              </h4>

              <p className="text-xs text-text-secondary">{suggestion.description}</p>

              <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                <span>⏱ {suggestion.duration}</span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="w-full rounded-xl bg-bg-secondary py-3 text-center text-sm text-text-secondary transition-colors active:bg-bg-tertiary"
        type="button"
        onClick={() => setShowDetails("all")}
      >
        查看全部训练计划 →
      </button>

      <BottomSheet
        isOpen={showDetails === "all"}
        title="训练计划"
        onClose={() => setShowDetails(null)}
      >
        <div className="space-y-3 pb-4">
          {WORKOUT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.id}
              className="flex w-full items-center gap-4 rounded-xl bg-bg-secondary p-4 text-left transition-all active:bg-bg-tertiary"
              type="button"
              onClick={() => {
                handleSelect(suggestion);
                setShowDetails(null);
              }}
            >
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${suggestion.color}20` }}
              >
                {suggestion.icon}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-text-primary">{suggestion.name}</h4>
                <p className="text-sm text-text-secondary">{suggestion.description}</p>
                <div className="mt-1 flex gap-3 text-xs text-text-tertiary">
                  <span>⏱ {suggestion.duration}</span>
                  <span>💪 {suggestion.difficulty}</span>
                </div>
              </div>

              <svg
                className="h-5 w-5 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
