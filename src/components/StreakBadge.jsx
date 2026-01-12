export default function StreakBadge({ streak }) {
  if (!streak) {
    return null;
  }

  const getFireEmoji = (days) => {
    if (days >= 30) return "🔥🔥🔥";
    if (days >= 14) return "🔥🔥";
    return "🔥";
  };

  return (
    <span className="streak-badge">
      <span>{getFireEmoji(streak)}</span>
      <span className="font-bold">{streak}</span>
      <span className="opacity-80">天</span>
    </span>
  );
}
