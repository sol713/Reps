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
      <div className="space-y-4 text-center">
        <div className="text-4xl">💪</div>
        <h3 className="text-xl font-bold text-text-primary">今日训练完成！</h3>
        
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-bg-secondary p-4">
          <div>
            <p className="text-xs text-text-secondary">训练部位</p>
            <p className="mt-1 font-semibold text-text-primary">
              {todayStats.bodyParts.join("、") || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">动作</p>
            <p className="mt-1 font-semibold text-text-primary">{todayStats.exerciseCount}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">总组数</p>
            <p className="mt-1 font-semibold text-text-primary">{todayStats.totalSets}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">总容量</p>
            <p className="mt-1 font-semibold text-text-primary">
              {formatVolume(todayStats.totalVolume)}
            </p>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          {yesterdayStats === undefined && (
            <p className="text-text-secondary">对比加载中...</p>
          )}
          {yesterdayStats === null && (
            <p className="text-text-secondary">昨天休息，今天真棒！</p>
          )}
          {yesterdayStats && setsDiff !== 0 && (
            <p className={setsDiff > 0 ? "text-success" : "text-text-secondary"}>
              比昨天{setsDiff > 0 ? "多" : "少"} {Math.abs(setsDiff)} 组
            </p>
          )}
          {yesterdayStats && exercisesDiff !== 0 && (
            <p className="text-text-secondary">
              动作数变化 {exercisesDiff > 0 ? "+" : ""}
              {exercisesDiff}
            </p>
          )}
        </div>

        {streak > 0 && (
          <div className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white">
            🔥 连续第 {streak} 天
          </div>
        )}

        {newPRs.length > 0 && (
          <div className="rounded-lg border border-border-primary p-4 text-left">
            <p className="font-semibold text-text-primary">🎉 今日突破</p>
            <div className="mt-2 space-y-2">
              {newPRs.map((pr) => (
                <div className="flex items-center justify-between" key={pr.exerciseId}>
                  <span className="font-medium text-text-primary">{pr.exerciseName}</span>
                  <span className="text-sm text-primary font-semibold">{pr.weight}kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-primary w-full"
          type="button"
          onClick={onClose}
        >
          完成
        </button>
      </div>
    </Modal>
  );
}
