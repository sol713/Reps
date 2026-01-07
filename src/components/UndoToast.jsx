export default function UndoToast({ toast, onUndo, duration = 4000 }) {
  if (!toast) {
    return null;
  }

  return (
    <div className="undo-toast" role="status">
      <div className="undo-toast-content">
        <span className="undo-toast-message">{toast.message}</span>
        <button className="undo-toast-action" type="button" onClick={onUndo}>
          撤销
        </button>
      </div>
      <div className="undo-toast-progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
}
