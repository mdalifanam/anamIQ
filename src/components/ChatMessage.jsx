import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Mascot } from "./Mascot";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex items-end gap-2.5 animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF1E0] to-[#FFE0C2] border border-[#F5DEC5] flex items-center justify-center overflow-hidden shadow-sm">
          <Mascot className="w-6 h-6" />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[78%] px-4 py-2.5 md:py-3 text-sm md:text-[15px] leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-[#FF8A3D] to-[#EA580C] text-white rounded-[20px] rounded-br-md shadow-lg shadow-orange-500/20"
            : "bg-white text-[#2B1E14] border border-[#F0E4D6] rounded-[20px] rounded-bl-md shadow-sm"
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="attachment"
            className="rounded-2xl mb-2 max-w-full max-h-64 object-cover border border-white/20"
          />
        )}

        {message.text &&
          (isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mt-3 mb-2 text-[#2B1E14]">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mt-3 mb-2 text-[#2B1E14]">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-[15px] font-semibold mt-2.5 mb-1.5 text-[#2B1E14]">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-2 ml-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 my-2 ml-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#F4741B]">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#F4741B] underline underline-offset-2 hover:text-[#EA580C]"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    if (inline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded-md bg-[#FFF1E0] text-[#B8450A] font-mono text-[13px]">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="my-2.5 rounded-xl overflow-hidden border border-[#2B1E14]/10">
                        {match && (
                          <div className="bg-[#2B1E14] text-[#FFD1AB] text-[10px] font-mono px-3 py-1.5 uppercase tracking-wider">
                            {match[1]}
                          </div>
                        )}
                        <pre className="bg-[#1E1408] text-[#FFE8CC] p-3 overflow-x-auto text-[12.5px] leading-relaxed scrollbar-thin">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-3 border-[#FFCC9E] pl-3 my-2 text-[#6B5844] italic">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-3 border-[#F0E4D6]" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full text-[13px] border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-[#F0E4D6] bg-[#FFF8F1] px-2 py-1.5 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-[#F0E4D6] px-2 py-1.5">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
              {message.streaming && (
                <span className="inline-block w-1.5 h-4 bg-[#F4741B] ml-0.5 align-middle animate-pulse rounded-sm" />
              )}
            </div>
          ))}

        {!message.streaming && (
          <p
            className={`text-[10px] mt-1.5 text-right ${
              isUser ? "text-white/70" : "text-[#B4A08B]"
            }`}
          >
            {message.time}
          </p>
        )}
      </div>
    </div>
  );
}