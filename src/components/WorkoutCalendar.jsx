import { useMemo, useState } from "react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function WorkoutCalendar({ 
  plans = [], 
  onDateSelect, 
  onPlanClick,
  selectedDate 
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = new Date().toISOString().split("T")[0];

  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    for (let i = 0; i < startOffset; i++) {
      const prevDate = new Date(year, month, -startOffset + i + 1);
      days.push({
        date: prevDate.toISOString().split("T")[0],
        day: prevDate.getDate(),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date: date.toISOString().split("T")[0],
        day: i,
        isCurrentMonth: true
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate.toISOString().split("T")[0],
        day: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentMonth]);

  const plansByDate = useMemo(() => {
    const map = new Map();
    plans.forEach((plan) => {
      const existing = map.get(plan.plannedDate) || [];
      existing.push(plan);
      map.set(plan.plannedDate, existing);
    });
    return map;
  }, [plans]);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: newMonth };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: newMonth };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const monthLabel = `${currentMonth.year}年${currentMonth.month + 1}月`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          className="rounded-lg bg-bg-tertiary p-2 text-text-secondary transition-colors hover:bg-bg-secondary active:scale-95"
          type="button"
          onClick={goToPrevMonth}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-text-primary">{monthLabel}</h3>
          <button
            className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            type="button"
            onClick={goToToday}
          >
            今天
          </button>
        </div>

        <button
          className="rounded-lg bg-bg-tertiary p-2 text-text-secondary transition-colors hover:bg-bg-secondary active:scale-95"
          type="button"
          onClick={goToNextMonth}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-text-tertiary"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayInfo, index) => {
          const dayPlans = plansByDate.get(dayInfo.date) || [];
          const isToday = dayInfo.date === today;
          const isSelected = dayInfo.date === selectedDate;
          const hasPlans = dayPlans.length > 0;
          const allCompleted = hasPlans && dayPlans.every((p) => p.completed);

          return (
            <button
              key={index}
              className={`
                relative flex min-h-[48px] flex-col items-center justify-start rounded-xl p-1 transition-all
                ${dayInfo.isCurrentMonth ? "text-text-primary" : "text-text-tertiary"}
                ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-bg-primary" : ""}
                ${isSelected ? "bg-primary text-white" : "hover:bg-bg-tertiary"}
              `}
              type="button"
              onClick={() => onDateSelect?.(dayInfo.date)}
            >
              <span className={`text-sm font-medium ${isSelected ? "text-white" : ""}`}>
                {dayInfo.day}
              </span>

              {hasPlans && (
                <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                  {dayPlans.slice(0, 3).map((plan) => (
                    <div
                      key={plan.id}
                      className={`h-1.5 w-1.5 rounded-full ${plan.completed ? "opacity-50" : ""}`}
                      style={{ backgroundColor: isSelected ? "white" : plan.templateColor }}
                      title={plan.templateName}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanClick?.(plan);
                      }}
                    />
                  ))}
                </div>
              )}

              {allCompleted && (
                <div className={`absolute bottom-0.5 right-0.5 text-xs ${isSelected ? "text-white" : "text-success"}`}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
