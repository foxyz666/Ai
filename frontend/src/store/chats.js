import { create } from "zustand";
import { loadJSON, saveJSON } from "../utils/storage.js";
import { titleFromMessages } from "../utils/format.js";

const STORAGE_KEY = "chats:v1";

function newId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

function createChat(initial = {}) {
  return {
    id: newId(),
    title: "New chat",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    ...initial,
  };
}

export const useChatStore = create((set, get) => ({
  chats: [],
  activeId: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const data = loadJSON(STORAGE_KEY, { chats: [], activeId: null });
    set({
      chats: Array.isArray(data.chats) ? data.chats : [],
      activeId: data.activeId || null,
      hydrated: true,
    });
  },

  _persist: () => {
    const { chats, activeId } = get();
    saveJSON(STORAGE_KEY, { chats, activeId });
  },

  newChat: () => {
    const chat = createChat();
    set((s) => ({ chats: [chat, ...s.chats], activeId: chat.id }));
    get()._persist();
    return chat.id;
  },

  setActive: (id) => {
    set({ activeId: id });
    get()._persist();
  },

  deleteChat: (id) => {
    set((s) => {
      const chats = s.chats.filter((c) => c.id !== id);
      const activeId = s.activeId === id ? chats[0]?.id || null : s.activeId;
      return { chats, activeId };
    });
    get()._persist();
  },

  clearAll: () => {
    set({ chats: [], activeId: null });
    get()._persist();
  },

  renameChat: (id, title) => {
    set((s) => ({
      chats: s.chats.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)),
    }));
    get()._persist();
  },

  getChat: (id) => get().chats.find((c) => c.id === id) || null,

  ensureActive: () => {
    const { activeId, chats } = get();
    if (activeId && chats.find((c) => c.id === activeId)) return activeId;
    return get().newChat();
  },

  addMessage: (chatId, message) => {
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== chatId) return c;
        const next = {
          ...c,
          updatedAt: Date.now(),
          messages: [...c.messages, { id: newId(), createdAt: Date.now(), ...message }],
        };
        if (c.title === "New chat") next.title = titleFromMessages(next.messages);
        return next;
      }),
    }));
    get()._persist();
  },

  updateMessage: (chatId, messageId, patch) => {
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
        };
      }),
    }));
    // Don't persist on every token tick — debounce via _persist on completion.
  },

  finalizeChat: (chatId) => {
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, updatedAt: Date.now() } : c)),
    }));
    get()._persist();
  },

  removeMessage: (chatId, messageId) => {
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c
      ),
    }));
    get()._persist();
  },

  clearChat: (chatId) => {
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, messages: [], title: "New chat", updatedAt: Date.now() } : c
      ),
    }));
    get()._persist();
  },
}));
