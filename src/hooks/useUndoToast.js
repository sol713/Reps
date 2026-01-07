import { useEffect, useRef, useState } from "react";

export function useUndoToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showUndo = (message, onUndo, duration = 4000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ message, onUndo });
    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  };

  const handleUndo = () => {
    if (toast?.onUndo) {
      toast.onUndo();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(null);
  };

  const dismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(null);
  };

  return { toast, showUndo, handleUndo, dismiss };
}
