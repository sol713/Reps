import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet.jsx";
import ExercisePicker from "../components/ExercisePicker.jsx";
import Modal from "../components/Modal.jsx";
import { bodyParts } from "../data/bodyParts.js";
import { useExercises } from "../hooks/useExercises.js";
import { useTemplates } from "../hooks/useTemplates.js";

const TEMPLATE_COLORS = [
  "#0A84FF",
  "#30D158",
  "#FF9F0A",
  "#FF453A",
  "#BF5AF2",
  "#FF375F",
  "#64D2FF",
  "#FFD60A"
];

function TemplateExerciseRow({ exercise, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <button
              className="touch-target flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors active:bg-bg-tertiary disabled:opacity-30"
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              className="touch-target flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors active:bg-bg-tertiary disabled:opacity-30"
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div>
            <p className="font-semibold text-text-primary">{exercise.exerciseName}</p>
            <p className="text-sm text-text-secondary">
              {bodyParts.find((bp) => bp.key === exercise.bodyPart)?.label ?? exercise.bodyPart}
            </p>
          </div>
        </div>
        <button
          className="touch-target flex items-center justify-center rounded-lg text-danger transition-colors active:bg-bg-tertiary"
          type="button"
          onClick={onRemove}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary">目标组数</label>
          <input
            className="input mt-1 text-center"
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            value={exercise.targetSets}
            onChange={(e) => onUpdate(index, "targetSets", parseInt(e.target.value, 10) || 3)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary">最少次数</label>
          <input
            className="input mt-1 text-center"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={exercise.targetRepsMin}
            onChange={(e) => onUpdate(index, "targetRepsMin", parseInt(e.target.value, 10) || 8)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary">最多次数</label>
          <input
            className="input mt-1 text-center"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={exercise.targetRepsMax}
            onChange={(e) => onUpdate(index, "targetRepsMax", parseInt(e.target.value, 10) || 12)}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary">参考重量 (kg)</label>
          <input
            className="input mt-1 text-center"
            type="number"
            inputMode="decimal"
            min={0}
            step={2.5}
            value={exercise.targetWeight ?? ""}
            placeholder="可选"
            onChange={(e) => onUpdate(index, "targetWeight", e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary">休息时间 (秒)</label>
          <input
            className="input mt-1 text-center"
            type="number"
            inputMode="numeric"
            min={30}
            max={300}
            step={15}
            value={exercise.restSeconds}
            onChange={(e) => onUpdate(index, "restSeconds", parseInt(e.target.value, 10) || 90)}
          />
        </div>
      </div>
    </div>
  );
}

export default function TemplateDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";

  const { getTemplate, createTemplate, updateTemplate } = useTemplates();
  const { exercises: allExercises, loading: exercisesLoading, error: exercisesError } = useExercises();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(TEMPLATE_COLORS[0]);
  const [templateExercises, setTemplateExercises] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentBodyPart, setCurrentBodyPart] = useState("chest");

  useEffect(() => {
    if (isNew) return;

    let isActive = true;
    setLoading(true);

    getTemplate(id).then((template) => {
      if (!isActive) return;
      if (!template) {
        setError("模板不存在");
        setLoading(false);
        return;
      }
      setName(template.name);
      setDescription(template.description);
      setColor(template.color);
      setTemplateExercises(template.exercises);
      setLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [id, isNew, getTemplate]);

  const handleAddExercise = useCallback((exercise) => {
    setTemplateExercises((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        bodyPart: exercise.body_part,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        targetWeight: null,
        restSeconds: 90,
        notes: ""
      }
    ]);
    setShowExercisePicker(false);
  }, []);

  const handleUpdateExercise = useCallback((index, field, value) => {
    setTemplateExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  }, []);

  const handleRemoveExercise = useCallback((index) => {
    setTemplateExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMoveExercise = useCallback((index, direction) => {
    setTemplateExercises((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("请输入模板名称");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      exercises: templateExercises
    };

    let success;
    if (isNew) {
      const newId = await createTemplate(payload);
      success = Boolean(newId);
    } else {
      success = await updateTemplate(id, payload);
    }

    setSaving(false);

    if (success) {
      navigate("/templates");
    } else {
      setError("保存失败，请重试");
    }
  };

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => ex.body_part === currentBodyPart);
  }, [allExercises, currentBodyPart]);

  const totalSets = templateExercises.reduce((sum, ex) => sum + (ex.targetSets ?? 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header className="flex items-center justify-between">
        <button
          className="touch-target flex items-center gap-1 text-primary"
          type="button"
          onClick={() => navigate("/templates")}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <button
          className="btn btn-primary"
          type="button"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </header>

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="card space-y-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            模板名称
          </label>
          <input
            className="input mt-2"
            type="text"
            placeholder="如：推日、胸+三头"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            描述（可选）
          </label>
          <input
            className="input mt-2"
            type="text"
            placeholder="简单描述这个模板"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            颜色
          </label>
          <button
            className="mt-2 flex items-center gap-3 rounded-lg bg-bg-secondary px-4 py-3 transition-colors active:bg-bg-tertiary"
            type="button"
            onClick={() => setShowColorPicker(true)}
          >
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-text-secondary">点击更换颜色</span>
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              动作列表
            </p>
            <p className="text-sm text-text-tertiary">
              {templateExercises.length} 个动作 · {totalSets} 组
            </p>
          </div>
          <button
            className="btn btn-secondary text-sm"
            type="button"
            onClick={() => setShowExercisePicker(true)}
          >
            + 添加动作
          </button>
        </div>

        {templateExercises.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-text-secondary">还没有添加动作</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templateExercises.map((exercise, index) => (
              <TemplateExerciseRow
                key={exercise.id}
                exercise={exercise}
                index={index}
                onUpdate={handleUpdateExercise}
                onRemove={() => handleRemoveExercise(index)}
                onMoveUp={() => handleMoveExercise(index, -1)}
                onMoveDown={() => handleMoveExercise(index, 1)}
                isFirst={index === 0}
                isLast={index === templateExercises.length - 1}
              />
            ))}
          </div>
        )}
      </section>

      <BottomSheet
        isOpen={showExercisePicker}
        title="添加动作"
        onClose={() => setShowExercisePicker(false)}
      >
        <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {bodyParts.map((bp) => (
            <button
              key={bp.key}
              className={`chip whitespace-nowrap ${currentBodyPart === bp.key ? "chip-selected" : ""}`}
              type="button"
              onClick={() => setCurrentBodyPart(bp.key)}
            >
              {bp.label}
            </button>
          ))}
        </div>
        <ExercisePicker
          bodyPart={currentBodyPart}
          exercises={filteredExercises}
          recentExercises={[]}
          loading={exercisesLoading}
          error={exercisesError}
          onSelect={handleAddExercise}
          onAdd={() => {
            setShowExercisePicker(false);
            navigate("/exercises");
          }}
        />
      </BottomSheet>

      <Modal isOpen={showColorPicker} onClose={() => setShowColorPicker(false)}>
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            选择颜色
          </p>
          <div className="grid grid-cols-4 gap-3">
            {TEMPLATE_COLORS.map((c) => (
              <button
                key={c}
                className={`flex h-12 w-12 items-center justify-center rounded-lg transition-transform active:scale-95 ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-bg-elevated" : ""}`}
                style={{ backgroundColor: c }}
                type="button"
                onClick={() => {
                  setColor(c);
                  setShowColorPicker(false);
                }}
              >
                {color === c && (
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
