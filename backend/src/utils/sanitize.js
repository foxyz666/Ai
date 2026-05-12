// Lightweight input sanitization helpers. Not a substitute for full HTML
// sanitization on render — the frontend renders Markdown safely via
// react-markdown which already escapes raw HTML.

const MAX_LEN = 8000;

export function sanitizeText(input, max = MAX_LEN) {
  if (typeof input !== "string") return "";
  let s = input.replace(/\u0000/g, ""); // strip NULs
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, ""); // zero-width chars
  if (s.length > max) s = s.slice(0, max);
  return s.trim();
}

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((m) => ({
      role: m.role === "system" || m.role === "assistant" ? m.role : "user",
      content: sanitizeText(m.content ?? ""),
    }))
    .filter((m) => m.content.length > 0);
}
