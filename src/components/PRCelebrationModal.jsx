import { useEffect } from "react";
import confetti from "canvas-confetti";
import Modal from "./Modal.jsx";
import { hapticFeedback } from "../lib/haptics.js";

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#ffd700", "#ff6b6b", "#4ecdc4", "#a855f7", "#3b82f6"]
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#ffd700", "#ff6b6b", "#4ecdc4", "#a855f7", "#3b82f6"]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export default function PRCelebrationModal({ pr, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      hapticFeedback("heavy");
      fireConfetti();
    }
  }, [isOpen]);

  if (!pr) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="pr-celebration">
        <div className="pr-trophy">🏆</div>
        <h3 className="mt-2 text-xl font-bold text-text-primary">新纪录！</h3>
        <p className="text-sm text-text-secondary">{pr.exerciseName}</p>
        <div className="pr-weight">
          <span className="pr-weight-value">{pr.weight}</span>
          <span className="pr-weight-unit">kg</span>
        </div>
        <p className="text-sm font-semibold text-success">比之前 +{pr.improvement}kg</p>
        <p className="mt-1 text-xs text-text-secondary">之前记录：{pr.previousMax}kg</p>
        <button 
          className="btn btn-primary mt-6 w-full" 
          type="button" 
          onClick={onClose}
        >
          太棒了！
        </button>
      </div>
    </Modal>
  );
}
