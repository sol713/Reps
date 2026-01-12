import { useEffect } from "react";
import Modal from "./Modal.jsx";
import { hapticFeedback } from "../lib/haptics.js";

export default function PRCelebrationModal({ pr, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      hapticFeedback("heavy");
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
