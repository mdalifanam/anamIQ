import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 md:px-5 py-3 md:py-4 bg-white border-t border-neutral-200"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message AnamIQ..."
        className="flex-1 min-w-0 px-4 py-2.5 text-sm md:text-[15px] bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-neutral-300 rounded-full outline-none text-neutral-900 placeholder:text-neutral-500 transition-colors"
      />

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label="Send message"
        className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-neutral-900 disabled:active:scale-100 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px] md:w-5 md:h-5 translate-x-[1px]"
        >
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>
    </form>
  );
}