# syntax=docker/dockerfile:1

# ── Stage 1: Build knowledge snapshot, frontend (Vite), & server bundle ───────
FROM node:24-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Optional Vite build-time public variables (never pass server secrets here)
ARG VITE_GOOGLE_MAPS_BROWSER_KEY=""
ARG VITE_GOOGLE_MAP_ID=""
ENV VITE_GOOGLE_MAPS_BROWSER_KEY=${VITE_GOOGLE_MAPS_BROWSER_KEY}
ENV VITE_GOOGLE_MAP_ID=${VITE_GOOGLE_MAP_ID}

COPY . .
RUN npm run build

# ── Stage 2: Minimal production runtime for Google Cloud Run ──────────────────
FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8080

CMD ["node", "dist/server.cjs"]
