import { useRef, useState } from "react";

export default function SetRow({ set, onDelete = () => { } }) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [showDelete, setShowDelete] = useState(false);

  const handleStart = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    startX.current = clientX;
  };

  const handleMove = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const delta = clientX - startX.current;
    if (delta < 0) {
      setOffset(Math.max(delta, -80));
    }
  };

  const handleEnd = () => {
    if (offset < -50) {
      setOffset(-80);
      setShowDelete(true);
    } else {
      setOffset(0);
      setShowDelete(false);
    }
  };

  const reset = () => {
    if (showDelete) {
      setOffset(0);
      setShowDelete(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-input border border-app-divider bg-app-card shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <div
        className="flex items-center justify-between px-4 py-3 transition-transform duration-150"
        style={{ transform: `translateX(${offset}px)` }}
        onClick={reset}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={(event) => event.buttons === 1 && handleMove(event)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-app-primary/10 text-xs font-bold text-app-primary">
            {set.set_number}
          </span>
          {set.set_type === "drop_set" ? (
            <div className="text-sm font-semibold">
              <span className="mr-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                递减组
              </span>
              <span className="text-app-text">
                {set.segments?.map((segment, index) => (
                  <span key={`${segment.weight}-${segment.reps}-${index}`}>
                    <span className="font-bold">{segment.weight}</span>
                    <span className="text-app-muted">kg</span>
                    <span className="mx-0.5 text-app-muted">×</span>
                    <span className="font-bold">{segment.reps}</span>
                    {index < (set.segments?.length ?? 0) - 1 && (
                      <span className="mx-1 text-app-muted">→</span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          ) : (
            <div className="text-sm">
              <span className="font-bold text-app-text">{set.weight}</span>
              <span className="text-app-muted">kg</span>
              <span className="mx-1 text-app-muted">×</span>
              <span className="font-bold text-app-text">{set.reps}</span>
            </div>
          )}
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-app-success/15 text-sm text-app-success">
          ✓
        </span>
      </div>
      {showDelete && (
        <button
          className="absolute right-0 top-0 flex h-full items-center justify-center bg-gradient-to-r from-red-500 to-red-600 px-5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-150 hover:from-red-600 hover:to-red-700 active:scale-95"
          type="button"
          onClick={() => {
            onDelete(set.id);
            setOffset(0);
            setShowDelete(false);
          }}
        >
          删除
        </button>
      )}
    </div>
  );
}
