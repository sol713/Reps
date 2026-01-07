export default function SetCard({ setNumber = 1, weight = 0, reps = 0, onConfirm = () => {} }) {
  return (
    <div className="rounded-card bg-app-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
            Set {setNumber}
          </p>
          <p className="text-lg font-semibold">
            {weight} kg x {reps}
          </p>
        </div>
        <button
          className="rounded-button bg-app-success px-3 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={onConfirm}
        >
          Done
        </button>
      </div>
    </div>
  );
}
