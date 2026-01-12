import { bodyParts } from "../data/bodyParts.js";

export default function BodyPartSelector({ options = [], selected, onChange }) {
  const availableParts = options.length
    ? bodyParts.filter((part) => options.includes(part.label))
    : bodyParts;

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 hide-scrollbar">
      <div className="flex gap-2">
        {availableParts.map((part) => {
          const isSelected = selected === part.key;
          return (
            <button
              className={`chip whitespace-nowrap ${isSelected ? "chip-selected" : ""}`}
              key={part.key}
              type="button"
              onClick={() => onChange(part.key)}
            >
              {part.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
