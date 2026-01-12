import { useEffect, useRef, useState } from "react";

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
    }
  }, [isOpen]);

  const handlePointerDown = (event) => {
    startY.current = event.clientY;
    isDragging.current = true;
  };

  const handlePointerMove = (event) => {
    if (!isDragging.current) {
      return;
    }
    const delta = event.clientY - startY.current;
    setDragOffset(Math.max(delta, 0));
  };

  const handlePointerUp = () => {
    if (!isDragging.current) {
      return;
    }
    isDragging.current = false;
    if (dragOffset > 120) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        role="presentation"
        onClick={onClose}
        style={{ transition: "opacity 300ms ease" }}
      />
      <div
        className={`bottom-sheet-content ${isOpen ? "" : "translate-y-full"}`}
        style={{ 
          transform: isOpen ? `translateY(${dragOffset}px)` : undefined,
          transition: isOpen && dragOffset === 0 ? "transform 300ms ease" : undefined
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="bottom-sheet-handle" />
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <button
              className="btn-ghost min-h-[36px] px-3 py-1.5 text-sm font-semibold"
              type="button"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
