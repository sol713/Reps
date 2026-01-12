import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <Link className="text-xs font-semibold text-app-muted" to="/">
          返回
        </Link>
        <h1 className="text-lg font-semibold">动作库</h1>
        <button
          className="rounded-full border border-app-divider bg-white px-3 py-1 text-xs font-semibold text-app-muted neo-surface-soft neo-pressable"
          type="button"
          onClick={() => setShowAddModal(true)}
        >
          添加
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
              className={`rounded-full border px-4 py-2 text-xs font-semibold neo-pressable ${
                isActive
                  ? "border-app-primary bg-app-primary text-white"
                  : "border-app-divider bg-app-card text-app-muted"
              }`}
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
          <div className="rounded-card border border-dashed border-app-divider bg-gray-50 py-6 text-center neo-inset">
            <p className="text-sm text-app-muted">加载中...</p>
          </div>
        )}
        {error && !loading && (
          <div className="rounded-card border border-dashed border-app-divider bg-gray-50 py-6 text-center neo-inset">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        {groupedExercises.map((part) => (
          <div className="rounded-card border border-app-divider bg-app-card p-4 neo-surface-soft" key={part.key}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{part.label}</p>
              <span className="text-xs text-app-muted">{part.exercises.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {part.exercises.length === 0 ? (
                <p className="text-sm text-app-muted">暂无动作</p>
              ) : (
                part.exercises.map((exercise) => (
                  <div
                    className="flex items-center justify-between rounded-input border border-app-divider px-3 py-2 neo-inset"
                    key={exercise.id}
                  >
                    <span className="text-sm font-semibold">{exercise.name}</span>
                    {!exercise.is_preset && (
                      <button
                        className="text-xs font-semibold text-app-muted"
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
          <label className="flex flex-col gap-2 rounded-input border border-app-divider bg-app-card px-3 py-2 neo-inset">
            <span className="text-xs text-app-muted">动作名称</span>
            <input
              className="bg-transparent text-sm font-semibold outline-none"
              placeholder="例如：哑铃阿诺德推举"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 rounded-input border border-app-divider bg-app-card px-3 py-2 neo-inset">
            <span className="text-xs text-app-muted">所属部位</span>
            <select
              className="bg-transparent text-sm font-semibold outline-none"
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
          </label>
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <button
            className="w-full rounded-button bg-app-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
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
