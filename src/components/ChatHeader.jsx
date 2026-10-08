export default function ChatHeader() {
  return (
    <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 md:py-4 border-b border-neutral-200 bg-white">
      {/* Logo */}
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-1.5 shrink-0">
        <img
          src="/logo.png"
          alt="AnamIQ"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-cartoon font-semibold text-2xl md:text-[26px] text-neutral-900 leading-none tracking-tight">
          AnamIQ
        </h1>
        <p className="text-[11px] md:text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          Version 1.0
        </p>
      </div>

      {/* Menu icon */}
      <button
        type="button"
        aria-label="Menu"
        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>
    </header>
  );
}