import { create } from "zustand";
import { loadJSON, saveJSON } from "../utils/storage.js";

const SETTINGS_KEY = "settings:v1";

const defaults = {
  sidebarOpen: true,
  model: "deepseek/deepseek-chat-v3-0324:free",
  searchMode: false,
  temperature: 0.7,
  toasts: [],
};

let toastId = 0;

export const useUIStore = create((set, get) => ({
  ...defaults,

  hydrate: () => {
    const saved = loadJSON(SETTINGS_KEY, {});
    set({
      sidebarOpen: saved.sidebarOpen ?? defaults.sidebarOpen,
      model: saved.model ?? defaults.model,
      searchMode: saved.searchMode ?? defaults.searchMode,
      temperature: saved.temperature ?? defaults.temperature,
    });
  },

  _persist: () => {
    const { sidebarOpen, model, searchMode, temperature } = get();
    saveJSON(SETTINGS_KEY, { sidebarOpen, model, searchMode, temperature });
  },

  setSidebar: (open) => {
    set({ sidebarOpen: open });
    get()._persist();
  },

  toggleSidebar: () => {
    set((s) => ({ sidebarOpen: !s.sidebarOpen }));
    get()._persist();
  },

  setModel: (model) => {
    set({ model });
    get()._persist();
  },

  setSearchMode: (v) => {
    set({ searchMode: v });
    get()._persist();
  },

  toggleSearchMode: () => {
    set((s) => ({ searchMode: !s.searchMode }));
    get()._persist();
  },

  setTemperature: (t) => {
    set({ temperature: t });
    get()._persist();
  },

  pushToast: (toast) => {
    const id = ++toastId;
    const t = { id, kind: "info", duration: 3500, ...toast };
    set((s) => ({ toasts: [...s.toasts, t] }));
    if (t.duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, t.duration);
    }
    return id;
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
