import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import chatRouter from "./routes/chat.js";
import searchRouter from "./routes/search.js";
import modelsRouter from "./routes/models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT) || 5174;
const NODE_ENV = process.env.NODE_ENV || "development";

// "*" allows any origin (useful when serving from one origin behind a CDN/proxy);
// otherwise comma-separated allowlist.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl (no origin) and configured frontends.
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Health check (not rate limited so uptime probes don't burn quota).
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: NODE_ENV,
    time: new Date().toISOString(),
    integrations: {
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      tavily: Boolean(process.env.TAVILY_API_KEY),
    },
  });
});

// All other /api routes go through the rate limiter.
app.use("/api", apiRateLimiter);
app.use("/api/chat", chatRouter);
app.use("/api/search", searchRouter);
app.use("/api/models", modelsRouter);

// In production, serve the built frontend from the same origin so the SPA and
// the API share a host (no CORS, simpler deploys). The static dir is configurable
// via FRONTEND_DIST so a Docker image can put the build anywhere.
const distDir =
  process.env.FRONTEND_DIST ||
  path.resolve(__dirname, "..", "..", "frontend", "dist");
const hasFrontendBuild = fs.existsSync(path.join(distDir, "index.html"));

if (hasFrontendBuild) {
  app.use(
    express.static(distDir, {
      // index.html should never be cached aggressively; assets fingerprinted by Vite can be.
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    })
  );
  // SPA fallback for any non-API path.
  app.get(/^\/(?!api(\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT} (${NODE_ENV})`);
  if (hasFrontendBuild) {
    console.log(`[backend] serving frontend from ${distDir}`);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("[backend] OPENROUTER_API_KEY is not set — /api/chat will return 500.");
  }
  if (!process.env.TAVILY_API_KEY) {
    console.warn("[backend] TAVILY_API_KEY is not set — /api/search will return 500.");
  }
});
