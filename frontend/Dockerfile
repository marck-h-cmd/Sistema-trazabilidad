# ─── Etapa 1: Instalar dependencias ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
# Instalar solo producción (más rápido)
RUN npm install --omit=dev

# ─── Etapa 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
# Instalar todas las deps (dev incluidas) para build
RUN npm install

COPY . .

# Variables en tiempo de build: necesario para Next.js standalone
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_QR_BASE_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_QR_BASE_URL=$NEXT_PUBLIC_QR_BASE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Etapa 3: Runner de producción ───────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Crear usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Archivos públicos
COPY --from=builder /app/public ./public

# Standalone output de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]