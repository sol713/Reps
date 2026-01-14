import { Children, cloneElement } from "react";

export default function StaggerList({ children, className = "" }) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (!child) return null;
        const delayClass = `stagger-delay-${Math.min(index + 1, 8)}`;
        return cloneElement(child, {
          className: `${child.props.className || ""} animate-stagger ${delayClass}`.trim()
        });
      })}
    </div>
  );
}
