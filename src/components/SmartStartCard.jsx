import { bodyParts } from "../data/bodyParts.js";
import { formatDate } from "../lib/date.js";

export default function SmartStartCard({
  suggestedPart,
  lastWorkout,
  exerciseCount,
  onStart,
  onChangePart
}) {
  const partInfo = bodyParts.find((p) => p.key === suggestedPart);
  const partLabel = partInfo?.label ?? suggestedPart;

  return (
    <div className="smart-start-card">
      <div className="smart-start-header">
        <div className="smart-start-icon">⚡</div>
        <div className="smart-start-title">
          <span className="smart-start-label">今天练</span>
          <span className="smart-start-part">{partLabel}</span>
        </div>
      </div>

      {lastWorkout && (
        <div className="smart-start-info">
          <span className="smart-start-info-item">
            📅 上次: {formatDate(lastWorkout.date)}
          </span>
          <span className="smart-start-info-item">
            🎯 {exerciseCount} 个动作
          </span>
        </div>
      )}

      <div className="smart-start-actions">
        <button
          className="btn btn-primary smart-start-btn"
          type="button"
          onClick={onStart}
        >
          一键开始
        </button>
        <button
          className="btn btn-ghost smart-start-btn-alt"
          type="button"
          onClick={onChangePart}
        >
          换一个
        </button>
      </div>
    </div>
  );
}
