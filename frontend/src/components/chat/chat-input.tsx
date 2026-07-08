import React, { useRef, useEffect } from "react";
import { Send, CornerDownLeft, Paperclip } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onUploadClick?: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, onUploadClick, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative flex items-end w-full rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md pl-3 pr-4 py-3 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all gap-2">
      {onUploadClick && (
        <button
          type="button"
          onClick={onUploadClick}
          disabled={disabled}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          title="Upload Document"
        >
          <Paperclip className="h-4 w-4" />
        </button>
      )}
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask BetterBee anything about your workspace documents..."
        disabled={disabled}
        className="flex-1 max-h-[200px] resize-none bg-transparent text-neutral-100 placeholder-neutral-500 text-sm focus:outline-hidden pr-12 pb-1.5 align-bottom"
        style={{ height: "auto" }}
      />
      <div className="absolute right-3 bottom-2.5 flex items-center gap-2">
        <span className="hidden md:flex items-center gap-0.5 text-[10px] text-neutral-500 font-mono">
          <span>Enter</span>
          <CornerDownLeft className="h-2.5 w-2.5" />
        </span>
        <button
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-600 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
