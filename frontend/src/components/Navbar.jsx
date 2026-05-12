import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Globe, Sparkles, Settings as SettingsIcon, Plus } from "lucide-react";

import { useUIStore } from "../store/ui.js";
import { useChatStore } from "../store/chats.js";
import { fetchModels } from "../services/api.js";

export default function Navbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const searchMode = useUIStore((s) => s.searchMode);
  const toggleSearch = useUIStore((s) => s.toggleSearchMode);
  const model = useUIStore((s) => s.model);
  const setModel = useUIStore((s) => s.setModel);
  const newChat = useChatStore((s) => s.newChat);
  const navigate = useNavigate();

  const [models, setModels] = useState([]);

  useEffect(() => {
    let live = true;
    fetchModels()
      .then((data) => {
        if (live) setModels(data.models || []);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-white/10 bg-bg-panel/60 px-3 py-3 backdrop-blur-xl md:px-6">
      <button
        onClick={toggleSidebar}
        className="btn-ghost md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={16} />
      </button>

      <NavLink to="/" className="flex items-center gap-2 md:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue shadow-neon-soft">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="font-display text-base gradient-text">Neon AI</div>
      </NavLink>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          onClick={toggleSearch}
          className={`chip transition ${
            searchMode
              ? "border-neon-blue/50 text-neon-blue bg-neon-blue/10"
              : "hover:text-white"
          }`}
          title="Toggle Tavily web search context for this chat"
        >
          <Globe size={14} />
          <span>Web search {searchMode ? "on" : "off"}</span>
        </button>

        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="chip pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-purple/40"
            title="Select OpenRouter model"
          >
            {models.length === 0 && <option value={model}>{model}</option>}
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-bg-panel text-slate-200">
                {m.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        <button
          onClick={() => {
            const id = newChat();
            navigate(`/chat/${id}`);
          }}
          className="btn-ghost"
          title="Start a new chat"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New</span>
        </button>

        <NavLink to="/settings" className="btn-ghost" title="Settings">
          <SettingsIcon size={14} />
        </NavLink>
      </div>
    </header>
  );
}
