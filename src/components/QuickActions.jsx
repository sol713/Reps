import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../lib/haptics.js";

const QUICK_ACTIONS = [
  {
    id: "templates",
    label: "模板",
    icon: "📋",
    path: "/templates",
    color: "#0A84FF"
  },
  {
    id: "history",
    label: "历史",
    icon: "📅",
    path: "/history",
    color: "#30D158"
  },
  {
    id: "achievements",
    label: "成就",
    icon: "🏆",
    path: "/achievements",
    color: "#FFD60A"
  },
  {
    id: "stats",
    label: "统计",
    icon: "📊",
    path: "/stats",
    color: "#BF5AF2"
  }
];

export default function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (action) => {
    hapticFeedback("light");
    navigate(action.path);
  };

  return (
    <div className="flex justify-between gap-2">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-bg-secondary py-3 transition-all active:scale-95"
          type="button"
          onClick={() => handleAction(action)}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${action.color}15` }}
          >
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
