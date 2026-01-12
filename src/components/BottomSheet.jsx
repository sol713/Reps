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
        className={`fixed inset-0 z-40 glass-dark transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        role="presentation"
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] transform-gpu transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        style={{ transform: isOpen ? `translateY(${dragOffset}px)` : undefined }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="glass max-h-[85vh] overflow-y-auto rounded-t-[20px] border-t border-white/30 px-4 pb-8 pt-3 shadow-floating neo-surface-soft">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-app-divider/60" />
          {title && (
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-app-text">{title}</h3>
              <button
                className="rounded-full border border-app-divider bg-white/80 px-3 py-1.5 text-xs font-semibold text-app-muted shadow-sm transition-all duration-150 hover:bg-gray-100 active:scale-95 neo-surface-soft neo-pressable"
                type="button"
                onClick={onClose}
              >
                关闭
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
