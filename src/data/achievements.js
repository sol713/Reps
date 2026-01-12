/**
 * 成就系统定义
 * 游戏化激励用户持续训练
 */

export const ACHIEVEMENT_CATEGORIES = {
  streak: { label: "坚持不懈", icon: "🔥", color: "#FF6B35" },
  volume: { label: "重量突破", icon: "🏋️", color: "#0A84FF" },
  consistency: { label: "训练达人", icon: "💪", color: "#30D158" },
  milestone: { label: "里程碑", icon: "🏆", color: "#FFD60A" },
  special: { label: "特殊成就", icon: "⭐", color: "#BF5AF2" }
};

export const ACHIEVEMENTS = [
  // ===== 连续训练系列 =====
  {
    id: "streak_3",
    category: "streak",
    name: "初露锋芒",
    description: "连续训练 3 天",
    icon: "🔥",
    requirement: { type: "streak", value: 3 },
    points: 10,
    rarity: "common"
  },
  {
    id: "streak_7",
    category: "streak",
    name: "一周战士",
    description: "连续训练 7 天",
    icon: "🗓️",
    requirement: { type: "streak", value: 7 },
    points: 25,
    rarity: "uncommon"
  },
  {
    id: "streak_14",
    category: "streak",
    name: "两周铁人",
    description: "连续训练 14 天",
    icon: "💎",
    requirement: { type: "streak", value: 14 },
    points: 50,
    rarity: "rare"
  },
  {
    id: "streak_30",
    category: "streak",
    name: "月度传奇",
    description: "连续训练 30 天",
    icon: "👑",
    requirement: { type: "streak", value: 30 },
    points: 100,
    rarity: "epic"
  },
  {
    id: "streak_100",
    category: "streak",
    name: "百日修行",
    description: "连续训练 100 天",
    icon: "🐉",
    requirement: { type: "streak", value: 100 },
    points: 500,
    rarity: "legendary"
  },

  // ===== 训练次数系列 =====
  {
    id: "workouts_1",
    category: "consistency",
    name: "起步",
    description: "完成第一次训练",
    icon: "🎯",
    requirement: { type: "total_workouts", value: 1 },
    points: 5,
    rarity: "common"
  },
  {
    id: "workouts_10",
    category: "consistency",
    name: "养成习惯",
    description: "累计完成 10 次训练",
    icon: "📈",
    requirement: { type: "total_workouts", value: 10 },
    points: 20,
    rarity: "common"
  },
  {
    id: "workouts_50",
    category: "consistency",
    name: "训练狂人",
    description: "累计完成 50 次训练",
    icon: "🔄",
    requirement: { type: "total_workouts", value: 50 },
    points: 75,
    rarity: "uncommon"
  },
  {
    id: "workouts_100",
    category: "consistency",
    name: "百战老兵",
    description: "累计完成 100 次训练",
    icon: "🎖️",
    requirement: { type: "total_workouts", value: 100 },
    points: 150,
    rarity: "rare"
  },
  {
    id: "workouts_365",
    category: "consistency",
    name: "年度之王",
    description: "累计完成 365 次训练",
    icon: "🏅",
    requirement: { type: "total_workouts", value: 365 },
    points: 500,
    rarity: "legendary"
  },

  // ===== 组数系列 =====
  {
    id: "sets_100",
    category: "volume",
    name: "百组达成",
    description: "累计完成 100 组训练",
    icon: "💯",
    requirement: { type: "total_sets", value: 100 },
    points: 30,
    rarity: "common"
  },
  {
    id: "sets_500",
    category: "volume",
    name: "五百斩",
    description: "累计完成 500 组训练",
    icon: "⚡",
    requirement: { type: "total_sets", value: 500 },
    points: 75,
    rarity: "uncommon"
  },
  {
    id: "sets_1000",
    category: "volume",
    name: "千组俱乐部",
    description: "累计完成 1000 组训练",
    icon: "🌟",
    requirement: { type: "total_sets", value: 1000 },
    points: 150,
    rarity: "rare"
  },
  {
    id: "sets_5000",
    category: "volume",
    name: "铁血训练家",
    description: "累计完成 5000 组训练",
    icon: "🦾",
    requirement: { type: "total_sets", value: 5000 },
    points: 400,
    rarity: "epic"
  },

  // ===== PR 系列 =====
  {
    id: "pr_1",
    category: "milestone",
    name: "突破自我",
    description: "创造第一个个人记录",
    icon: "🚀",
    requirement: { type: "total_prs", value: 1 },
    points: 15,
    rarity: "common"
  },
  {
    id: "pr_10",
    category: "milestone",
    name: "纪录收割机",
    description: "累计创造 10 个 PR",
    icon: "📊",
    requirement: { type: "total_prs", value: 10 },
    points: 50,
    rarity: "uncommon"
  },
  {
    id: "pr_50",
    category: "milestone",
    name: "突破大师",
    description: "累计创造 50 个 PR",
    icon: "🏆",
    requirement: { type: "total_prs", value: 50 },
    points: 150,
    rarity: "rare"
  },

  // ===== 总重量系列 =====
  {
    id: "volume_10000",
    category: "volume",
    name: "万斤之力",
    description: "累计举起 10,000 kg",
    icon: "🪨",
    requirement: { type: "total_volume", value: 10000 },
    points: 40,
    rarity: "common"
  },
  {
    id: "volume_100000",
    category: "volume",
    name: "十万大关",
    description: "累计举起 100,000 kg",
    icon: "🏔️",
    requirement: { type: "total_volume", value: 100000 },
    points: 100,
    rarity: "uncommon"
  },
  {
    id: "volume_500000",
    category: "volume",
    name: "半吨传说",
    description: "累计举起 500,000 kg",
    icon: "🌋",
    requirement: { type: "total_volume", value: 500000 },
    points: 250,
    rarity: "rare"
  },
  {
    id: "volume_1000000",
    category: "volume",
    name: "百万俱乐部",
    description: "累计举起 1,000,000 kg",
    icon: "🌍",
    requirement: { type: "total_volume", value: 1000000 },
    points: 500,
    rarity: "legendary"
  },

  // ===== 特殊成就 =====
  {
    id: "early_bird",
    category: "special",
    name: "早起的鸟儿",
    description: "在早上 6 点前开始训练",
    icon: "🌅",
    requirement: { type: "early_workout", value: 1 },
    points: 20,
    rarity: "uncommon"
  },
  {
    id: "night_owl",
    category: "special",
    name: "夜猫子",
    description: "在晚上 10 点后开始训练",
    icon: "🌙",
    requirement: { type: "late_workout", value: 1 },
    points: 20,
    rarity: "uncommon"
  },
  {
    id: "weekend_warrior",
    category: "special",
    name: "周末战士",
    description: "连续 4 个周末都有训练",
    icon: "🗡️",
    requirement: { type: "weekend_streak", value: 4 },
    points: 40,
    rarity: "uncommon"
  },
  {
    id: "variety_master",
    category: "special",
    name: "全面发展",
    description: "在一次训练中锻炼 5 个不同部位",
    icon: "🎨",
    requirement: { type: "body_parts_in_workout", value: 5 },
    points: 30,
    rarity: "uncommon"
  },
  {
    id: "marathon_session",
    category: "special",
    name: "马拉松训练",
    description: "单次训练超过 90 分钟",
    icon: "⏱️",
    requirement: { type: "workout_duration", value: 90 },
    points: 35,
    rarity: "uncommon"
  },
  {
    id: "perfect_week",
    category: "special",
    name: "完美一周",
    description: "一周内训练 6 天以上",
    icon: "✨",
    requirement: { type: "weekly_workouts", value: 6 },
    points: 60,
    rarity: "rare"
  }
];

export const RARITY_CONFIG = {
  common: { label: "普通", color: "#8E8E93", bgColor: "rgba(142, 142, 147, 0.15)" },
  uncommon: { label: "稀有", color: "#30D158", bgColor: "rgba(48, 209, 88, 0.15)" },
  rare: { label: "精良", color: "#0A84FF", bgColor: "rgba(10, 132, 255, 0.15)" },
  epic: { label: "史诗", color: "#BF5AF2", bgColor: "rgba(191, 90, 242, 0.15)" },
  legendary: { label: "传说", color: "#FFD60A", bgColor: "rgba(255, 214, 10, 0.15)" }
};

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category) {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function calculateTotalPoints(unlockedIds) {
  return ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).reduce(
    (sum, a) => sum + a.points,
    0
  );
}

export function getNextAchievements(unlockedIds, stats, limit = 3) {
  const locked = ACHIEVEMENTS.filter((a) => !unlockedIds.includes(a.id));
  
  // 计算每个成就的进度百分比
  const withProgress = locked.map((achievement) => {
    const progress = calculateProgress(achievement, stats);
    return { ...achievement, progress };
  });
  
  // 按进度排序，返回最接近解锁的成就
  return withProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
}

export function calculateProgress(achievement, stats) {
  const { type, value } = achievement.requirement;
  const current = stats[type] ?? 0;
  return Math.min((current / value) * 100, 100);
}
