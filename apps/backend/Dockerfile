# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx nx build backend

# ── Stage 2: Production image ────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy generated package.json from build output and install prod deps only
COPY --from=builder /workspace/dist/apps/backend/package.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built application (overwrites package.json, that's fine)
COPY --from=builder /workspace/dist/apps/backend .

EXPOSE 3000

CMD ["node", "main.js"]