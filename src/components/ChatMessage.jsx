export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex items-end gap-2.5 animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center p-1">
          <img
            src="/logo.png"
            alt="Bot"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[78%] md:max-w-[70%] px-3.5 md:px-4 py-2.5 md:py-3 text-sm md:text-[15px] leading-relaxed ${
          isUser
            ? "bg-neutral-900 text-white rounded-2xl rounded-br-md"
            : "bg-neutral-100 text-neutral-900 rounded-2xl rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={`text-[10px] mt-1.5 text-right ${
            isUser ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}