import { useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { getTodayIsoDate } from "../lib/date.js";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function PhotoUploader({ onUpload, onRemove, photoUrl }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(photoUrl || null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`图片不能超过 ${MAX_SIZE_MB}MB`);
      return;
    }

    setError("");
    setUploading(true);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const today = getTodayIsoDate();
    const ext = file.name.split(".").pop();
    const fileName = `${user.id}/${today}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("workout-photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      setError("上传失败，请重试");
      setPreview(null);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("workout-photos")
      .getPublicUrl(fileName);

    setUploading(false);
    onUpload?.(fileName, urlData?.publicUrl);
  };

  const handleRemove = async () => {
    if (!preview) return;
    setPreview(null);
    setError("");
    onRemove?.();
  };

  const handleClick = () => {
    if (!uploading && !preview) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="训练照片"
            className="h-16 w-16 rounded-lg object-cover"
          />
          <button
            type="button"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white text-xs"
            onClick={handleRemove}
          >
            ✕
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="loading-spinner h-6 w-6" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border bg-bg-secondary text-text-tertiary transition-colors active:bg-bg-tertiary"
          onClick={handleClick}
          disabled={uploading}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      <div className="flex-1 text-sm">
        {error ? (
          <p className="text-danger">{error}</p>
        ) : preview ? (
          <p className="text-text-secondary">照片已添加</p>
        ) : (
          <p className="text-text-tertiary">添加训练照片（可选）</p>
        )}
      </div>
    </div>
  );
}
