import { useEffect, useState } from "react";
import { RARITY_CONFIG } from "../data/achievements.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function AchievementUnlockModal({ achievement, isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setIsVisible(true);
      setShowConfetti(true);
      hapticFeedback("success");

      const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(confettiTimer);
    } else {
      setIsVisible(false);
      setShowConfetti(false);
    }
  }, [isOpen, achievement]);

  if (!isOpen || !achievement) return null;

  const rarity = RARITY_CONFIG[achievement.rarity];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-bg-elevated p-6 text-center"
        style={{
          animation: isVisible ? "achievement-pop 0.6s ease-out" : undefined,
          boxShadow: `0 0 60px ${rarity.color}40`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  backgroundColor: ["#FFD60A", "#FF453A", "#30D158", "#0A84FF", "#BF5AF2"][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  animation: `confetti-fall ${1.5 + Math.random()}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        )}

        <div
          className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
          style={{
            background: `linear-gradient(135deg, ${rarity.color}30, ${rarity.color}10)`,
            animation: "achievement-glow 2s ease-in-out infinite"
          }}
        >
          <span style={{ animation: "achievement-icon 0.6s ease-out 0.3s both" }}>
            {achievement.icon}
          </span>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${rarity.color}`,
              animation: "achievement-ring 0.8s ease-out"
            }}
          />
        </div>

        <div
          className="mb-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: rarity.color }}
        >
          成就解锁
        </div>

        <h2 className="mb-2 text-2xl font-bold text-text-primary">{achievement.name}</h2>

        <p className="mb-4 text-sm text-text-secondary">{achievement.description}</p>

        <div className="mb-6 flex items-center justify-center gap-4">
          <div
            className="rounded-full px-4 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: rarity.bgColor,
              color: rarity.color
            }}
          >
            {rarity.label}
          </div>
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <span>🏅</span>
            <span>+{achievement.points} 点</span>
          </div>
        </div>

        <button className="btn btn-primary w-full" type="button" onClick={onClose}>
          太棒了！
        </button>
      </div>
    </div>
  );
}
