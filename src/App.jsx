import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const initialMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Hi! I'm AnamIQ. How can I help you today?",
    time: getTime(),
  },
];

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getBotReply = async (userText) => {
    try {
      const newHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: userText }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newHistory,
      });

      const botText = response.text;
      setChatHistory([
        ...newHistory,
        { role: "model", parts: [{ text: botText }] },
      ]);
      return botText;
    } catch (error) {
      console.error("Gemini API Error:", error);

      if (error.message?.includes("429"))
        return "I'm getting too many requests right now. Please try again in a moment.";
      if (error.message?.includes("404") || error.message?.includes("not found"))
        return "Model unavailable. Please try again.";
      if (error.message?.includes("API_KEY") || error.message?.includes("API key"))
        return "API key is invalid. Please check your configuration.";
      return "Something went wrong. Please try again.";
    }
  };

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const botText = await getBotReply(trimmed);

    const botMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: botText,
      time: getTime(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-100 md:flex md:items-center md:justify-center md:p-6">
      <div className="w-full h-[100dvh] md:h-[85vh] md:max-w-lg bg-white md:rounded-2xl md:border md:border-neutral-200 md:shadow-xl flex flex-col overflow-hidden">

        <ChatHeader />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-5 md:py-6 space-y-3.5 md:space-y-4 bg-white">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-fadeIn">
      <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center p-1">
        <img src="/logo.png" alt="Bot" className="w-full h-full object-contain" />
      </div>
      <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <span className="typing-dot w-1.5 h-1.5 bg-neutral-500 rounded-full" />
        <span className="typing-dot w-1.5 h-1.5 bg-neutral-500 rounded-full [animation-delay:0.15s]" />
        <span className="typing-dot w-1.5 h-1.5 bg-neutral-500 rounded-full [animation-delay:0.3s]" />
      </div>
    </div>
  );
}