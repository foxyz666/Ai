// Thin wrapper around the OpenRouter chat completions endpoint.
// Supports both streaming (SSE) and non-streaming responses.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function authHeaders() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    const err = new Error("OPENROUTER_API_KEY is not configured on the server.");
    err.status = 500;
    err.code = "openrouter_not_configured";
    throw err;
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:5173",
    "X-Title": process.env.OPENROUTER_APP_NAME || "AI Perplexity Clone",
  };
}

export async function streamChatCompletion({ model, messages, temperature = 0.7, signal }) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    const err = new Error(`OpenRouter request failed (${res.status}): ${text.slice(0, 500)}`);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }

  return res.body; // ReadableStream of SSE bytes
}

export async function chatCompletion({ model, messages, temperature = 0.7, signal }) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ model, messages, temperature, stream: false }),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `OpenRouter request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Available free models surfaced to the frontend model picker.
export const FREE_MODELS = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat v3",
    description: "Strong general-purpose free model from DeepSeek.",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    name: "Llama 3.1 8B Instruct",
    description: "Meta's compact instruction-tuned Llama 3.1 model.",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B Instruct",
    description: "Fast, reliable open-weights instruction model.",
  },
];
