FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para sharp y bcrypt
RUN apk add --no-cache openssl libc6-compat python3 make g++

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (dev incluidas para compilar)
RUN npm ci

COPY src ./src

# Generar Prisma Client para linux-musl (Alpine) FIRST (before build!)
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ─── Imagen de producción ────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Dependencias del sistema para producción (sharp, bcrypt, etc.)
RUN apk add --no-cache openssl libc6-compat

# Crear usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 appuser

# Copiar artefactos del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Regenerate Prisma Client for current platform
RUN npx prisma generate

# Directorios runtime
RUN mkdir -p uploads logs \
    && chown -R appuser:nodejs uploads logs

USER appuser

EXPOSE 3001

# Ejecutar migraciones y luego iniciar el servidor
CMD sh -c "npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss && node dist/server.js"