# syntax=docker/dockerfile:1

# Base stage: install dependencies and build both workspaces
FROM node:26-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat python3 make g++

COPY package.json package-lock.json turbo.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ARG NEXT_PUBLIC_QR_BASE_URL=http://localhost:3000/t
ARG NEXT_PUBLIC_APP_NAME="Sistema de Trazabilidad Alimentaria"
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_QR_BASE_URL=$NEXT_PUBLIC_QR_BASE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd backend && npx prisma generate
RUN npm run build:backend
RUN npm run build:frontend

# Runtime stage: choose which service to run via build arg or environment
FROM node:26-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

ARG SERVICE=backend
ENV SERVICE=${SERVICE}
ENV NODE_ENV=production

# Install production dependencies
COPY package.json package-lock.json turbo.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static

# Generate Prisma Client in runtime stage (matches platform
RUN cd backend && npx prisma generate

RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 appuser \
    && mkdir -p /app/uploads /app/logs /app/backend/logs /app/backend/uploads \
    && chown -R appuser:appgroup /app/uploads /app/logs /app/backend/logs /app/backend/uploads

USER appuser
EXPOSE 3000 3001

CMD ["sh", "-c", "if [ \"$SERVICE\" = \"frontend\" ]; then node server.js; else cd backend && node dist/server.js; fi"]
