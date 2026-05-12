import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Eraser, MessageSquarePlus } from "lucide-react";

import Message from "../components/Message.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useChatStore } from "../store/chats.js";
import { useUIStore } from "../store/ui.js";
import { streamChat, fetchHealth } from "../services/api.js";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts.js";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();

  const chats = useChatStore((s) => s.chats);
  const activeId = useChatStore((s) => s.activeId);
  const setActive = useChatStore((s) => s.setActive);
  const newChat = useChatStore((s) => s.newChat);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const finalizeChat = useChatStore((s) => s.finalizeChat);
  const clearChat = useChatStore((s) => s.clearChat);
  const removeMessage = useChatStore((s) => s.removeMessage);

  const model = useUIStore((s) => s.model);
  const temperature = useUIStore((s) => s.temperature);
  const searchMode = useUIStore((s) => s.searchMode);
  const pushToast = useUIStore((s) => s.pushToast);
  const toggleSearch = useUIStore((s) => s.toggleSearchMode);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [backendOk, setBackendOk] = useState(true);
  const [backendInfo, setBackendInfo] = useState(null);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  // Pick the active chat (URL takes precedence, fall back to active or create one).
  useEffect(() => {
    if (id) {
      if (chats.find((c) => c.id === id)) {
        if (activeId !== id) setActive(id);
        return;
      }
    }
    if (activeId && chats.find((c) => c.id === activeId)) {
      navigate(`/chat/${activeId}`, { replace: true });
      return;
    }
    const newId = newChat();
    navigate(`/chat/${newId}`, { replace: true });
  }, [id, activeId, chats, setActive, newChat, navigate]);

  const chat = useMemo(() => chats.find((c) => c.id === id) || null, [chats, id]);

  // Auto-scroll on new messages or streaming updates.
  const lastMessageContent = chat?.messages?.at?.(-1)?.content;
  const messagesCount = chat?.messages?.length;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messagesCount, lastMessageContent, streamingId]);

  // Health check (to disable the input when backend is missing keys).
  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setBackendInfo(data);
        if (!data.integrations.openrouter) setBackendOk(false);
      })
      .catch(() => setBackendOk(false));
  }, []);

  const runChat = useCallback(
    async ({ history, assistantId }) => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setBusy(true);
      setStreamingId(assistantId);
      try {
        await streamChat({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          model,
          temperature,
          search: searchMode,
          signal: ctrl.signal,
          onStatus: (s) => {
            updateMessage(chat.id, assistantId, {
              statusText:
                s.stage === "searching"
                  ? `Searching the web for "${s.query}"…`
                  : s.stage === "thinking"
                  ? "Thinking…"
                  : s.stage,
            });
          },
          onSearch: (search) => {
            updateMessage(chat.id, assistantId, { search });
          },
          onWarning: (m) => pushToast({ kind: "error", message: m }),
          onToken: (text) => {
            updateMessage(chat.id, assistantId, {
              content: (getCurrentContent(chat.id, assistantId) || "") + text,
              statusText: "",
            });
          },
        });
        finalizeChat(chat.id);
      } catch (err) {
        if (err.name === "AbortError") {
          updateMessage(chat.id, assistantId, { aborted: true });
        } else {
          updateMessage(chat.id, assistantId, {
            content:
              (getCurrentContent(chat.id, assistantId) || "") +
              `\n\n> _Error: ${err.message}_`,
          });
          pushToast({ kind: "error", message: err.message });
        }
        finalizeChat(chat.id);
      } finally {
        abortRef.current = null;
        setBusy(false);
        setStreamingId(null);
      }
    },
    [chat, model, temperature, searchMode, pushToast, finalizeChat, updateMessage]
  );

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !chat) return;
    setInput("");

    addMessage(chat.id, { role: "user", content: text });
    const assistantId = pushAssistantPlaceholder(chat.id, model);

    // Need the latest history (after both adds).
    const latest = useChatStore.getState().getChat(chat.id);
    const history = latest.messages.filter((m) => m.id !== assistantId);

    await runChat({ history, assistantId });
  };

  const retryLast = async () => {
    if (!chat || busy) return;
    const lastAssistant = [...chat.messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    removeMessage(chat.id, lastAssistant.id);
    const latest = useChatStore.getState().getChat(chat.id);
    const assistantId = pushAssistantPlaceholder(chat.id, model);
    await runChat({ history: latest.messages, assistantId });
  };

  const stop = () => {
    abortRef.current?.abort();
    pushToast({ kind: "info", message: "Generation stopped." });
  };

  const exportChat = () => {
    if (!chat) return;
    const lines = [`# ${chat.title}`, ""];
    chat.messages.forEach((m) => {
      lines.push(`**${m.role === "user" ? "You" : "Assistant"}** · ${new Date(m.createdAt).toLocaleString()}`);
      lines.push("");
      lines.push(m.content || "");
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(chat.title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ kind: "success", message: "Exported chat as Markdown." });
  };

  useKeyboardShortcuts({
    "Mod+K": toggleSearch,
    "Mod+Shift+O": () => {
      const newId = newChat();
      navigate(`/chat/${newId}`);
    },
    "Mod+L": () => chat && clearChat(chat.id),
    Escape: () => busy && stop(),
  });

  if (!chat) {
    return <div className="grid h-full place-items-center text-slate-500">Loading chat…</div>;
  }

  return (
    <motion.section
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/5 bg-bg-panel/40 px-3 py-2 backdrop-blur-xl md:px-6">
        <div className="min-w-0 flex items-center gap-2">
          <h2 className="truncate font-display text-base text-slate-200">{chat.title}</h2>
          <span className="chip hidden sm:inline-flex">{model.split("/").pop()}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={exportChat} className="btn-ghost" title="Export chat as Markdown">
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => clearChat(chat.id)}
            className="btn-ghost"
            title="Clear messages in this chat"
          >
            <Eraser size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-6 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {chat.messages.length === 0 ? (
            <EmptyState />
          ) : (
            chat.messages.map((m) => (
              <Message
                key={m.id}
                message={m}
                isStreaming={streamingId === m.id}
                onRetry={
                  m.role === "assistant" && streamingId !== m.id ? retryLast : undefined
                }
              />
            ))
          )}
        </div>
      </div>

      {!backendOk && (
        <div className="mx-3 mb-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 md:mx-6">
          OpenRouter is not configured on the backend. Add{" "}
          <code className="rounded bg-black/30 px-1">OPENROUTER_API_KEY</code> to{" "}
          <code className="rounded bg-black/30 px-1">backend/.env</code> and restart the server.
          {backendInfo && !backendInfo.integrations.tavily && (
            <> Web search will also require <code className="rounded bg-black/30 px-1">TAVILY_API_KEY</code>.</>
          )}
        </div>
      )}

      <MessageInput
        value={input}
        onChange={setInput}
        onSend={send}
        onStop={stop}
        busy={busy}
        disabled={!backendOk}
      />
    </motion.section>
  );
}

function pushAssistantPlaceholder(chatId, model) {
  useChatStore.getState().addMessage(chatId, {
    role: "assistant",
    content: "",
    model,
  });
  // The store assigns a fresh id; grab the latest one.
  const chat = useChatStore.getState().getChat(chatId);
  const last = chat.messages[chat.messages.length - 1];
  return last.id;
}

function getCurrentContent(chatId, messageId) {
  const chat = useChatStore.getState().getChat(chatId);
  return chat?.messages.find((m) => m.id === messageId)?.content || "";
}

function slugify(s) {
  return (
    (s || "chat")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "chat"
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center py-16">
      <div className="glass rounded-2xl p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue shadow-neon-soft">
          <MessageSquarePlus size={20} className="text-white" />
        </div>
        <h3 className="mt-3 font-display text-xl gradient-text">Start the conversation</h3>
        <p className="mt-1 max-w-md text-sm text-slate-400">
          Ask anything. Toggle <strong>Web</strong> in the input below to ground answers with live
          Tavily search results.
        </p>
      </div>
    </div>
  );
}
