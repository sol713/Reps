import SetRow from "../../../components/SetRow.jsx";

export default function CompletedSets({
  sets,
  groups,
  currentExercise,
  exercises,
  loading,
  error,
  onSelectExercise,
  onDeleteSet,
  onEditSet,
  onViewNote,
  onViewPhoto
}) {
  if (sets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg text-text-primary">已完成</h3>
        <span className="chip bg-success/10 text-success border border-success/20 font-bold">
          {sets.length} 组
        </span>
      </div>
      
      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
        </div>
      ) : error ? (
        <div className="empty-state">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : (
        groups.map((group) => {
          const isCurrentExercise = currentExercise?.id === group.exerciseId;
          return (
            <div className="animate-fade-in" key={group.exerciseId}>
              <button
                className="card card-interactive mb-2 flex w-full items-center justify-between p-4"
                type="button"
                onClick={() => {
                  if (isCurrentExercise) {
                    onSelectExercise(null);
                  } else {
                    const ex = exercises.find((e) => e.id === group.exerciseId);
                    if (ex) {
                      onSelectExercise(ex);
                    }
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isCurrentExercise ? "bg-primary text-white" : "bg-bg-tertiary text-text-tertiary"}`}>
                    <svg
                      className={`h-4 w-4 transition-transform ${isCurrentExercise ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span className={`font-bold ${isCurrentExercise ? "text-primary" : "text-text-primary"}`}>
                    {group.exerciseName}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-secondary bg-bg-tertiary px-2 py-1 rounded-md">
                  {group.sets.length} 组
                </span>
              </button>
              
              {isCurrentExercise && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-primary/20 ml-4">
                  {group.sets.map((set) => (
                    <SetRow
                      key={set.id}
                      set={set}
                      onDelete={onDeleteSet}
                      onEdit={onEditSet}
                      onViewNote={onViewNote}
                      onViewPhoto={onViewPhoto}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
