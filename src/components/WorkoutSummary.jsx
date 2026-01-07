export default function WorkoutSummary({ summary = {} }) {
  const {
    bodyPart = "-",
    exerciseCount = 0,
    setCount = 0
  } = summary;

  return (
    <div className="rounded-card bg-app-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
        Today Summary
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-input border border-app-divider px-2 py-3">
          <p className="text-xs text-app-muted">Body</p>
          <p className="text-sm font-semibold">{bodyPart}</p>
        </div>
        <div className="rounded-input border border-app-divider px-2 py-3">
          <p className="text-xs text-app-muted">Moves</p>
          <p className="text-sm font-semibold">{exerciseCount}</p>
        </div>
        <div className="rounded-input border border-app-divider px-2 py-3">
          <p className="text-xs text-app-muted">Sets</p>
          <p className="text-sm font-semibold">{setCount}</p>
        </div>
      </div>
    </div>
  );
}
