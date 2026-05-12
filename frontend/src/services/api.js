// Frontend API client. All requests go to the backend proxy — never call
// OpenRouter or Tavily directly so API keys stay on the server.

const BASE = ""; // same origin (Vite proxies /api in dev)

export async function fetchHealth() {
  const res = await fetch(`${BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}

export async function fetchModels() {
  const res = await fetch(`${BASE}/api/models`);
  if (!res.ok) throw new Error(`Failed to load models (${res.status})`);
  return res.json();
}

export async function searchWeb({ query, signal }) {
  const res = await fetch(`${BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Search failed (${res.status})`);
  }
  return res.json();
}

/**
 * Stream a chat completion from the backend SSE endpoint.
 *
 * @param {{
 *   messages: {role:"user"|"assistant"|"system", content:string}[],
 *   model?: string,
 *   temperature?: number,
 *   search?: boolean,
 *   signal?: AbortSignal,
 *   onToken?: (text:string)=>void,
 *   onStatus?: (status:{stage:string, [k:string]:any})=>void,
 *   onSearch?: (result:any)=>void,
 *   onWarning?: (msg:string)=>void,
 * }} params
 * @returns {Promise<{ok:boolean}>}
 */
export async function streamChat({
  messages,
  model,
  temperature,
  search,
  signal,
  onToken,
  onStatus,
  onSearch,
  onWarning,
}) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ messages, model, temperature, search }),
    signal,
  });
  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error?.message || "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Chat request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  // Parse line-delimited SSE: blocks separated by "\n\n", lines start with "event:" / "data:"
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      let event = "message";
      let dataLine = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;
      let payload;
      try {
        payload = JSON.parse(dataLine);
      } catch {
        continue;
      }
      switch (event) {
        case "token":
          onToken?.(payload.content || "");
          break;
        case "status":
          onStatus?.(payload);
          break;
        case "search":
          onSearch?.(payload);
          break;
        case "warning":
          onWarning?.(payload.message || "Warning");
          break;
        case "error":
          throw new Error(payload.message || "Stream error");
        case "done":
          return { ok: true };
        default:
          break;
      }
    }
  }
  return { ok: true };
}
