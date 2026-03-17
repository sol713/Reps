import StreakBadge from "../../../components/StreakBadge.jsx";
import { formatDate } from "../../../lib/date.js";

export default function TodayHeader({
  today,
  activeTemplate,
  exerciseQueue,
  queueIndex,
  templateExerciseIndex,
  todayLog,
  getWorkoutDuration,
  streak
}) {
  return (
    <header>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {activeTemplate ? activeTemplate.name : "今日训练"}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-text-primary">
            {formatDate(today)}
          </h1>
          {todayLog?.startedAt && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              已训练 {getWorkoutDuration() ?? 0} 分钟
            </div>
          )}
        </div>
        <StreakBadge streak={streak} />
      </div>

      {activeTemplate && (
        <div className="mt-4 flex items-center gap-3">
          <div className="progress-bar flex-1">
            <div
              className="progress-bar-fill"
              style={{
                width: `${((templateExerciseIndex + 1) / activeTemplate.exercises.length) * 100}%`
              }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-text-secondary">
            {templateExerciseIndex + 1}/{activeTemplate.exercises.length}
          </span>
        </div>
      )}

      {!activeTemplate && exerciseQueue.length > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <div className="progress-bar flex-1">
            <div
              className="progress-bar-fill"
              style={{
                width: `${((queueIndex + 1) / exerciseQueue.length) * 100}%`,
                background: 'var(--color-success)'
              }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-text-secondary">
            {queueIndex + 1}/{exerciseQueue.length}
          </span>
        </div>
      )}
    </header>
  );
}
