export function Mascot({ className = "w-32 h-32" }) {
  return (
    <img
      src="/mascot.png"
      alt="AnamIQ Mascot"
      className={`object-contain select-none pointer-events-none ${className}`}
      draggable={false}
    />
  );
}