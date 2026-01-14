import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "../hooks/useTemplates.js";

function TemplateCard({ template, onStart, onEdit, onDelete }) {
  const exerciseCount = template.exercises?.length ?? 0;
  const totalSets = template.exercises?.reduce((sum, ex) => sum + (ex.targetSets ?? 0), 0) ?? 0;

  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg"
            style={{ backgroundColor: template.color }}
          />
          <div>
            <h3 className="font-bold text-text-primary">{template.name}</h3>
            {template.description && (
              <p className="text-sm text-text-secondary line-clamp-1">{template.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="touch-target flex items-center justify-center rounded-lg text-text-secondary transition-colors active:bg-bg-tertiary"
            type="button"
            onClick={() => onEdit(template.id)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="touch-target flex items-center justify-center rounded-lg text-text-secondary transition-colors active:bg-bg-tertiary"
            type="button"
            onClick={() => onDelete(template.id)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
        <span>{exerciseCount} 个动作</span>
        <span>{totalSets} 组</span>
      </div>

      {template.exercises?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {template.exercises.slice(0, 4).map((ex) => (
            <span
              key={ex.id}
              className="rounded-full bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-secondary"
            >
              {ex.exerciseName}
            </span>
          ))}
          {template.exercises.length > 4 && (
            <span className="rounded-full bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-tertiary">
              +{template.exercises.length - 4}
            </span>
          )}
        </div>
      )}

      <button
        className="btn btn-primary mt-4 w-full"
        type="button"
        onClick={() => onStart(template)}
      >
        开始训练
      </button>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const { templates, loading, error, deleteTemplate, importPresetTemplates } = useTemplates();
  const [importing, setImporting] = useState(false);

  const handleStart = (template) => {
    navigate("/", { state: { template } });
  };

  const handleEdit = (templateId) => {
    navigate(`/templates/${templateId}`);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm("确定要删除这个模板吗？")) {
      await deleteTemplate(templateId);
    }
  };

  const handleImportPresets = async () => {
    setImporting(true);
    await importPresetTemplates();
    setImporting(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            训练模板
          </p>
          <h1 className="text-2xl font-bold text-text-primary">我的计划</h1>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => navigate("/templates/new")}
        >
          + 新建
        </button>
      </header>

      {loading && (
        <div className="empty-state">
          <div className="loading-spinner" />
        </div>
      )}

      {error && !loading && (
        <div className="empty-state">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">还没有模板</p>
          <p className="empty-state-description">
            创建训练模板，让每次训练更高效
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <button
              className="btn btn-primary"
              type="button"
              disabled={importing}
              onClick={handleImportPresets}
            >
              {importing ? "导入中..." : "导入推荐模板"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/templates/new")}
            >
              自己创建
            </button>
          </div>
        </div>
      )}

      {!loading && !error && templates.length > 0 && (
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onStart={handleStart}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
