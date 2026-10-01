# ==============================================================================
# Multi-Stage Dockerfile for AI Ads Enterprise Unified Platform
# Deploys as a SINGLE SERVICE on Google Cloud Run (Frontend @ / & Backend @ /api)
# ==============================================================================

# ─── Stage 1: Build Frontend SPA ───────────────────────────────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci || npm install --no-audit

# Build production frontend bundle
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

# ─── Stage 2: Production Unified Server ────────────────────────────────────────
FROM node:20-slim

# Install Chromium and system dependencies for Puppeteer headless crawling
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    ca-certificates \
    procps \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Configure Puppeteer to use container Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && (npm ci --omit=dev || npm install --omit=dev --no-audit)

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets to both candidate paths for resilient discovery
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./backend/public

WORKDIR /app/backend

# Default Cloud Run configuration
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Launch the unified server
CMD ["node", "server.js"]
