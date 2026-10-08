import { useState, useRef, useEffect } from "react";
import { Mascot } from "./Mascot";
import {
  IconMoreVertical,
  IconPlus,
  IconTrash,
  IconInfo,
  IconSettings,
} from "./Icons";

export default function ChatHeader({ onNewChat, onClearChat, onAbout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handle = (fn) => (e) => {
    e.preventDefault();
    setOpen(false);
    fn?.();
  };

  return (
    <header className="relative z-20 flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 bg-[#FDF8F2]/90 backdrop-blur-xl border-b border-[#F0E4D6]">
      <div className="relative shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-[#FFF1E0] to-[#FFE0C2] border border-[#F5DEC5] flex items-center justify-center overflow-hidden shadow-sm">
        <Mascot className="w-8 h-8 md:w-9 md:h-9" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-cartoon font-semibold text-xl md:text-[22px] text-[#2B1E14] leading-none tracking-tight">
            AnamIQ
          </h1>
          <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFF1E0] text-[#F4741B] font-semibold border border-[#FFE0C2] leading-none">
            v1.0
          </span>
        </div>
        <p className="text-[11px] md:text-xs text-[#9A8878] mt-1.5 flex items-center gap-1.5">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          Your Personal AI Tutor
        </p>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-sm ${
            open
              ? "bg-[#FFF1E0] border-[#FFCC9E] text-[#F4741B]"
              : "bg-white border-[#F0E4D6] text-[#6B5844] hover:text-[#F4741B] hover:border-[#FFCC9E] hover:bg-[#FFF8F1]"
          }`}
        >
          <IconMoreVertical className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl border border-[#F0E4D6] shadow-xl shadow-orange-900/10 p-1.5 animate-fadeIn">
            <MenuItem
              icon={<IconPlus className="w-4 h-4" />}
              label="New chat"
              onClick={handle(onNewChat)}
            />
            <MenuItem
              icon={<IconTrash className="w-4 h-4" />}
              label="Clear messages"
              onClick={handle(onClearChat)}
              danger
            />
            <div className="my-1 h-px bg-[#F0E4D6]" />
            <MenuItem
              icon={<IconSettings className="w-4 h-4" />}
              label="Settings"
              onClick={handle(() => {})}
              disabled
            />
            <MenuItem
              icon={<IconInfo className="w-4 h-4" />}
              label="About AnamIQ"
              onClick={handle(onAbout)}
            />
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick, danger, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
        disabled
          ? "text-[#C9B79E] cursor-not-allowed"
          : danger
          ? "text-[#DC2626] hover:bg-red-50"
          : "text-[#2B1E14] hover:bg-[#FFF8F1] hover:text-[#F4741B]"
      }`}
    >
      <span
        className={
          disabled ? "" : danger ? "text-[#DC2626]" : "text-[#9A8878]"
        }
      >
        {icon}
      </span>
      {label}
    </button>
  );
}