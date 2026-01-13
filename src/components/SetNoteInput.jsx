import { useEffect, useRef, useState } from "react";
import { hapticFeedback } from "../lib/haptics.js";

const MAX_LENGTH = 200;

export default function SetNoteInput({
  value = "",
  onChange,
  placeholder = "记录训练感受、技术调整等...",
  compact = false
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (value && value.length > 0) {
      setIsExpanded(true);
    }
  }, []);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    hapticFeedback("light");
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!value || value.trim().length === 0) {
      setIsExpanded(false);
      onChange("");
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange(newValue);
    }
  };

  const charCount = value?.length ?? 0;
  const isNearLimit = charCount >= MAX_LENGTH * 0.8;

  if (compact) {
    return (
      <div className="note-input">
        <textarea
          ref={textareaRef}
          className="note-textarea"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={2}
          maxLength={MAX_LENGTH}
        />
        <div className={`note-char-count ${isNearLimit ? "note-char-count-warning" : ""}`}>
          {charCount}/{MAX_LENGTH}
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        className="note-input-collapsed"
        onClick={handleExpand}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>添加笔记</span>
      </button>
    );
  }

  return (
    <div className="note-input-expanded animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          训练笔记
        </p>
        <button
          type="button"
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          onClick={handleCollapse}
        >
          {value?.trim() ? "收起" : "取消"}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="note-textarea"
        value={value}
        onChange={handleChange}
        onBlur={handleCollapse}
        placeholder={placeholder}
        rows={3}
        maxLength={MAX_LENGTH}
      />
      <div className={`note-char-count ${isNearLimit ? "note-char-count-warning" : ""}`}>
        {charCount}/{MAX_LENGTH}
      </div>
    </div>
  );
}

export function NoteBadge({ note, onClick }) {
  if (!note || note.trim().length === 0) return null;

  return (
    <button
      type="button"
      className="note-badge"
      onClick={onClick}
      title={note}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    </button>
  );
}
