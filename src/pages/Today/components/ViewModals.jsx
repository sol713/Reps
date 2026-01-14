import Modal from "../../../components/Modal.jsx";
import { supabase } from "../../../lib/supabase.js";

export function ViewNoteModal({ viewingNote, onClose }) {
  return (
    <Modal isOpen={Boolean(viewingNote)} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            训练笔记
          </p>
          <h3 className="text-lg font-bold text-text-primary">
            {viewingNote?.exercise_name ?? "当前动作"}
          </h3>
          <p className="text-sm text-text-secondary">第 {viewingNote?.set_number} 组</p>
        </div>
        <div className="rounded-lg bg-bg-secondary p-4">
          <p className="text-text-primary whitespace-pre-wrap">{viewingNote?.notes}</p>
        </div>
        <button
          className="btn btn-secondary w-full"
          type="button"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </Modal>
  );
}

export function ViewPhotoModal({ viewingPhoto, onClose }) {
  return (
    <Modal isOpen={Boolean(viewingPhoto)} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            训练照片
          </p>
          <h3 className="text-lg font-bold text-text-primary">
            {viewingPhoto?.exercise_name ?? "当前动作"}
          </h3>
          <p className="text-sm text-text-secondary">第 {viewingPhoto?.set_number} 组</p>
        </div>
        {viewingPhoto?.photo_url && (
          <img
            src={supabase.storage.from("workout-photos").getPublicUrl(viewingPhoto.photo_url).data?.publicUrl}
            alt="训练照片"
            className="w-full rounded-lg"
          />
        )}
        <button
          className="btn btn-secondary w-full"
          type="button"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </Modal>
  );
}
