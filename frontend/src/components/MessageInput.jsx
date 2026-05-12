import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Globe, Square } from "lucide-react";

import { useUIStore } from "../store/ui.js";

export default function MessageInput({ value, onChange, onSend, onStop, busy, disabled }) {
  const ref = useRef(null);
  const searchMode = useUIStore((s) => s.searchMode);
  const toggleSearch = useUIStore((s) => s.toggleSearchMode);

  useEffect(() => {
    if (ref.current) autosize(ref.current);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy && value.trim()) onSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-bg-panel/60 px-3 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="glass relative rounded-2xl p-2 neon-border">
          <textarea
            ref={ref}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Backend not configured — see Settings."
                : "Ask anything…  (Shift+Enter for newline)"
            }
            rows={1}
            className="block w-full resize-none bg-transparent px-2 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
            style={{ maxHeight: 220 }}
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSearch}
                title="Toggle web search context (Ctrl/Cmd + K)"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition border ${
                  searchMode
                    ? "border-neon-blue/50 bg-neon-blue/10 text-neon-blue"
                    : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Globe size={12} />
                Web {searchMode ? "on" : "off"}
              </button>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Enter to send · Shift+Enter for newline
              </span>
            </div>

            {busy ? (
              <motion.button
                onClick={onStop}
                whileTap={{ scale: 0.96 }}
                className="btn-ghost border-red-400/30 text-red-300 hover:text-red-200"
                title="Stop generating"
              >
                <Square size={14} />
                Stop
              </motion.button>
            ) : (
              <motion.button
                onClick={onSend}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                disabled={disabled || !value.trim()}
                className="btn-neon disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send (Enter)"
              >
                <ArrowUp size={14} />
                Send
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function autosize(el) {
  el.style.height = "0px";
  el.style.height = Math.min(el.scrollHeight, 220) + "px";
}
