import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Trash2 } from "lucide-react";

import { useChatStore } from "../store/chats.js";
import { useUIStore } from "../store/ui.js";
import { formatDate, formatTime } from "../utils/format.js";

export default function History() {
  const chats = useChatStore((s) => s.chats);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const clearAll = useChatStore((s) => s.clearAll);
  const setActive = useChatStore((s) => s.setActive);
  const pushToast = useUIStore((s) => s.pushToast);
  const navigate = useNavigate();

  const open = (id) => {
    setActive(id);
    navigate(`/chat/${id}`);
  };

  return (
    <motion.section
      key="history"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl gradient-text">History</h1>
            <p className="mt-1 text-sm text-slate-400">
              All chats are saved locally in your browser. Nothing leaves your device unless you send a
              message.
            </p>
          </div>
          {chats.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Delete every chat? This cannot be undone.")) {
                  clearAll();
                  pushToast({ kind: "info", message: "All chats deleted." });
                }
              }}
              className="btn-ghost border-red-400/30 text-red-200 hover:text-red-100"
            >
              <Trash2 size={14} />
              Delete all
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3">
          {chats.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-slate-400">
              No chats yet. Start a new one from the sidebar.
            </div>
          )}
          {chats.map((c) => (
            <div
              key={c.id}
              className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-neon-soft"
            >
              <button
                onClick={() => open(c.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 border border-white/10">
                  <MessageSquare size={16} className="text-neon-purple" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-100">{c.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {c.messages.length} message{c.messages.length === 1 ? "" : "s"} ·{" "}
                    {formatDate(c.updatedAt)} {formatTime(c.updatedAt)}
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  deleteChat(c.id);
                  pushToast({ kind: "info", message: "Chat deleted." });
                }}
                className="btn-ghost border-red-400/20 text-red-300 hover:text-red-200"
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
