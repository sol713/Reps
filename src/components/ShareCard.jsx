import { useRef, useState } from "react";
import { hapticFeedback } from "../lib/haptics.js";

export default function ShareCard({
  isOpen,
  onClose,
  stats,
  streak = 0,
  newPRs = [],
  date
}) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedDate = new Date(date).toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  const handleShare = async () => {
    if (!cardRef.current || sharing) return;

    setSharing(true);
    hapticFeedback("medium");

    try {
      if (navigator.share) {
        const shareText = generateShareText(stats, streak, newPRs, formattedDate);
        await navigator.share({
          title: "Reps 训练记录",
          text: shareText
        });
      } else {
        await copyToClipboard();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        await copyToClipboard();
      }
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = async () => {
    const shareText = generateShareText(stats, streak, newPRs, formattedDate);
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      hapticFeedback("success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-sm animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={cardRef}
          className="overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          }}
        >
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">训练完成</p>
                <p className="text-lg font-bold text-white">{formattedDate}</p>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-sm font-bold text-white">
                  <span>🔥</span>
                  <span>{streak} 天</span>
                </div>
              )}
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              <StatBox label="动作" value={stats.exerciseCount} />
              <StatBox label="组数" value={stats.totalSets} />
              <StatBox label="总容量" value={formatVolume(stats.totalVolume)} unit="kg" />
            </div>

            {stats.bodyParts?.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                  训练部位
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.bodyParts.map((part) => (
                    <span
                      key={part}
                      className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {newPRs.length > 0 && (
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-bold text-yellow-400">
                    新纪录 ×{newPRs.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {newPRs.slice(0, 3).map((pr, index) => (
                    <p key={index} className="text-sm text-white/80">
                      {pr.exerciseName}: {pr.weight}kg
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white">
                  R
                </div>
                <span className="text-sm font-medium text-white/60">Reps</span>
              </div>
              <p className="text-xs text-white/40">每一次训练都是进步</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            className="btn flex-1 bg-white/10 text-white backdrop-blur"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
          <button
            className="btn btn-primary flex-1"
            type="button"
            disabled={sharing}
            onClick={handleShare}
          >
            {copied ? "已复制 ✓" : sharing ? "分享中..." : "分享 📤"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, unit }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 text-center backdrop-blur">
      <p className="text-2xl font-bold text-white">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-white/60">{unit}</span>}
      </p>
      <p className="mt-1 text-xs font-medium text-white/50">{label}</p>
    </div>
  );
}

function formatVolume(volume) {
  if (!volume) return "0";
  if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + "k";
  }
  return Math.round(volume).toString();
}

function generateShareText(stats, streak, newPRs, date) {
  let text = `💪 ${date} 训练完成！\n\n`;
  text += `📊 ${stats.exerciseCount} 个动作 | ${stats.totalSets} 组 | ${Math.round(stats.totalVolume || 0)}kg 总容量\n`;

  if (stats.bodyParts?.length > 0) {
    text += `🎯 训练部位: ${stats.bodyParts.join("、")}\n`;
  }

  if (streak > 0) {
    text += `🔥 连续训练 ${streak} 天\n`;
  }

  if (newPRs.length > 0) {
    text += `\n🏆 新纪录:\n`;
    newPRs.forEach((pr) => {
      text += `  • ${pr.exerciseName}: ${pr.weight}kg\n`;
    });
  }

  text += `\n#Reps #健身打卡`;
  return text;
}
