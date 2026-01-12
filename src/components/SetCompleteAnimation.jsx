import { useEffect } from "react";
import { hapticFeedback } from "../lib/haptics.js";

const particles = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  angle: `${(360 / 8) * index}deg`,
  color: ["#30D158", "#0A84FF", "#FF9F0A"][index % 3]
}));

export default function SetCompleteAnimation({ isVisible, onComplete = () => {} }) {
  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    hapticFeedback("success");
    const timer = setTimeout(() => {
      onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="complete-overlay" role="presentation">
      <span className="complete-ripple" />
      <span className="complete-check">✓</span>
      {particles.map((particle) => (
        <span
          className="complete-particle"
          key={particle.id}
          style={{ "--angle": particle.angle, backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}
