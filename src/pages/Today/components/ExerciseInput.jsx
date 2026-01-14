import { useNavigate } from "react-router-dom";
import DropSetInput from "../../../components/DropSetInput.jsx";
import NumberPicker from "../../../components/NumberPicker.jsx";
import PhotoUploader from "../../../components/PhotoUploader.jsx";
import QuickRecordPanel from "../../../components/QuickRecordPanel.jsx";
import RPESelector from "../../../components/RPESelector.jsx";
import SetNoteInput from "../../../components/SetNoteInput.jsx";
import { WEIGHT, REPS, clampWeight, clampReps } from "../constants.js";

export default function ExerciseInput({
  currentExercise,
  weight,
  setWeight,
  reps,
  setReps,
  setType,
  setSetType,
  segments,
  setSegments,
  rpe,
  setRpe,
  setNotes,
  setSetNotes,
  photoPath,
  setPhotoPath,
  exerciseHistory,
  historyLoading,
  workoutLoading,
  onRecordSet,
  onQuickRecord,
  activeTemplate,
  templateExerciseIndex,
  exerciseQueue,
  queueIndex,
  onNextTemplateExercise,
  onNextQueueExercise
}) {
  const navigate = useNavigate();
  const lastRecord = exerciseHistory[0];

  if (!currentExercise) {
    return null;
  }

  return (
    <section className="animate-fade-in card space-y-5 border-t-4 border-t-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            当前动作
          </p>
          <h2 className="text-2xl font-bold text-text-primary mt-1">{currentExercise.name}</h2>
        </div>
      </div>

      <button
        className="flex w-full items-center gap-3 rounded-xl bg-bg-tertiary/50 border border-border-primary px-4 py-3 text-left text-sm text-text-secondary transition-all hover:bg-bg-tertiary active:scale-[0.98]"
        type="button"
        onClick={() => navigate("/history")}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-medium">
          {historyLoading
            ? "历史加载中..."
            : lastRecord
              ? lastRecord.set_type === "drop_set"
                ? `上次：${lastRecord.segments
                  ?.map((segment) => `${segment.weight}kg×${segment.reps}`)
                  .join(" → ")}`
                : `上次：${lastRecord.weight ?? ""}kg × ${lastRecord.reps ?? ""}`
              : "暂无历史记录"}
        </span>
      </button>

      <QuickRecordPanel
        exerciseHistory={exerciseHistory}
        currentWeight={weight}
        currentReps={reps}
        onApply={(w, r) => {
          setWeight(clampWeight(w));
          setReps(clampReps(r));
        }}
        onQuickRecord={onQuickRecord}
      />

      <div className="rounded-2xl bg-bg-tertiary/30 p-4 border border-border-primary grid gap-4 md:grid-cols-2">
        <NumberPicker
          label="重量"
          value={weight}
          min={WEIGHT.MIN}
          max={WEIGHT.MAX}
          step={WEIGHT.STEP}
          precision={2}
          unit="kg"
          onChange={setWeight}
        />
        <NumberPicker
          label="次数"
          value={reps}
          min={REPS.MIN}
          max={REPS.MAX}
          step={REPS.STEP}
          unit="次"
          onChange={setReps}
        />
      </div>

      <div className="flex gap-2 rounded-xl bg-bg-tertiary/50 p-1">
        {[
          { key: "normal", label: "普通组" },
          { key: "drop_set", label: "递减组" }
        ].map((item) => {
          const isActive = setType === item.key;
          return (
            <button
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                isActive 
                  ? "bg-white text-primary shadow-sm dark:bg-bg-secondary" 
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
              key={item.key}
              type="button"
              onClick={() => setSetType(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {setType === "drop_set" && (
        <DropSetInput
          segments={segments}
          onAddSegment={() =>
            setSegments((prev) => [
              ...prev,
              { weight: clampWeight(weight), reps: clampReps(reps) }
            ])
          }
          onRemoveSegment={(index) =>
            setSegments((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
          }
          onUpdateSegment={(index, field, value) =>
            setSegments((prev) =>
              prev.map((segment, itemIndex) =>
                itemIndex === index
                  ? {
                    ...segment,
                    [field]: field === "weight" ? clampWeight(value) : clampReps(value)
                  }
                  : segment
              )
            )
          }
        />
      )}

      <RPESelector value={rpe} onChange={setRpe} />

      <SetNoteInput value={setNotes} onChange={setSetNotes} />

      <PhotoUploader
        photoUrl={null}
        onUpload={(path) => setPhotoPath(path)}
        onRemove={() => setPhotoPath(null)}
      />

      <button
        className="btn btn-primary w-full text-lg shadow-glow h-12"
        type="button"
        disabled={workoutLoading}
        onClick={onRecordSet}
      >
        记录本组 ✓
      </button>
      
      {activeTemplate && templateExerciseIndex < activeTemplate.exercises.length - 1 && (
        <button
          className="btn btn-secondary w-full text-base"
          type="button"
          onClick={onNextTemplateExercise}
        >
          下一动作 →
        </button>
      )}
      
      {!activeTemplate && exerciseQueue.length > 1 && queueIndex < exerciseQueue.length - 1 && (
        <button
          className="btn btn-secondary w-full text-base"
          type="button"
          onClick={onNextQueueExercise}
        >
          下一动作 →
        </button>
      )}
    </section>
  );
}
