import { bodyParts } from "../data/bodyParts.js";

export default function BodyPartSelector({ options = [], selected, onChange }) {
  const availableParts = options.length
    ? bodyParts.filter((part) => options.includes(part.label))
    : bodyParts;

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex gap-2">
        {availableParts.map((part) => {
          const isSelected = selected === part.key;
          return (
            <button
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${isSelected
                  ? "btn-primary border-transparent text-white shadow-button"
                  : "border-app-divider bg-app-card text-app-text hover:border-app-muted hover:bg-gray-50 active:scale-95"
                }`}
              key={part.key}
              type="button"
              onClick={() => onChange(part.key)}
            >
              <span>{part.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
