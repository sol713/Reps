import Modal from "./Modal.jsx";
import { formatVolume } from "../lib/stats.js";

export default function WorkoutSummaryCard({
  isOpen,
  onClose,
  todayStats,
  yesterdayStats,
  streak,
  newPRs = []
}) {
  if (!todayStats) {
    return null;
  }

  const setsDiff = todayStats.totalSets - (yesterdayStats?.totalSets || 0);
  const exercisesDiff =
    todayStats.exerciseCount - (yesterdayStats?.exerciseCount || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="summary-modal">
        <div className="summary-icon">💪</div>
        <h3 className="text-lg font-bold text-app-text">今日训练完成！</h3>
        <div className="summary-grid">
          <div>
            <p className="text-xs text-app-muted">训练部位</p>
            <p className="text-sm font-semibold">
              {todayStats.bodyParts.join("、") || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-app-muted">动作</p>
            <p className="text-sm font-semibold">{todayStats.exerciseCount}</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">总组数</p>
            <p className="text-sm font-semibold">{todayStats.totalSets}</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">总容量</p>
            <p className="text-sm font-semibold">
              {formatVolume(todayStats.totalVolume)}
            </p>
          </div>
        </div>

        <div className="summary-compare">
          {yesterdayStats === undefined && (
            <p className="text-xs text-app-muted">对比加载中...</p>
          )}
          {yesterdayStats === null && (
            <p className="text-xs text-app-muted">昨天休息，今天真棒！</p>
          )}
          {yesterdayStats && setsDiff !== 0 && (
            <p
              className={`text-xs ${
                setsDiff > 0 ? "text-app-success" : "text-app-muted"
              }`}
            >
              比昨天{setsDiff > 0 ? "多" : "少"} {Math.abs(setsDiff)} 组
            </p>
          )}
          {yesterdayStats && exercisesDiff !== 0 && (
            <p className="text-xs text-app-muted">
              动作数变化 {exercisesDiff > 0 ? "+" : ""}
              {exercisesDiff}
            </p>
          )}
        </div>

        {streak > 0 && (
          <div className="summary-streak">🔥 连续第 {streak} 天</div>
        )}

        {newPRs.length > 0 && (
          <div className="summary-pr">
            <p className="text-xs font-semibold text-app-text">🎉 今日突破</p>
            <div className="mt-2 space-y-1">
              {newPRs.map((pr) => (
                <div className="summary-pr-item" key={pr.exerciseId}>
                  <span className="text-sm font-semibold">{pr.exerciseName}</span>
                  <span className="text-xs text-app-muted">{pr.weight}kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn-primary mt-4 w-full rounded-button px-4 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={onClose}
        >
          完成
        </button>
      </div>
    </Modal>
  );
}
