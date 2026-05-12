import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  History,
  Settings as SettingsIcon,
  Info,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";

import { useChatStore } from "../store/chats.js";
import { useUIStore } from "../store/ui.js";
import { formatDate } from "../utils/format.js";

const navItems = [
  { to: "/", label: "Home", icon: Sparkles },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
  { to: "/about", label: "About", icon: Info },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.sidebarOpen);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const chats = useChatStore((s) => s.chats);
  const activeId = useChatStore((s) => s.activeId);
  const newChat = useChatStore((s) => s.newChat);
  const setActive = useChatStore((s) => s.setActive);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const pushToast = useUIStore((s) => s.pushToast);

  const handleNew = () => {
    const id = newChat();
    navigate(`/chat/${id}`);
  };

  const handleSelect = (id) => {
    setActive(id);
    navigate(`/chat/${id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteChat(id);
    pushToast({ kind: "info", message: "Chat deleted." });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/10 bg-bg-panel/70 backdrop-blur-xl transition-[width] duration-300 ${
        open ? "w-72" : "w-16"
      } hidden md:flex`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue shadow-neon-soft">
            <Sparkles size={18} className="text-white" />
          </div>
          {open && (
            <div>
              <div className="font-display text-lg gradient-text">Neon AI</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">cyber chat</div>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          className="text-slate-400 hover:text-white transition"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <div className="px-3 py-3">
        <button onClick={handleNew} className="btn-neon w-full">
          <Plus size={16} />
          {open && <span>New chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {open && (
          <div className="px-2 py-2 text-[10px] uppercase tracking-widest text-slate-500">
            Recent chats
          </div>
        )}
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {chats.map((c) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={() => handleSelect(c.id)}
                  className={`group flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition ${
                    activeId === c.id
                      ? "bg-white/[0.07] border border-neon-purple/30"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}
                  title={c.title}
                >
                  <MessageSquare size={16} className="shrink-0 text-neon-purple/80" />
                  {open && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-sm">{c.title}</span>
                      <span className="hidden sm:inline text-[10px] text-slate-500">
                        {formatDate(c.updatedAt)}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDelete(e, c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleDelete(e, c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-300 transition"
                        aria-label="Delete chat"
                      >
                        <Trash2 size={14} />
                      </span>
                    </>
                  )}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {chats.length === 0 && open && (
            <li className="px-2 py-3 text-xs text-slate-500">No chats yet. Start one above.</li>
          )}
        </ul>
      </div>

      <nav className="border-t border-white/10 px-2 py-2">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-white/[0.07] text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`
                }
                title={label}
              >
                <Icon size={16} />
                {open && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
