import DropSetInput from "../../../components/DropSetInput.jsx";
import Modal from "../../../components/Modal.jsx";
import NumberPicker from "../../../components/NumberPicker.jsx";
import RPESelector from "../../../components/RPESelector.jsx";
import SetNoteInput from "../../../components/SetNoteInput.jsx";
import { WEIGHT, REPS } from "../constants.js";

export default function EditSetModal({
  editingSet,
  editWeight,
  setEditWeight,
  editReps,
  setEditReps,
  editSegments,
  setEditSegments,
  editRpe,
  setEditRpe,
  editNotes,
  setEditNotes,
  editError,
  editLoading,
  onClose,
  onSave,
  clampWeight,
  clampReps
}) {
  return (
    <Modal isOpen={Boolean(editingSet)} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              编辑记录
            </p>
            <h3 className="text-lg font-bold text-text-primary">
              {editingSet?.exercise_name ?? "当前动作"}
            </h3>
            <p className="text-sm text-text-secondary">第 {editingSet?.set_number} 组</p>
          </div>
          <button
            className="btn-ghost min-h-[36px] px-3 py-1.5 text-sm font-semibold"
            type="button"
            onClick={onClose}
          >
            取消
          </button>
        </div>

        {editingSet?.set_type === "drop_set" ? (
          <DropSetInput
            segments={editSegments}
            onAddSegment={() =>
              setEditSegments((prev) => [
                ...prev,
                { weight: clampWeight(editWeight), reps: clampReps(editReps) }
              ])
            }
            onRemoveSegment={(index) =>
              setEditSegments((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
            }
            onUpdateSegment={(index, field, value) =>
              setEditSegments((prev) =>
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
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <NumberPicker
              label="重量"
              value={editWeight}
              min={WEIGHT.MIN}
              max={WEIGHT.MAX}
              step={WEIGHT.STEP}
              precision={2}
              unit="kg"
              onChange={setEditWeight}
            />
            <NumberPicker
              label="次数"
              value={editReps}
              min={REPS.MIN}
              max={REPS.MAX}
              step={REPS.STEP}
              unit="次"
              onChange={setEditReps}
            />
          </div>
        )}

        <RPESelector value={editRpe} onChange={setEditRpe} compact />

        <SetNoteInput value={editNotes} onChange={setEditNotes} compact />

        {editError && <p className="text-sm text-danger">{editError}</p>}

        <button
          className="btn btn-primary w-full"
          type="button"
          disabled={editLoading}
          onClick={onSave}
        >
          {editLoading ? "保存中..." : "保存修改"}
        </button>
      </div>
    </Modal>
  );
}
