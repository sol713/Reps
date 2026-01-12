export default function DropSetInput({
  segments = [],
  onAddSegment = () => {},
  onRemoveSegment = () => {},
  onUpdateSegment = () => {}
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          递减组配置
        </p>
        <button
          className="btn-ghost px-3 py-1.5 text-sm font-semibold"
          type="button"
          onClick={onAddSegment}
        >
          + 加一档
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {segments.map((segment, index) => (
          <div
            className="flex items-center gap-3 rounded-lg bg-bg-secondary px-4 py-3"
            key={`${segment.weight}-${segment.reps}-${index}`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-xs font-bold text-white">
              {index + 1}
            </span>
            <div className="flex flex-1 items-center gap-2">
              <input
                className="input w-20 px-2 py-1.5 text-center font-bold"
                min="5"
                max="50"
                step="2.5"
                type="number"
                value={segment.weight}
                onChange={(event) =>
                  onUpdateSegment(index, "weight", Number(event.target.value))
                }
              />
              <span className="text-sm text-text-secondary">kg</span>
              <span className="text-lg text-text-tertiary">×</span>
              <input
                className="input w-16 px-2 py-1.5 text-center font-bold"
                min="5"
                max="30"
                type="number"
                value={segment.reps}
                onChange={(event) =>
                  onUpdateSegment(index, "reps", Number(event.target.value))
                }
              />
              <span className="text-sm text-text-secondary">次</span>
            </div>
            {segments.length > 1 && (
              <button
                className="rounded-full p-2 text-text-tertiary transition-colors active:bg-danger/10 active:text-danger"
                type="button"
                onClick={() => onRemoveSegment(index)}
                aria-label="删除"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {segments.length === 0 && (
          <p className="py-4 text-center text-sm text-text-secondary">点击"加一档"添加递减段</p>
        )}
      </div>
    </div>
  );
}
