import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Globe, KeyRound, Sparkles, Thermometer } from "lucide-react";

import { useUIStore } from "../store/ui.js";
import { fetchHealth, fetchModels } from "../services/api.js";

export default function Settings() {
  const model = useUIStore((s) => s.model);
  const setModel = useUIStore((s) => s.setModel);
  const temperature = useUIStore((s) => s.temperature);
  const setTemperature = useUIStore((s) => s.setTemperature);
  const searchMode = useUIStore((s) => s.searchMode);
  const setSearchMode = useUIStore((s) => s.setSearchMode);

  const [models, setModels] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchModels()
      .then((d) => setModels(d.models || []))
      .catch(() => {});
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: "error", integrations: { openrouter: false, tavily: false } }));
  }, []);

  return (
    <motion.section
      key="settings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="font-display text-3xl gradient-text">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure the model, temperature, and search behavior. Your settings are stored locally in
            this browser.
          </p>
        </header>

        <section className="glass neon-border rounded-2xl p-5">
          <SectionTitle icon={Cpu}>Model</SectionTitle>
          <p className="mt-1 text-sm text-slate-400">
            All requests are proxied through the backend using your <code>OPENROUTER_API_KEY</code>.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(models.length ? models : [{ id: model, name: model, description: "Loading…" }]).map(
              (m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`rounded-xl p-3 text-left transition border ${
                    model === m.id
                      ? "border-neon-purple/60 bg-neon-purple/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-100">{m.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{m.description}</div>
                  <div className="mt-2 truncate text-[10px] uppercase tracking-widest text-slate-500">
                    {m.id}
                  </div>
                </button>
              )
            )}
          </div>
        </section>

        <section className="glass neon-border rounded-2xl p-5">
          <SectionTitle icon={Thermometer}>Temperature</SectionTitle>
          <p className="mt-1 text-sm text-slate-400">
            Higher values make replies more creative; lower values make them more focused.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-neon-purple"
            />
            <span className="w-10 text-right font-mono text-sm text-slate-200">
              {temperature.toFixed(1)}
            </span>
          </div>
        </section>

        <section className="glass neon-border rounded-2xl p-5">
          <SectionTitle icon={Globe}>Web search (Tavily)</SectionTitle>
          <p className="mt-1 text-sm text-slate-400">
            When enabled, the assistant runs a Tavily search before responding and uses the results as
            context.
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={searchMode}
              onChange={(e) => setSearchMode(e.target.checked)}
              className="h-4 w-4 accent-neon-purple"
            />
            <span className="text-sm text-slate-200">Enable web search by default</span>
          </label>
        </section>

        <section className="glass neon-border rounded-2xl p-5">
          <SectionTitle icon={KeyRound}>API keys</SectionTitle>
          <p className="mt-1 text-sm text-slate-400">
            Keys live only in <code>backend/.env</code>. The frontend never sees them.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <StatusPill
              label="OpenRouter"
              ok={!!health?.integrations?.openrouter}
              hint="Set OPENROUTER_API_KEY in backend/.env"
            />
            <StatusPill
              label="Tavily"
              ok={!!health?.integrations?.tavily}
              hint="Set TAVILY_API_KEY in backend/.env"
            />
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <SectionTitle icon={Sparkles}>Keyboard shortcuts</SectionTitle>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <Shortcut keys={["Enter"]} desc="Send message" />
            <Shortcut keys={["Shift", "Enter"]} desc="Newline" />
            <Shortcut keys={["Ctrl/⌘", "K"]} desc="Toggle web search" />
            <Shortcut keys={["Ctrl/⌘", "Shift", "O"]} desc="New chat" />
            <Shortcut keys={["Ctrl/⌘", "L"]} desc="Clear current chat" />
            <Shortcut keys={["Esc"]} desc="Stop generation" />
          </ul>
        </section>
      </div>
    </motion.section>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 font-display text-lg">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] border border-white/10">
        <Icon size={14} className="text-neon-purple" />
      </span>
      <span>{children}</span>
    </div>
  );
}

function StatusPill({ label, ok, hint }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        ok ? "border-emerald-400/30 bg-emerald-500/[0.06]" : "border-red-400/30 bg-red-500/[0.06]"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"} shadow-neon-soft`}
        />
        <span className="font-medium">{label}</span>
        <span className={`ml-auto text-xs ${ok ? "text-emerald-300" : "text-red-300"}`}>
          {ok ? "configured" : "missing"}
        </span>
      </div>
      {!ok && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

function Shortcut({ keys, desc }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-slate-200"
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="text-sm text-slate-400">{desc}</span>
    </li>
  );
}
