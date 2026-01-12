export default function UndoToast({ toast, onUndo, duration = 4000 }) {
  if (!toast) {
    return null;
  }

  return (
    <div className="toast" role="status">
      <span className="text-sm text-text-primary">{toast.message}</span>
      <button 
        className="text-sm font-semibold text-primary" 
        type="button" 
        onClick={onUndo}
      >
        撤销
      </button>
    </div>
  );
}
