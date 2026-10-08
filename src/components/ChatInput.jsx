import { useState, useRef, useEffect } from "react";
import { IconPaperclip, IconSend, IconX, IconImage } from "./Icons";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null); // { preview, name, type }
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [text]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Only images are supported right now.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        preview: reader.result, // dataURL
        name: f.name,
        type: f.type,
      });
    };
    reader.readAsDataURL(f);
    // reset so choosing the same file again still triggers
    e.target.value = "";
  };

  const removeFile = () => setFile(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const canSend = (text.trim() || file) && !disabled;
    if (!canSend) return;
    onSend({ text: text.trim(), file });
    setText("");
    setFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = (text.trim().length > 0 || !!file) && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 md:px-4 py-3 md:py-4 bg-[#FDF8F2]/90 backdrop-blur-xl border-t border-[#F0E4D6]"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attachment preview */}
      {file && (
        <div className="mb-2.5 animate-fadeIn">
          <div className="relative inline-flex items-center gap-2.5 bg-white border border-[#F0E4D6] rounded-2xl p-1.5 pr-3 shadow-sm">
            <img
              src={file.preview}
              alt="preview"
              className="w-12 h-12 rounded-xl object-cover border border-[#F0E4D6]"
            />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-[#2B1E14] truncate max-w-[160px]">
                {file.name}
              </p>
              <p className="text-[10px] text-[#9A8878] flex items-center gap-1 mt-0.5">
                <IconImage className="w-3 h-3" />
                Image attached
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              aria-label="Remove attachment"
              className="shrink-0 w-6 h-6 rounded-full bg-[#FFF1E0] hover:bg-[#FFE0C2] text-[#F4741B] flex items-center justify-center transition-all active:scale-90"
            >
              <IconX className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 bg-white rounded-full border border-[#F0E4D6] shadow-sm focus-within:border-[#FFCC9E] focus-within:shadow-md focus-within:shadow-orange-500/10 transition-all pl-1.5 pr-1.5 py-1.5">
        {/* Attach */}
        <button
          type="button"
          onClick={handlePickFile}
          aria-label="Attach image"
          className="shrink-0 w-9 h-9 rounded-full bg-[#FFF1E0] hover:bg-[#FFE0C2] text-[#F4741B] flex items-center justify-center transition-all active:scale-95"
        >
          <IconPaperclip className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything to learn..."
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent text-sm md:text-[15px] outline-none text-[#2B1E14] placeholder:text-[#B4A08B] resize-none py-2 max-h-[140px] leading-relaxed disabled:opacity-50 scrollbar-thin"
        />

        {/* Send */}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            canSend
              ? "bg-gradient-to-br from-[#FF8A3D] to-[#EA580C] text-white shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95"
              : "bg-[#F5EADB] text-[#C9B79E] cursor-not-allowed"
          }`}
        >
          <IconSend className="w-4 h-4 translate-x-[1px]" />
        </button>
      </div>

      <p className="hidden md:block text-[10px] text-[#B4A08B] text-center mt-2 select-none">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#F0E4D6] text-[#6B5844] font-sans">Enter</kbd> to send ·{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#F0E4D6] text-[#6B5844] font-sans">Shift + Enter</kbd> for new line
      </p>
    </form>
  );
}