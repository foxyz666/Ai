import { Router } from "express";
import { z } from "zod";

import { validateBody } from "../middleware/validate.js";
import { streamChatCompletion, FREE_MODELS } from "../services/openrouter.js";
import { tavilySearch, buildSearchContext } from "../services/tavily.js";
import { sanitizeMessages, sanitizeText } from "../utils/sanitize.js";

const router = Router();

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(50),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  search: z.boolean().optional(),
});

const allowedIds = new Set(FREE_MODELS.map((m) => m.id));

router.post("/", validateBody(chatSchema), async (req, res, next) => {
  const { temperature = 0.7 } = req.body;
  const requestedModel = req.body.model || process.env.DEFAULT_MODEL || FREE_MODELS[0].id;
  const model = allowedIds.has(requestedModel) ? requestedModel : FREE_MODELS[0].id;
  const useSearch = Boolean(req.body.search);

  const messages = sanitizeMessages(req.body.messages);
  if (!messages.length) {
    const err = new Error("messages must contain at least one non-empty entry.");
    err.status = 400;
    return next(err);
  }

  // Set up SSE response.
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const abortController = new AbortController();
  req.on("close", () => abortController.abort());

  try {
    let finalMessages = messages;

    if (useSearch) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const query = sanitizeText(lastUser?.content || "", 400);
      if (query) {
        sendEvent("status", { stage: "searching", query });
        try {
          const search = await tavilySearch({ query, signal: abortController.signal });
          sendEvent("search", search);
          const context = buildSearchContext(search);
          if (context) {
            finalMessages = [{ role: "system", content: context }, ...messages];
          }
        } catch (searchErr) {
          sendEvent("warning", { message: `Web search failed: ${searchErr.message}` });
        }
      }
    }

    sendEvent("status", { stage: "thinking", model });

    const stream = await streamChatCompletion({
      model,
      messages: finalMessages,
      temperature,
      signal: abortController.signal,
    });

    // Parse OpenAI-compatible SSE chunks and forward token deltas.
    let buffer = "";
    for await (const chunk of stream) {
      buffer += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          sendEvent("done", { ok: true });
          res.end();
          return;
        }
        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content;
          if (delta) sendEvent("token", { content: delta });
        } catch {
          // Some lines are heartbeats / comments — ignore.
        }
      }
    }
    sendEvent("done", { ok: true });
    res.end();
  } catch (err) {
    if (abortController.signal.aborted) {
      res.end();
      return;
    }
    sendEvent("error", { message: err.message || "Unknown error" });
    res.end();
  }
});

export default router;
