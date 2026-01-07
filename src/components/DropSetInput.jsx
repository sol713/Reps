export default function DropSetInput({
  segments = [],
  onAddSegment = () => { },
  onRemoveSegment = () => { },
  onUpdateSegment = () => { }
}) {
  return (
    <div className="rounded-card border border-app-divider bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
          递减组配置
        </p>
        <button
          className="rounded-button border border-app-divider bg-white px-3 py-1.5 text-xs font-semibold text-app-primary shadow-sm transition-all duration-150 hover:border-app-primary hover:bg-blue-50 active:scale-95"
          type="button"
          onClick={onAddSegment}
        >
          + 加一档
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {segments.map((segment, index) => (
          <div
            className="flex items-center gap-3 rounded-input border border-app-divider bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100"
            key={`${segment.weight}-${segment.reps}-${index}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold text-white">
              {index + 1}
            </span>
            <div className="flex flex-1 items-center gap-2">
              <input
                className="w-20 rounded-input border border-app-divider bg-white px-3 py-1.5 text-center text-sm font-bold text-app-text shadow-sm transition-all focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                min="0"
                type="number"
                value={segment.weight}
                onChange={(event) =>
                  onUpdateSegment(index, "weight", Number(event.target.value))
                }
              />
              <span className="text-xs text-app-muted">kg</span>
              <span className="text-lg text-app-muted">×</span>
              <input
                className="w-16 rounded-input border border-app-divider bg-white px-3 py-1.5 text-center text-sm font-bold text-app-text shadow-sm transition-all focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                min="0"
                type="number"
                value={segment.reps}
                onChange={(event) =>
                  onUpdateSegment(index, "reps", Number(event.target.value))
                }
              />
              <span className="text-xs text-app-muted">次</span>
            </div>
            {segments.length > 1 && (
              <button
                className="rounded-full p-1.5 text-app-muted transition-colors hover:bg-red-50 hover:text-red-500"
                type="button"
                onClick={() => onRemoveSegment(index)}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {segments.length === 0 && (
          <p className="py-4 text-center text-sm text-app-muted">点击"加一档"添加递减段</p>
        )}
      </div>
    </div>
  );
}
