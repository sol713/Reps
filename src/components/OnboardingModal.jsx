import { useEffect, useState } from "react";
import { hapticFeedback } from "../lib/haptics.js";

const STORAGE_KEY = "reps_onboarding_completed";

const STEPS = [
  {
    icon: "💪",
    title: "欢迎使用 Reps",
    description: "专业的力量训练记录工具，帮你追踪每一次进步"
  },
  {
    icon: "🎯",
    title: "选择动作",
    description: "从动作库中选择训练动作，或创建自定义动作"
  },
  {
    icon: "📊",
    title: "记录训练",
    description: "设置重量和次数，一键记录每一组训练"
  },
  {
    icon: "🏆",
    title: "突破记录",
    description: "系统自动检测个人记录，庆祝你的每次突破"
  },
  {
    icon: "🔥",
    title: "保持连续",
    description: "坚持训练，解锁成就，成为更强的自己"
  }
];

export default function OnboardingModal({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    hapticFeedback("light");
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="modal-overlay">
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-bg-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 text-center">
          <div className="mb-6 flex justify-center gap-1.5">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-bg-tertiary"
                }`}
              />
            ))}
          </div>

          <div
            className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 text-5xl"
            style={{ animation: "pop-in 0.4s ease-out" }}
            key={currentStep}
          >
            {step.icon}
          </div>

          <h2
            className="mb-2 text-xl font-bold text-text-primary"
            style={{ animation: "fade-in 0.3s ease-out 0.1s both" }}
            key={`title-${currentStep}`}
          >
            {step.title}
          </h2>

          <p
            className="text-text-secondary"
            style={{ animation: "fade-in 0.3s ease-out 0.2s both" }}
            key={`desc-${currentStep}`}
          >
            {step.description}
          </p>
        </div>

        <div className="flex gap-3 border-t border-border-primary p-4">
          {!isLastStep && (
            <button
              className="btn btn-ghost flex-1"
              type="button"
              onClick={handleSkip}
            >
              跳过
            </button>
          )}
          <button
            className="btn btn-primary flex-1"
            type="button"
            onClick={handleNext}
          >
            {isLastStep ? "开始训练" : "继续"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    setShowOnboarding(!completed);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}
