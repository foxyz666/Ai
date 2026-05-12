# Neon AI

A modern, full-stack AI chat web app — Perplexity / Cursor inspired, with a **dark neon glassmorphism UI**, streaming responses, and live web search.

- **Frontend:** React 18 + Vite + TailwindCSS + Framer Motion
- **Backend:** Node.js + Express, server-sent events for streaming
- **AI:** [OpenRouter](https://openrouter.ai) (free models like DeepSeek, Llama 3.1, Mistral)
- **Search:** [Tavily](https://tavily.com)

All API keys live on the **backend only** — the browser never sees them.

---

## Features

- AI chat interface with streaming tokens and typing caret
- Tavily web search toggle (Ctrl/⌘ + K) — answers are grounded with live sources
- Conversation history persisted to `localStorage`
- Sidebar with chat list, delete, rename-by-first-message
- Markdown rendering with GitHub-flavored extensions
- Syntax-highlighted code blocks with one-click copy
- Copy / Retry message buttons
- Loading skeletons and animated send button
- Toast notifications and error handling
- Multi-model picker in the navbar
- Export chat to Markdown
- Clear chat, delete chat, delete-all
- Dark mode default with a futuristic purple/blue cyber theme
- Mobile responsive layout, collapsible sidebar
- Keyboard shortcuts (Enter to send, ⌘/Ctrl+K toggle search, etc.)
- Backend rate limiting, request validation, CORS, error middleware
- Secure backend proxy — API keys never reach the client

---

## Project structure

```
.
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js              # Express entrypoint
│       ├── routes/
│       │   ├── chat.js            # POST /api/chat — SSE streaming proxy
│       │   ├── search.js          # POST /api/search — Tavily proxy
│       │   └── models.js          # GET  /api/models — model list
│       ├── services/
│       │   ├── openrouter.js      # OpenRouter HTTP client
│       │   └── tavily.js          # Tavily HTTP client
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js
│       │   └── validate.js        # zod request validation
│       └── utils/sanitize.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/            # Sidebar, Navbar, Chat UI, Toasts, etc.
│       ├── pages/                 # Home, Chat, History, Settings, About
│       ├── store/                 # zustand stores (chats, ui)
│       ├── services/api.js        # SSE-aware fetch client
│       ├── hooks/                 # keyboard shortcuts
│       └── utils/                 # storage + formatting helpers
├── package.json                   # root scripts (install:all, dev, build)
└── README.md
```

---

## Quickstart

> Requires **Node.js 18+** (Node 20+ recommended).

### 1. Install dependencies

```bash
npm run install:all
```

This installs deps in both `backend/` and `frontend/`.

### 2. Configure backend keys

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-...
TAVILY_API_KEY=tvly-...
```

- Get an OpenRouter key: <https://openrouter.ai/keys>
- Get a Tavily key: <https://app.tavily.com>

> The app will still build and load without keys, but `/api/chat` and `/api/search` will return errors until they are set. The Settings page shows current status.

### 3. Run in development

```bash
npm run dev
```

- Backend → <http://localhost:5174>
- Frontend → <http://localhost:5173> (Vite proxies `/api/*` to the backend)

Or run individually:

```bash
npm run dev:backend
npm run dev:frontend
```

### 4. Build for production

```bash
npm run build           # builds frontend/dist
npm start               # starts backend (serve frontend/dist with any static host)
```

---

## API

All routes are mounted under `/api` and protected by a configurable rate limiter (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`).

### `GET /api/health`

Returns server status and which integrations are configured.

```json
{
  "status": "ok",
  "env": "development",
  "integrations": { "openrouter": true, "tavily": true }
}
```

### `GET /api/models`

```json
{
  "models": [
    { "id": "nvidia/nemotron-3-super-120b-a12b:free", "name": "NVIDIA Nemotron 3 Super", "description": "..." },
    { "id": "deepseek/deepseek-chat-v3-0324:free", "name": "DeepSeek Chat v3", "description": "..." },
    { "id": "meta-llama/llama-3.1-8b-instruct:free", "name": "Llama 3.1 8B Instruct", "description": "..." },
    { "id": "mistralai/mistral-7b-instruct:free", "name": "Mistral 7B Instruct", "description": "..." }
  ],
  "default": "nvidia/nemotron-3-super-120b-a12b:free"
}
```

### `POST /api/chat`

Server-sent events. Body:

```json
{
  "messages": [{ "role": "user", "content": "Hello" }],
  "model": "deepseek/deepseek-chat-v3-0324:free",
  "temperature": 0.7,
  "search": false
}
```

Events:

- `status` — `{ stage: "searching" | "thinking", ... }`
- `search` — Tavily payload when `search: true`
- `token`  — `{ content: "..." }` incremental text
- `warning` / `error` — recoverable / terminal issues
- `done`   — final marker

### `POST /api/search`

```json
{ "query": "latest react release", "maxResults": 5, "includeAnswer": true }
```

---

## Keyboard shortcuts

| Shortcut             | Action                       |
| -------------------- | ---------------------------- |
| `Enter`              | Send message                 |
| `Shift + Enter`      | Newline in input             |
| `Ctrl/⌘ + K`         | Toggle web search mode       |
| `Ctrl/⌘ + Shift + O` | New chat                     |
| `Ctrl/⌘ + L`         | Clear current chat           |
| `Esc`                | Stop generation              |

---

## Security notes

- **Never** put `OPENROUTER_API_KEY` or `TAVILY_API_KEY` in any frontend `.env` — only the backend should see them.
- The backend validates every chat request with `zod`, sanitizes message content, and clamps the model to an allowlist.
- A configurable rate limiter (`express-rate-limit`) is applied to all `/api/*` routes except `/api/health`.
- CORS origins are restricted to `CORS_ORIGIN` (comma-separated list).

---

## Scripts

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `npm run install:all`    | Install backend + frontend deps                   |
| `npm run dev`            | Run backend + frontend concurrently               |
| `npm run dev:backend`    | Backend only (nodemon)                            |
| `npm run dev:frontend`   | Frontend only (Vite)                              |
| `npm run build`          | Build the frontend for production                 |
| `npm start`              | Start the backend in production mode              |
| `npm run lint`           | Lint backend and frontend                         |

---

## License

MIT — use it as a starting point for your own AI app. PRs welcome.
