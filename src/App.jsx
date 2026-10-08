import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { Mascot } from "./components/Mascot";
import {
  IconSparkle,
  IconBookOpen,
  IconPencil,
  IconTarget,
  IconFileText,
  IconFacebook,
  IconLinkedIn,
  IconHeart,
  IconX,
} from "./components/Icons";

/* ---------------- System Prompt ---------------- */

const SYSTEM_INSTRUCTION = `You are AnamIQ, a warm, brief personal AI tutor for students.

# 🚨 LENGTH RULES (MOST IMPORTANT — READ FIRST)
- DEFAULT: Reply in 1–3 short sentences. Nothing more.
- If the user asks something simple ("hi", "what is X", "2+2"), reply in ONE line if possible.
- NEVER write greetings or intros like "Great question!", "Sure!", "Of course!", "Let's dive in", "I'd be happy to".
- NEVER restate the user's question.
- NEVER add "Summary", "Conclusion", "In short", "Hope this helps", or closing lines.
- NEVER add headings or bullet lists unless the user asks for a list or comparison.
- NEVER explain obvious things.
- NO padding, NO filler, NO repetition.
- If a short answer is enough, STOP. Do not keep going.

# When to write MORE (only if the user asks)
- "explain in detail" / "step by step" / "vistare bolo" → longer answer allowed.
- "solve" math problem → show steps (still tight, no fluff).
- "write code" → give code + 1–2 line explanation only.
- "quiz me" → one question at a time.

# Length by question type
- Greeting ("hi", "hello") → 1 line reply.
- Simple fact ("capital of France?") → 1 line. e.g. "Paris. 🇫🇷"
- Definition ("what is X?") → 2–3 lines max.
- Math → steps only, no commentary.
- Code → code block + 1–2 line note.

# Formatting (only when needed)
- Use **bold** sparingly.
- Use emojis lightly — 0–2 per reply.
- Use math LaTeX when math is involved: inline $x^2$, block $$...$$
- Use code fences with language tag: \`\`\`jsx ... \`\`\`

# Code rules
- Wrap in fenced block with language.
- After code: 1–2 lines max explanation.

# Math rules
- Step by step, each step ONE short line.
- Use LaTeX: $...$ inline, $$...$$ block.
- Final answer in **bold** or $\\boxed{}$.

# Quiz rules
- One question at a time.
- Format:
  **Q1.** question?
  - A) ...
  - B) ...
  - C) ...
  - D) ...
- Wait for answer. Then ✅ or ❌ + 1 line explanation.

# Tone
- Friendly but brief. Like a smart friend, not a textbook.
- Match the user's language (Bengali → Bengali, English → English, Banglish → Banglish).

# Golden rule
If you can say it in 1 sentence, don't use 3. Shorter is always better.
`;

/* ---------------- Creator Info ---------------- */

const CREATOR = {
  name: "Md Alif Anam",
  version: "1.0",
  facebook: "https://www.facebook.com/aalifanam",
  linkedin: "https://www.linkedin.com/in/mdalifanam/",
};

/* ---------------- helpers ---------------- */

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const MODEL_CANDIDATES = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
];

const initialMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Hi! I'm **AnamIQ** ✨ your personal AI tutor. What would you like to learn today?",
    time: getTime(),
  },
];

/* ---------------- App ---------------- */

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const bottomRef = useRef(null);

  const showWelcome = messages.length === 1 && !isTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Mobile keyboard — sync app height with visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const updateHeight = () => {
      if (window.innerWidth < 768) {
        document.documentElement.style.setProperty(
          "--app-height",
          `${vv.height}px`
        );
      } else {
        document.documentElement.style.removeProperty("--app-height");
      }
    };

    updateHeight();
    vv.addEventListener("resize", updateHeight);
    vv.addEventListener("scroll", updateHeight);
    return () => {
      vv.removeEventListener("resize", updateHeight);
      vv.removeEventListener("scroll", updateHeight);
      document.documentElement.style.removeProperty("--app-height");
    };
  }, []);

  /* ---------- Gemini call ---------- */

  const getBotReply = async (userText, imageData, onChunk) => {
    const parts = [];

    if (imageData?.base64) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64,
        },
      });
    }
    if (userText) parts.push({ text: userText });
    if (parts.length === 0) parts.push({ text: "(empty)" });

    const newHistory = [...chatHistory, { role: "user", parts }];

    const baseConfigs = [
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 512,
        thinkingConfig: { thinkingBudget: 0 },
      },
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    ];

    const useImage = !!imageData;

    let lastErr = null;
    let fullText = "";
    let success = false;

    outer: for (const model of MODEL_CANDIDATES) {
      for (const config of baseConfigs) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            if (useImage) {
              const res = await ai.models.generateContent({
                model,
                contents: newHistory,
                config,
              });
              fullText = res.text ?? "";
              onChunk?.(fullText);
            } else {
              const stream = await ai.models.generateContentStream({
                model,
                contents: newHistory,
                config,
              });
              fullText = "";
              for await (const chunk of stream) {
                const t = chunk.text;
                if (t) {
                  fullText += t;
                  onChunk?.(fullText);
                }
              }
            }
            success = true;
            break outer;
          } catch (err) {
            lastErr = err;
            const m = (err?.message ?? "").toLowerCase();
            console.error(`[${model}] attempt ${attempt + 1}:`, err?.message);

            if (
              m.includes("thinking") ||
              m.includes("unknown field") ||
              m.includes("invalid argument") ||
              m.includes("unsupported")
            ) {
              break;
            }

            if (
              m.includes("503") ||
              m.includes("unavailable") ||
              m.includes("429")
            ) {
              if (attempt === 0) {
                await sleep(1200);
                continue;
              }
              break;
            }

            if (m.includes("404") || m.includes("not found")) {
              break;
            }

            break;
          }
        }
      }
    }

    if (!success) {
      console.error("=== Gemini API Error (final) ===", lastErr);
      const m = (lastErr?.message ?? "").toLowerCase();

      let msg;
      if (m.includes("503") || m.includes("unavailable"))
        msg = "The AI is a bit busy right now. Please try again in a few seconds.";
      else if (m.includes("429"))
        msg = "Too many requests. Please wait a moment and try again.";
      else if (
        m.includes("api key") ||
        m.includes("api_key") ||
        m.includes("permission")
      )
        msg = "API key is invalid or lacks access. Please check your configuration.";
      else if (m.includes("safety") || m.includes("blocked"))
        msg = "This content was blocked by safety filters.";
      else if (m.includes("image") || m.includes("mime"))
        msg = "Image format not supported. Please try JPG or PNG.";
      else if (m.includes("too large") || m.includes("exceeds"))
        msg = "The image is too large. Please try a smaller one.";
      else msg = `Error: ${lastErr?.message ?? "Unknown error"}`;

      onChunk?.(msg);
      return msg;
    }

    const historyEntry = {
      role: "user",
      parts: [
        ...(imageData ? [{ text: "[user attached an image]" }] : []),
        ...(userText ? [{ text: userText }] : []),
      ],
    };

    setChatHistory([
      ...chatHistory,
      historyEntry,
      { role: "model", parts: [{ text: fullText }] },
    ]);

    return fullText;
  };

  /* ---------- send handler ---------- */

  const handleSend = async ({ text, file }) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed && !file) return;

    let imageData = null;
    if (file?.preview) {
      const base64 = file.preview.split(",")[1] ?? "";

      const bytes = Math.floor((base64.length * 3) / 4);
      if (bytes > MAX_IMAGE_BYTES) {
        const errMsg = {
          id: Date.now(),
          sender: "bot",
          text: `That image is too large (~${(bytes / 1024 / 1024).toFixed(
            1
          )} MB). Please use one under 3 MB.`,
          time: getTime(),
        };
        setMessages((prev) => [...prev, errMsg]);
        return;
      }

      let mimeType = file.type || "image/jpeg";
      if (!ALLOWED_MIMES.includes(mimeType)) {
        const match = file.preview.match(/^data:([^;]+);/);
        mimeType = match?.[1] || "image/jpeg";
      }
      if (!ALLOWED_MIMES.includes(mimeType)) mimeType = "image/jpeg";

      imageData = { base64, mimeType };
    }

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      image: file?.preview || null,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const botId = Date.now() + 1;
    let botStarted = false;

    const botText = await getBotReply(trimmed, imageData, (partial) => {
      if (!botStarted) {
        botStarted = true;
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            sender: "bot",
            text: partial,
            time: getTime(),
            streaming: true,
          },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, text: partial } : m))
        );
      }
    });

    if (!botStarted) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: botId, sender: "bot", text: botText, time: getTime() },
      ]);
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, text: botText, streaming: false } : m
        )
      );
    }
  };

  /* ---------- menu handlers ---------- */

  const handleNewChat = () => {
    setMessages(initialMessages);
    setChatHistory([]);
    setIsTyping(false);
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
    setChatHistory([]);
  };

  const handleAbout = () => setShowAbout(true);

  /* ---------- render ---------- */

  return (
    <div
      className="bg-gradient-to-b from-[#FDF8F2] via-[#FCEEDC] to-[#FBE6CE] md:flex md:items-center md:justify-center md:p-6 relative"
      style={{
        minHeight: "var(--app-height, 100dvh)",
        height: "var(--app-height, 100dvh)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(255,196,143,0.35), transparent 45%), radial-gradient(circle at 80% 90%, rgba(255,150,80,0.28), transparent 45%)",
        }}
        aria-hidden="true"
      />

      <div
        className="relative w-full md:h-[88vh] md:max-w-lg bg-[#FFFDFA] md:rounded-[32px] md:border md:border-[#F0E4D6] md:shadow-2xl md:shadow-orange-900/5 flex flex-col overflow-hidden"
        style={{ height: "var(--app-height, 100dvh)" }}
      >
        <ChatHeader
          onNewChat={handleNewChat}
          onClearChat={handleClearChat}
          onAbout={handleAbout}
        />

        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-5 md:py-6 space-y-3.5 md:space-y-4 scrollbar-thin">
          {showWelcome ? (
            <WelcomeScreen
              onSuggestion={(t) => handleSend({ text: t, file: null })}
            />
          ) : (
            messages.map((m) => <ChatMessage key={m.id} message={m} />)
          )}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}

/* ---------------- Welcome Screen ---------------- */

function WelcomeScreen({ onSuggestion }) {
  const suggestions = [
    { Icon: IconBookOpen, label: "Explain a topic" },
    { Icon: IconPencil, label: "Solve a problem" },
    { Icon: IconTarget, label: "Quiz me" },
    { Icon: IconFileText, label: "Summarize notes" },
  ];

  return (
    <div className="flex flex-col items-center text-center pt-2 pb-4 animate-fadeIn">
      <div className="relative w-40 h-40 md:w-44 md:h-44 flex items-center justify-center">
        <IconSparkle className="absolute top-2 right-3 w-5 h-5 text-[#FFB37A] animate-sparkle" />
        <IconSparkle className="absolute top-8 left-2 w-3.5 h-3.5 text-[#FFC79A] animate-sparkle [animation-delay:0.6s]" />
        <IconSparkle className="absolute bottom-6 right-6 w-3 h-3 text-[#FFD1AB] animate-sparkle [animation-delay:1.2s]" />
        <div className="animate-floaty">
          <Mascot className="w-36 h-36 md:w-40 md:h-40" />
        </div>
      </div>

      <h2 className="font-cartoon font-semibold text-2xl md:text-[28px] text-[#2B1E14] mt-2 leading-tight">
        Your Personal AI Tutor
      </h2>
      <p className="text-sm text-[#9A8878] mt-2 mb-6 max-w-xs leading-relaxed">
        Get quick answers, smart summaries, and personalized study support.
      </p>

      <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
        {suggestions.map(({ Icon, label }) => (
          <button
            key={label}
            onClick={() => onSuggestion(label)}
            className="group flex items-center gap-2.5 px-3.5 py-3 bg-white border border-[#F0E4D6] rounded-2xl text-left hover:border-[#FFCC9E] hover:bg-[#FFF8F1] hover:shadow-md hover:shadow-orange-500/10 active:scale-[0.98] transition-all"
          >
            <span className="shrink-0 w-7 h-7 rounded-lg bg-[#FFF1E0] text-[#F4741B] flex items-center justify-center group-hover:bg-[#FFE0C2] transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="text-[13px] font-medium text-[#2B1E14] group-hover:text-[#F4741B] transition-colors">
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 flex flex-col items-center gap-3">
        <p className="text-[11px] text-[#B4A08B] flex items-center gap-1 select-none">
          Made with
          <IconHeart className="w-3 h-3 text-[#F4741B] inline" />
          by
          <span className="font-semibold text-[#F4741B]">{CREATOR.name}</span>
        </p>

        <div className="flex items-center gap-2.5">
          <SocialLink
            href={CREATOR.facebook}
            label="Facebook"
            className="hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 hover:text-[#1877F2]"
          >
            <IconFacebook className="w-4 h-4" />
          </SocialLink>
          <SocialLink
            href={CREATOR.linkedin}
            label="LinkedIn"
            className="hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 hover:text-[#0A66C2]"
          >
            <IconLinkedIn className="w-4 h-4" />
          </SocialLink>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, label, children, className = "" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`w-9 h-9 rounded-xl bg-white border border-[#F0E4D6] text-[#9A8878] flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 ${className}`}
    >
      {children}
    </a>
  );
}

/* ---------------- About Modal ---------------- */

function AboutModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1E14]/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#FFFDFA] rounded-[28px] border border-[#F0E4D6] shadow-2xl shadow-orange-900/20 p-6 text-center animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-[#F0E4D6] text-[#9A8878] hover:text-[#F4741B] hover:border-[#FFCC9E] flex items-center justify-center transition-all active:scale-95"
        >
          <IconX className="w-3.5 h-3.5" />
        </button>

        <div className="flex justify-center mb-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFF1E0] to-[#FFE0C2] border border-[#F5DEC5] flex items-center justify-center overflow-hidden shadow-sm">
            <Mascot className="w-16 h-16" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <h2 className="font-cartoon font-semibold text-2xl text-[#2B1E14] leading-none">
            AnamIQ
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF1E0] text-[#F4741B] font-semibold border border-[#FFE0C2] leading-none">
            v{CREATOR.version}
          </span>
        </div>

        <p className="text-sm text-[#9A8878] mt-3 leading-relaxed">
          Your personal AI tutor — quick answers, smart summaries, and
          personalized study support.
        </p>

        <div className="my-5 h-px bg-[#F0E4D6]" />

        <p className="text-[11px] text-[#B4A08B] flex items-center justify-center gap-1 select-none">
          Made with
          <IconHeart className="w-3 h-3 text-[#F4741B] inline" />
          by
        </p>
        <p className="font-cartoon font-semibold text-lg text-[#2B1E14] mt-0.5">
          {CREATOR.name}
        </p>

        <div className="flex items-center justify-center gap-2.5 mt-4">
          <a
            href={CREATOR.facebook}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#F0E4D6] text-[#2B1E14] text-xs font-medium hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 hover:text-[#1877F2] transition-all active:scale-95"
          >
            <IconFacebook className="w-3.5 h-3.5" />
            Facebook
          </a>
          <a
            href={CREATOR.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#F0E4D6] text-[#2B1E14] text-xs font-medium hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5 hover:text-[#0A66C2] transition-all active:scale-95"
          >
            <IconLinkedIn className="w-3.5 h-3.5" />
            LinkedIn
          </a>
        </div>

        <p className="text-[10px] text-[#C9B79E] mt-5">
          © {new Date().getFullYear()} AnamIQ · Version {CREATOR.version}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Typing Indicator ---------------- */

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-fadeIn">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF1E0] to-[#FFE0C2] border border-[#F5DEC5] flex items-center justify-center overflow-hidden shadow-sm">
        <Mascot className="w-6 h-6" />
      </div>
      <div className="bg-white border border-[#F0E4D6] rounded-[20px] rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1">
        <span className="typing-dot w-1.5 h-1.5 bg-[#F4741B] rounded-full" />
        <span className="typing-dot w-1.5 h-1.5 bg-[#F4741B] rounded-full [animation-delay:0.15s]" />
        <span className="typing-dot w-1.5 h-1.5 bg-[#F4741B] rounded-full [animation-delay:0.3s]" />
      </div>
    </div>
  );
}