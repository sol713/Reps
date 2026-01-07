import { useMemo, useState } from "react";
import { bodyParts } from "../data/bodyParts.js";
import { searchExercises } from "../lib/exerciseSearch.js";

export default function ExercisePicker({
  bodyPart,
  recentExercises = [],
  exercises = [],
  onSelect = () => {},
  onAdd = () => {},
  loading = false,
  error = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = useMemo(() => {
    const scoped = bodyPart
      ? exercises.filter((exercise) => exercise.body_part === bodyPart)
      : exercises;
    return searchExercises(searchQuery, scoped);
  }, [bodyPart, exercises, searchQuery]);

  const bodyPartLabel =
    bodyParts.find((part) => part.key === bodyPart)?.label ?? "全部";

  return (
    <div className="space-y-5">
      <label className="flex flex-col gap-2 rounded-input border border-app-divider bg-white px-4 py-3 shadow-card transition-shadow focus-within:border-app-primary focus-within:shadow-button">
        <span className="text-xs font-medium uppercase tracking-wider text-app-muted">搜索动作</span>
        <input
          autoFocus
          className="bg-transparent text-sm font-semibold text-app-text outline-none placeholder:text-app-muted/50"
          placeholder="搜索动作（支持简称）"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>

      {!searchQuery && recentExercises.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
            最近使用
          </p>
          <div className="space-y-2">
            {recentExercises.map((exercise) => (
              <button
                className="interactive-card flex w-full items-center justify-between rounded-input border border-app-divider bg-white px-4 py-3 text-left shadow-card"
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise)}
              >
                <span className="text-sm font-semibold text-app-text">{exercise.name}</span>
                <span className="rounded-full bg-app-primary/10 px-2 py-0.5 text-[10px] font-semibold text-app-primary">
                  最近
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
          {bodyPart ? `${bodyPartLabel}部动作` : "全部动作"}
        </p>
        <div className="space-y-2">
          {loading && (
            <p className="py-4 text-center text-sm text-app-muted">加载中...</p>
          )}
          {error && !loading && (
            <p className="py-4 text-center text-sm text-red-500">{error}</p>
          )}
          {!loading &&
            !error &&
            filteredExercises.map((exercise) => (
              <button
                className="interactive-card flex w-full items-center justify-between rounded-input border border-app-divider bg-white px-4 py-3 text-left shadow-card"
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise)}
              >
                <span className="text-sm font-semibold text-app-text">{exercise.name}</span>
                {!exercise.is_preset && (
                  <span className="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    自定义
                  </span>
                )}
              </button>
            ))}
          {!loading && !error && filteredExercises.length === 0 && (
            <p className="py-4 text-center text-sm text-app-muted">没有匹配的动作</p>
          )}
        </div>
      </section>

      <button
        className="w-full rounded-button border-2 border-dashed border-app-primary/40 bg-app-primary/5 px-4 py-3 text-sm font-semibold text-app-primary transition-all duration-200 hover:border-app-primary hover:bg-app-primary/10 active:scale-98"
        type="button"
        onClick={onAdd}
      >
        + 添加新动作
      </button>
    </div>
  );
}
