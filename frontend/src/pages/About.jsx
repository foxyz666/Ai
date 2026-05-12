import { motion } from "framer-motion";
import { Github, Sparkles } from "lucide-react";

export default function About() {
  return (
    <motion.section
      key="about"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
            <Sparkles size={12} className="text-neon-purple" />
            <span>About this project</span>
          </div>
          <h1 className="mt-4 font-display text-3xl gradient-text">Neon AI</h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-400">
            A modern, full-stack AI chat application built as a Perplexity / Cursor-style demo. It
            streams responses from OpenRouter and grounds answers with Tavily web search — all behind a
            secure Express backend so your API keys never reach the browser.
          </p>
        </header>

        <section className="glass neon-border rounded-2xl p-5">
          <h2 className="font-display text-lg">Stack</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <li>⚡ React 18 + Vite</li>
            <li>🎨 TailwindCSS + Framer Motion</li>
            <li>📡 Express server (Node 18+)</li>
            <li>🧠 OpenRouter chat completions (SSE streaming)</li>
            <li>🌐 Tavily web search API</li>
            <li>🛡️ Rate limiting, CORS, request validation (zod)</li>
            <li>💾 LocalStorage chat persistence (zustand)</li>
            <li>📝 Markdown + syntax-highlighted code blocks</li>
          </ul>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>
              <code>npm run install:all</code> from the repo root to install both backend and frontend
              dependencies.
            </li>
            <li>
              Copy <code>backend/.env.example</code> to <code>backend/.env</code> and add your
              <code> OPENROUTER_API_KEY</code> and <code>TAVILY_API_KEY</code>.
            </li>
            <li>
              Run <code>npm run dev</code> to start the backend (<code>:5174</code>) and frontend
              (<code>:5173</code>) together.
            </li>
            <li>
              Open <code>http://localhost:5173</code> and start chatting.
            </li>
          </ol>
        </section>

        <div className="text-center">
          <a
            href="https://github.com/foxyz666/Ai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <Github size={14} />
            View on GitHub
          </a>
        </div>
      </div>
    </motion.section>
  );
}
