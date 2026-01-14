import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomSheet from "../components/BottomSheet.jsx";
import WorkoutCalendar from "../components/WorkoutCalendar.jsx";
import { useTemplates } from "../hooks/useTemplates.js";
import { useWorkoutPlans } from "../hooks/useWorkoutPlans.js";
import { hapticFeedback } from "../lib/haptics.js";

export default function Plans() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(null);

  const dateRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    };
  }, []);

  const { templates, loading: templatesLoading } = useTemplates();
  const {
    plans,
    loading: plansLoading,
    addPlan,
    deletePlan,
    toggleComplete,
    getPlansByDate
  } = useWorkoutPlans(dateRange.start, dateRange.end);

  const selectedDatePlans = useMemo(() => {
    if (!selectedDate) return [];
    return getPlansByDate(selectedDate);
  }, [selectedDate, getPlansByDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    hapticFeedback("light");
  };

  const handleAddPlan = async (template) => {
    if (!selectedDate || !template) return;

    await addPlan(template.id, selectedDate);
    setShowTemplateSheet(false);
    hapticFeedback("success");
  };

  const handleDeletePlan = async (planId) => {
    await deletePlan(planId);
    setShowPlanDetails(null);
    hapticFeedback("medium");
  };

  const handleToggleComplete = async (planId) => {
    await toggleComplete(planId);
    hapticFeedback("light");
  };

  const handleStartWorkout = (plan) => {
    const template = templates.find((t) => t.id === plan.templateId);
    if (template) {
      navigate("/", { state: { template } });
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
    return `${month}月${day}日 ${weekday}`;
  };

  const activeTemplates = templates.filter((t) => !t.isArchived);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          训练安排
        </p>
        <h1 className="text-3xl font-bold text-gradient">训练计划</h1>
      </header>

      <section className="card">
        <WorkoutCalendar
          plans={plans}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onPlanClick={setShowPlanDetails}
        />
      </section>

      {selectedDate && (
        <section className="card animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-text-primary">{formatDate(selectedDate)}</h3>
            <button
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-primary-dark active:scale-95"
              type="button"
              onClick={() => setShowTemplateSheet(true)}
            >
              + 添加计划
            </button>
          </div>

          {selectedDatePlans.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-secondary">
              暂无训练计划
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDatePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    plan.completed
                      ? "border-success/20 bg-success/5"
                      : "border-border-primary bg-bg-tertiary/50"
                  }`}
                >
                  <button
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      plan.completed
                        ? "border-success bg-success text-white"
                        : "border-text-tertiary hover:border-primary"
                    }`}
                    type="button"
                    onClick={() => handleToggleComplete(plan.id)}
                  >
                    {plan.completed && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div
                    className="h-8 w-1 rounded-full"
                    style={{ backgroundColor: plan.templateColor }}
                  />

                  <div className="flex-1">
                    <p className={`font-medium ${plan.completed ? "text-text-secondary line-through" : "text-text-primary"}`}>
                      {plan.templateName}
                    </p>
                  </div>

                  <button
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 active:scale-95"
                    type="button"
                    onClick={() => handleStartWorkout(plan)}
                  >
                    开始
                  </button>

                  <button
                    className="rounded-lg p-1.5 text-text-tertiary transition-all hover:bg-danger/10 hover:text-danger"
                    type="button"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <BottomSheet
        isOpen={showTemplateSheet}
        title="选择模板"
        onClose={() => setShowTemplateSheet(false)}
      >
        <div className="space-y-2 pb-4">
          {templatesLoading ? (
            <p className="py-4 text-center text-sm text-text-secondary">加载中...</p>
          ) : activeTemplates.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-text-secondary">暂无训练模板</p>
              <button
                className="mt-4 text-sm text-primary"
                type="button"
                onClick={() => {
                  setShowTemplateSheet(false);
                  navigate("/templates");
                }}
              >
                去创建模板 →
              </button>
            </div>
          ) : (
            activeTemplates.map((template) => (
              <button
                key={template.id}
                className="flex w-full items-center gap-3 rounded-xl bg-bg-secondary p-4 text-left transition-all active:bg-bg-tertiary"
                type="button"
                onClick={() => handleAddPlan(template)}
              >
                <div
                  className="h-10 w-1 rounded-full"
                  style={{ backgroundColor: template.color }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{template.name}</p>
                  <p className="text-sm text-text-secondary">
                    {template.exercises?.length || 0} 个动作
                  </p>
                </div>
                <svg className="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ))
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
