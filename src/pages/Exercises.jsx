import { useMemo, useState } from "react";
import BottomSheet from "../components/BottomSheet.jsx";
import { bodyParts } from "../data/bodyParts.js";
import { useExercises } from "../hooks/useExercises.js";

export default function Exercises() {
  const [activeTab, setActiveTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBodyPart, setNewBodyPart] = useState("");
  const [formError, setFormError] = useState("");

  const {
    exercises,
    addExercise,
    deleteExercise,
    loading,
    error
  } = useExercises();

  const groupedExercises = useMemo(() => {
    return bodyParts.map((part) => {
      const list = exercises.filter((exercise) => exercise.body_part === part.key);
      const filtered =
        activeTab === "custom"
          ? list.filter((exercise) => !exercise.is_preset)
          : list;
      return { ...part, exercises: filtered };
    });
  }, [activeTab, exercises]);

  const handleSubmit = async () => {
    const result = await addExercise(newName, newBodyPart);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setFormError("");
    setNewName("");
    setNewBodyPart("");
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            动作管理
          </p>
          <h1 className="text-2xl font-bold text-text-primary">动作库</h1>
        </div>
        <button
          className="btn btn-primary text-sm"
          type="button"
          onClick={() => setShowAddModal(true)}
        >
          + 添加
        </button>
      </header>

      <div className="flex gap-2">
        {[
          { key: "all", label: "全部动作" },
          { key: "custom", label: "我的自定义" }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              className={`chip ${isActive ? "chip-selected" : ""}`}
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="empty-state">
            <div className="loading-spinner" />
          </div>
        )}
        {error && !loading && (
          <div className="card text-center">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
        {groupedExercises.map((part) => (
          <div className="card" key={part.key}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-text-primary">{part.label}</p>
              <span className="text-sm text-text-secondary">{part.exercises.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {part.exercises.length === 0 ? (
                <p className="text-sm text-text-secondary">暂无动作</p>
              ) : (
                part.exercises.map((exercise) => (
                  <div
                    className="flex items-center justify-between rounded-lg bg-bg-secondary px-4 py-3"
                    key={exercise.id}
                  >
                    <span className="font-medium text-text-primary">{exercise.name}</span>
                    {!exercise.is_preset && (
                      <button
                        className="text-sm font-medium text-danger transition-opacity active:opacity-70"
                        type="button"
                        onClick={() => deleteExercise(exercise.id)}
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <BottomSheet
        isOpen={showAddModal}
        title="新增动作"
        onClose={() => setShowAddModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              动作名称
            </label>
            <input
              className="input"
              placeholder="例如：哑铃阿诺德推举"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              所属部位
            </label>
            <select
              className="input"
              value={newBodyPart}
              onChange={(event) => setNewBodyPart(event.target.value)}
            >
              <option value="">请选择</option>
              {bodyParts.map((part) => (
                <option key={part.key} value={part.key}>
                  {part.label}
                </option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <button
            className="btn btn-primary w-full"
            type="button"
            disabled={!newName.trim() || !newBodyPart}
            onClick={handleSubmit}
          >
            添加动作
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
