const PREFIX = "neon-ai:";

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded or storage unavailable — ignore
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* noop */
  }
}
