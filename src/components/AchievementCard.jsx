import { RARITY_CONFIG } from "../data/achievements.js";

export default function AchievementCard({ achievement, isUnlocked, progress = 0, onClick }) {
  const rarity = RARITY_CONFIG[achievement.rarity];
  const isComplete = progress >= 100;

  return (
    <button
      className={`relative w-full rounded-xl border p-4 text-left transition-all ${
        isUnlocked
          ? "border-transparent bg-gradient-to-br from-bg-secondary to-bg-tertiary"
          : "border-border-primary bg-bg-elevated opacity-60"
      }`}
      style={{
        boxShadow: isUnlocked ? `0 4px 20px ${rarity.color}25` : undefined
      }}
      type="button"
      onClick={() => onClick?.(achievement)}
    >
      {isUnlocked && (
        <div
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: rarity.color }}
        >
          ✓
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{
            backgroundColor: isUnlocked ? rarity.bgColor : "var(--bg-tertiary)",
            filter: isUnlocked ? "none" : "grayscale(1)"
          }}
        >
          {achievement.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className="truncate font-semibold"
              style={{ color: isUnlocked ? rarity.color : "var(--text-secondary)" }}
            >
              {achievement.name}
            </h3>
            <span
              className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: rarity.bgColor,
                color: rarity.color
              }}
            >
              {rarity.label}
            </span>
          </div>

          <p className="mt-0.5 text-sm text-text-secondary">{achievement.description}</p>

          {!isUnlocked && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: isComplete ? rarity.color : "var(--color-primary)"
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-text-tertiary">{Math.round(progress)}%</p>
            </div>
          )}

          {isUnlocked && (
            <div className="mt-2 flex items-center gap-1 text-xs text-text-tertiary">
              <span>🏅</span>
              <span>+{achievement.points} 点</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
