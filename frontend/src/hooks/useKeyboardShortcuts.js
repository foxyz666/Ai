import { useEffect } from "react";

/**
 * Lightweight keyboard shortcut hook.
 *
 * shortcuts: { [combo: string]: () => void }
 * Combo format: "Mod+K", "Mod+Shift+L", "Esc"
 * "Mod" matches Ctrl on Linux/Windows and Cmd on macOS.
 */
export default function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName;
      const isInput =
        (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) &&
        !(e.ctrlKey || e.metaKey);
      if (isInput) return;
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push("Mod");
      if (e.shiftKey) parts.push("Shift");
      if (e.altKey) parts.push("Alt");
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      parts.push(key);
      const combo = parts.join("+");
      const fn = shortcuts[combo];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
