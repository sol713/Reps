import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  {
    path: "/",
    label: "训练",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" />
        <path d="M3 20.25V19a7 7 0 0 1 7-7h0" />
        <path d="M15.5 12l2.5 2.5 4-4" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 18a6 6 0 0 1 6-6h.5a1 1 0 0 1 0 2H10a4 4 0 0 0-4 4v1a1 1 0 0 1-2 0v-1zm17.707-4.293a1 1 0 0 0-1.414-1.414L17 15.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" />
      </svg>
    ),
  },
  {
    path: "/stats",
    label: "统计",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3a1 1 0 0 1 1 1v16h17a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm15 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1zm-5-4a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm-5 8a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    path: "/history",
    label: "历史",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 10a1 1 0 0 1-.553.894l-4 2a1 1 0 0 1-.894-1.788L11 11.382V6a1 1 0 1 1 2 0v6z" />
      </svg>
    ),
  },
  {
    path: "/exercises",
    label: "动作库",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" />
        <path d="M8 11h6" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6.5zM8 6h8a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2zm0 4h6a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2z" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`tab-bar-item ${active ? "tab-bar-item-active" : ""}`}
          >
            <span className="tab-bar-icon">
              {active ? tab.iconActive : tab.icon}
            </span>
            <span className="tab-bar-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
