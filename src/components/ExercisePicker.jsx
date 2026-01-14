import { useMemo, useState } from "react";
import { bodyParts } from "../data/bodyParts.js";
import { searchExercises } from "../lib/exerciseSearch.js";

export default function ExercisePicker({
  initialBodyPart = null,
  recentExercises = [],
  exercises = [],
  onSelect = () => {},
  onAdd = () => {},
  loading = false,
  error = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState(initialBodyPart);

  const filteredExercises = useMemo(() => {
    const scoped = selectedPart
      ? exercises.filter((exercise) => exercise.body_part === selectedPart)
      : exercises;
    return searchExercises(searchQuery, scoped);
  }, [selectedPart, exercises, searchQuery]);

  const bodyPartLabel =
    bodyParts.find((part) => part.key === selectedPart)?.label ?? "全部";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          className={`chip ${!selectedPart ? "chip-selected" : ""}`}
          type="button"
          onClick={() => setSelectedPart(null)}
        >
          全部
        </button>
        {bodyParts.map((part) => (
          <button
            className={`chip ${selectedPart === part.key ? "chip-selected" : ""}`}
            key={part.key}
            type="button"
            onClick={() => setSelectedPart(part.key)}
          >
            {part.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          className="input !pl-11"
          placeholder="搜索动作..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <svg
          className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {!searchQuery && recentExercises.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            最近使用
          </p>
          <div className="space-y-2">
            {recentExercises.map((exercise) => (
              <button
                className="card card-interactive flex w-full items-center justify-between text-left"
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise)}
              >
                <span className="font-semibold text-text-primary">{exercise.name}</span>
                <span className="badge text-[10px]">最近</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          {selectedPart ? `${bodyPartLabel}动作` : "全部动作"}
        </p>
        <div className="space-y-2">
          {loading && (
            <div className="empty-state py-8">
              <div className="loading-spinner" />
            </div>
          )}
          {error && !loading && (
            <p className="py-4 text-center text-sm text-danger">{error}</p>
          )}
          {!loading &&
            !error &&
            filteredExercises.map((exercise) => (
              <button
                className="card card-interactive flex w-full items-center justify-between text-left"
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{exercise.name}</span>
                  {!selectedPart && (
                    <span className="text-xs text-text-tertiary">
                      {bodyParts.find((p) => p.key === exercise.body_part)?.label}
                    </span>
                  )}
                </div>
                {!exercise.is_preset && (
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    自定义
                  </span>
                )}
              </button>
            ))}
          {!loading && !error && filteredExercises.length === 0 && (
            <p className="py-8 text-center text-sm text-text-secondary">没有匹配的动作</p>
          )}
        </div>
      </section>

      <button
        className="w-full rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary transition-all active:scale-[0.98] active:bg-primary/10"
        type="button"
        onClick={onAdd}
      >
        + 添加新动作
      </button>
    </div>
  );
}
