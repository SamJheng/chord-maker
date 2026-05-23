# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /workspace

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx nx build frontend

# ── Stage 2: Serve with nginx ────────────────────────────────────
FROM nginx:alpine AS runner

# Patch Alpine packages to fix known OS-level CVEs
RUN apk upgrade --no-cache

# Copy built static files
COPY --from=builder /workspace/dist/apps/frontend /usr/share/nginx/html

# Copy nginx config (SPA routing + API proxy)
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]