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
      <div className="pr-modal">
        <div className="pr-trophy">🏆</div>
        <h3 className="text-lg font-bold text-app-text">新纪录！</h3>
        <p className="text-sm text-app-muted">{pr.exerciseName}</p>
        <div className="pr-weight">
          <span className="pr-weight-value">{pr.weight}</span>
          <span className="pr-weight-unit">kg</span>
        </div>
        <div className="pr-improvement">比之前 +{pr.improvement}kg</div>
        <p className="text-xs text-app-muted">之前记录：{pr.previousMax}kg</p>
        <button className="btn-primary mt-4 rounded-button px-4 py-2 text-sm font-semibold text-white" type="button" onClick={onClose}>
          太棒了！
        </button>
      </div>
    </Modal>
  );
}
