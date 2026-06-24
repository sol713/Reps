import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../lib/haptics.js";

const QUICK_ACTIONS = [
  {
    id: "plans",
    label: "计划",
    path: "/plans",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    )
  },
  {
    id: "templates",
    label: "模板",
    path: "/templates",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
  {
    id: "history",
    label: "历史",
    path: "/history",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    id: "stats",
    label: "统计",
    path: "/stats",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  }
];

export default function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (action) => {
    hapticFeedback("light");
    navigate(action.path);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          className="group flex flex-col items-center gap-2 rounded-2xl bg-bg-secondary border border-border-primary py-3 transition-all active:scale-95 hover:border-border-secondary"
          type="button"
          onClick={() => handleAction(action)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary transition-colors group-hover:bg-text-primary group-hover:text-bg-primary">
            {action.icon}
          </span>
          <span className="text-xs font-medium text-text-secondary">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
