import { useRef, useState } from "react";
import { RPEBadge } from "./RPESelector.jsx";
import { NoteBadge } from "./SetNoteInput.jsx";
import { supabase } from "../lib/supabase.js";

function PhotoThumbnail({ photoPath, onClick }) {
  if (!photoPath) return null;

  const { data } = supabase.storage
    .from("workout-photos")
    .getPublicUrl(photoPath);

  return (
    <button
      type="button"
      className="h-8 w-8 overflow-hidden rounded-md"
      onClick={onClick}
    >
      <img
        src={data?.publicUrl}
        alt="训练照片"
        className="h-full w-full object-cover"
      />
    </button>
  );
}

export default function SetRow({ set, onDelete = () => {}, onEdit = () => {}, onViewNote = () => {}, onViewPhoto = () => {} }) {
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
    <div className="relative overflow-hidden rounded-lg border border-border-primary bg-bg-elevated">
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
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {set.set_number}
          </span>
          {set.set_type === "drop_set" ? (
            <div className="text-sm">
              <span className="mr-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                递减
              </span>
              <span className="text-text-primary">
                {set.segments?.map((segment, index) => (
                  <span key={`${segment.weight}-${segment.reps}-${index}`}>
                    <span className="font-bold">{segment.weight}</span>
                    <span className="text-text-secondary">kg</span>
                    <span className="mx-0.5 text-text-tertiary">×</span>
                    <span className="font-bold">{segment.reps}</span>
                    {index < (set.segments?.length ?? 0) - 1 && (
                      <span className="mx-1 text-text-tertiary">→</span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          ) : (
            <div className="text-sm">
              <span className="font-bold text-text-primary">{set.weight}</span>
              <span className="text-text-secondary">kg</span>
              <span className="mx-1 text-text-tertiary">×</span>
              <span className="font-bold text-text-primary">{set.reps}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="min-h-touch px-3 text-sm font-semibold text-primary transition-opacity active:opacity-70"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(set);
            }}
          >
            编辑
          </button>
          {set.photo_url && (
            <PhotoThumbnail
              photoPath={set.photo_url}
              onClick={(event) => {
                event.stopPropagation();
                onViewPhoto(set);
              }}
            />
          )}
          {set.rpe && <RPEBadge rpe={set.rpe} size="sm" />}
          {set.notes && (
            <NoteBadge
              note={set.notes}
              onClick={(event) => {
                event.stopPropagation();
                onViewNote(set);
              }}
            />
          )}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-sm text-success">
            ✓
          </span>
        </div>
      </div>
      {showDelete && (
        <button
          className="absolute right-0 top-0 flex h-full min-w-[80px] items-center justify-center bg-danger px-4 text-sm font-semibold text-white transition-all active:bg-red-700"
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
