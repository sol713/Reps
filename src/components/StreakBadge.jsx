export default function StreakBadge({ streak }) {
  if (!streak) {
    return null;
  }

  const getFireEmoji = (days) => {
    if (days >= 30) {
      return "🔥🔥🔥";
    }
    if (days >= 14) {
      return "🔥🔥";
    }
    return "🔥";
  };

  return (
    <span className="streak-badge">
      <span className="streak-emoji">{getFireEmoji(streak)}</span>
      <span className="streak-number">{streak}</span>
      <span className="streak-label">天</span>
    </span>
  );
}
