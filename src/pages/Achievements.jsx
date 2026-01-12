import { useMemo, useState } from "react";
import AchievementCard from "../components/AchievementCard.jsx";
import AchievementUnlockModal from "../components/AchievementUnlockModal.jsx";
import Modal from "../components/Modal.jsx";
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENTS,
  RARITY_CONFIG,
  calculateTotalPoints,
  getNextAchievements
} from "../data/achievements.js";
import { useAchievements } from "../hooks/useAchievements.js";

export default function Achievements() {
  const { unlockedIds, stats, loading, getProgress } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const totalPoints = useMemo(() => calculateTotalPoints(unlockedIds), [unlockedIds]);
  const nextAchievements = useMemo(
    () => getNextAchievements(unlockedIds, stats, 3),
    [unlockedIds, stats]
  );

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === "all") return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const categories = [
    { key: "all", label: "全部", icon: "🎯" },
    ...Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, value]) => ({
      key,
      label: value.label,
      icon: value.icon
    }))
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-tab-bar pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">成就</h1>
        <p className="text-sm text-text-secondary">解锁勋章，记录你的进步</p>
      </header>

      <section className="mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">成就点数</p>
            <p className="text-3xl font-bold text-primary">{totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">
              已解锁 {unlockedCount}/{totalCount}
            </p>
            <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {nextAchievements.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 font-semibold text-text-primary">即将解锁</h2>
          <div className="space-y-3">
            {nextAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={false}
                progress={achievement.progress}
                onClick={setSelectedAchievement}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mb-4">
        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`chip flex-shrink-0 ${
                selectedCategory === cat.key ? "chip-selected" : ""
              }`}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 pb-6">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const progress = getProgress(achievement.id);

          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={isUnlocked}
              progress={progress}
              onClick={setSelectedAchievement}
            />
          );
        })}
      </section>

      <Modal isOpen={Boolean(selectedAchievement)} onClose={() => setSelectedAchievement(null)}>
        {selectedAchievement && (
          <div className="space-y-4 text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
              style={{
                backgroundColor: RARITY_CONFIG[selectedAchievement.rarity].bgColor
              }}
            >
              {selectedAchievement.icon}
            </div>

            <div>
              <h3
                className="text-xl font-bold"
                style={{ color: RARITY_CONFIG[selectedAchievement.rarity].color }}
              >
                {selectedAchievement.name}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {selectedAchievement.description}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: RARITY_CONFIG[selectedAchievement.rarity].bgColor,
                  color: RARITY_CONFIG[selectedAchievement.rarity].color
                }}
              >
                {RARITY_CONFIG[selectedAchievement.rarity].label}
              </span>
              <span className="rounded-full bg-bg-secondary px-3 py-1 text-sm text-text-secondary">
                🏅 {selectedAchievement.points} 点
              </span>
            </div>

            {!unlockedIds.includes(selectedAchievement.id) && (
              <div className="rounded-xl bg-bg-secondary p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-text-secondary">进度</span>
                  <span className="font-medium text-text-primary">
                    {Math.round(getProgress(selectedAchievement.id))}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${getProgress(selectedAchievement.id)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              className="btn btn-secondary w-full"
              type="button"
              onClick={() => setSelectedAchievement(null)}
            >
              关闭
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
