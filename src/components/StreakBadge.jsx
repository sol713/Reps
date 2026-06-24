export default function StreakBadge({ streak }) {
  if (!streak) {
    return null;
  }

  return (
    <span className="streak-badge">
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 23c-3.6 0-8-3.1-8-8.6C4 9.3 9.4 2.5 11.3 1.1a1 1 0 0 1 1.4 0C14.6 2.5 20 9.3 20 14.4c0 5.5-4.4 8.6-8 8.6zm0-19.5C9.7 6.2 6 11.5 6 14.4 6 18.5 9 21 12 21s6-2.5 6-6.6c0-2.9-3.7-8.2-6-10.9z" />
        <path d="M12 19c-1.7 0-4-1.3-4-4.2 0-1.8 2-4.8 3.4-6.3a.8.8 0 0 1 1.2 0C14 9.9 16 13 16 14.8c0 2.9-2.3 4.2-4 4.2z" />
      </svg>
      <span className="font-semibold">{streak} 天</span>
    </span>
  );
}
