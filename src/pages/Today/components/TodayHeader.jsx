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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            {activeTemplate ? activeTemplate.name : "今日训练"}
          </p>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">{formatDate(today)}</h1>
          {todayLog?.startedAt && (
            <p className="text-sm font-medium text-text-secondary mt-1">
              已训练 {getWorkoutDuration() ?? 0} 分钟
            </p>
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
          <span className="text-xs font-medium text-text-secondary">
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
                background: 'var(--gradient-success)'
              }}
            />
          </div>
          <span className="text-xs font-medium text-text-secondary">
            {queueIndex + 1}/{exerciseQueue.length}
          </span>
        </div>
      )}
    </header>
  );
}
