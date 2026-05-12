import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Sparkles, Cpu, ShieldCheck, MessageSquare } from "lucide-react";

import { useChatStore } from "../store/chats.js";

const features = [
  {
    icon: Sparkles,
    title: "Streaming AI replies",
    desc: "Tokens stream in real time over server-sent events for a snappy, ChatGPT-style feel.",
  },
  {
    icon: Globe,
    title: "Tavily web search",
    desc: "Toggle web mode and the assistant grounds its answers with live search results.",
  },
  {
    icon: Cpu,
    title: "Multi-model picker",
    desc: "DeepSeek, Llama 3.1, Mistral — switch OpenRouter models from the navbar in one click.",
  },
  {
    icon: ShieldCheck,
    title: "Backend-proxied keys",
    desc: "OpenRouter & Tavily keys stay on the server. The frontend never sees secrets.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const newChat = useChatStore((s) => s.newChat);

  const start = () => {
    const id = newChat();
    navigate(`/chat/${id}`);
  };

  return (
    <motion.section
      key="home"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full overflow-y-auto px-4 py-8 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-purple shadow-neon-soft" />
            <span>Neon AI · streaming chat with the web</span>
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            <span className="gradient-text">Search. Think. Answer.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300/90">
            A futuristic dark-mode AI workspace. Chat with open-source LLMs through OpenRouter and
            pull live answers from the web with Tavily — all behind a secure backend proxy.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button onClick={start} className="btn-neon">
              <MessageSquare size={16} />
              Start a new chat
              <ArrowRight size={14} />
            </button>
            <Link to="/about" className="btn-ghost">
              Learn more
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * i }}
              className="glass neon-border rounded-2xl p-4"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 border border-white/10">
                <f.icon size={16} className="text-neon-purple" />
              </div>
              <div className="mt-3 font-display text-lg">{f.title}</div>
              <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <SuggestionCard
            onClick={start}
            title="Summarize the latest in AI"
            hint="Tip: enable Web search for fresh answers."
          />
          <SuggestionCard
            onClick={start}
            title="Write a Python script to clean a CSV"
            hint="Code blocks come syntax-highlighted with a copy button."
          />
          <SuggestionCard
            onClick={start}
            title="Compare React state management libraries"
            hint="Switch models in the navbar to compare outputs."
          />
          <SuggestionCard
            onClick={start}
            title="Draft a launch tweet for my app"
            hint="Markdown, tables, and lists render beautifully."
          />
        </div>
      </div>
    </motion.section>
  );
}

function SuggestionCard({ title, hint, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group glass rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-neon-soft"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] border border-white/10">
          <Sparkles size={14} className="text-neon-purple" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-slate-100 group-hover:text-white">{title}</div>
          <div className="mt-0.5 text-xs text-slate-500">{hint}</div>
        </div>
        <ArrowRight size={14} className="ml-auto text-slate-500 group-hover:text-white transition" />
      </div>
    </button>
  );
}
