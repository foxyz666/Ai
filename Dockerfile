# Multi-stage build: Node 20 → install deps → build frontend → ship slim runtime.
# The final image runs `node backend/src/server.js`, which serves the built
# Vite SPA at `/` and proxies OpenRouter/Tavily at `/api/*` on the same origin.

# ------------------- stage 1: build the frontend -------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ------------------- stage 2: install backend prod deps -------------------
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ------------------- stage 3: runtime -------------------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Backend code + prod node_modules
COPY backend/ ./backend/
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
# Built frontend (Express serves this directory).
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Render / Fly / Cloud Run all inject PORT. The server reads it.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/src/server.js"]
