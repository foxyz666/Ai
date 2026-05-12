import { motion } from "framer-motion";
import { Bot, User, Copy, Check, RefreshCcw, Sparkles } from "lucide-react";
import { useState } from "react";

import Markdown from "./Markdown.jsx";
import SearchResults from "./SearchResults.jsx";
import { formatTime } from "../utils/format.js";

export default function Message({ message, isStreaming, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue shadow-neon-soft">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-br from-neon-violet/30 to-neon-blue/20 border border-neon-purple/30"
              : "glass neon-border"
          }`}
        >
          {!isUser && message.search && <SearchResults result={message.search} />}

          {message.content ? (
            <Markdown>{message.content + (isStreaming ? "​" : "")}</Markdown>
          ) : isStreaming ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={14} className="animate-pulse text-neon-purple" />
              <span>{message.statusText || "Thinking…"}</span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Empty message</span>
          )}
          {isStreaming && message.content && (
            <span className="caret inline-block align-baseline" />
          )}
        </div>

        <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
          <span>{formatTime(message.createdAt)}</span>
          {message.model && !isUser && (
            <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-400">
              {message.model.split("/").pop()}
            </span>
          )}
          {!isStreaming && (
            <>
              <button onClick={handleCopy} className="hover:text-white transition inline-flex items-center gap-1">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              {!isUser && onRetry && (
                <button onClick={onRetry} className="hover:text-white transition inline-flex items-center gap-1">
                  <RefreshCcw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isUser && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] border border-white/10">
          <User size={16} className="text-slate-300" />
        </div>
      )}
    </motion.div>
  );
}
