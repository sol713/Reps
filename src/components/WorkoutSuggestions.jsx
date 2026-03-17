import { useMemo, useState } from "react";
import BottomSheet from "../components/BottomSheet.jsx";
import { hapticFeedback } from "../lib/haptics.js";

const WORKOUT_SUGGESTIONS = [
  {
    id: "push",
    name: "推系训练",
    description: "胸、肩、三头",
    exercises: ["胸", "肩", "手臂"],
    duration: "45-60min",
    difficulty: "中等",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
  },
  {
    id: "pull",
    name: "拉系训练",
    description: "背、二头",
    exercises: ["背", "手臂"],
    duration: "45-60min",
    difficulty: "中等",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" /><path d="M21 3l-7 7" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    )
  },
  {
    id: "legs",
    name: "腿部训练",
    description: "股四头、腘绳肌、臀部",
    exercises: ["腿"],
    duration: "50-70min",
    difficulty: "高",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 4v16" /><path d="M17 4v16" /><path d="M19 4H11a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H9" />
      </svg>
    )
  },
  {
    id: "upper",
    name: "上肢综合",
    description: "胸背肩手臂",
    exercises: ["胸", "背", "肩", "手臂"],
    duration: "60-75min",
    difficulty: "高",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2Z" />
        <path d="M13.5 6.5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2Z" />
        <path d="M4 10.5h16" /><path d="M6 10.5v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
        <path d="M4 10.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.5" /><path d="M20 10.5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2.5" />
      </svg>
    )
  },
  {
    id: "full",
    name: "全身训练",
    description: "全身主要肌群",
    exercises: ["胸", "背", "腿", "肩"],
    duration: "60-90min",
    difficulty: "高",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    )
  },
  {
    id: "core",
    name: "核心专项",
    description: "腹肌、下背",
    exercises: ["核心"],
    duration: "20-30min",
    difficulty: "低",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    )
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
      <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
        今日推荐
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {suggestions.slice(0, 4).map((suggestion) => {
          const isRecent = suggestion.exercises.some((e) =>
            lastWorkoutParts.includes(e)
          );

          return (
            <button
              key={suggestion.id}
              className="card card-interactive relative !p-4 text-left"
              type="button"
              onClick={() => handleSelect(suggestion)}
            >
              {isRecent && (
                <div className="absolute right-3 top-3 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                  刚练过
                </div>
              )}

              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary">
                {suggestion.icon}
              </span>

              <h4 className="mt-2.5 text-sm font-semibold text-text-primary">
                {suggestion.name}
              </h4>

              <p className="mt-0.5 text-xs text-text-tertiary">{suggestion.description}</p>

              <div className="mt-2 text-[11px] text-text-tertiary">
                {suggestion.duration}
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="w-full rounded-xl bg-bg-secondary border border-border-primary py-2.5 text-center text-sm font-medium text-text-secondary transition-all hover:border-border-secondary active:scale-[0.98]"
        type="button"
        onClick={() => setShowDetails("all")}
      >
        查看全部训练计划
        <svg className="ml-1 inline-block h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <BottomSheet
        isOpen={showDetails === "all"}
        title="训练计划"
        onClose={() => setShowDetails(null)}
      >
        <div className="space-y-2 pb-4">
          {WORKOUT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.id}
              className="flex w-full items-center gap-3 rounded-xl bg-bg-tertiary/50 p-3 text-left transition-all active:scale-[0.98]"
              type="button"
              onClick={() => {
                handleSelect(suggestion);
                setShowDetails(null);
              }}
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary">
                {suggestion.icon}
              </span>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-text-primary text-sm">{suggestion.name}</h4>
                <p className="text-xs text-text-tertiary">{suggestion.description}</p>
              </div>

              <svg
                className="h-4 w-4 flex-shrink-0 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
