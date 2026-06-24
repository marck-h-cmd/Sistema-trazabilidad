# AGENTS.md — Contexto del Proyecto para IAs

> **INSTRUCCIÓN PARA AGENTES:** Lee este archivo completo antes de realizar cualquier cambio en el proyecto. Este documento contiene la arquitectura, convenciones, comandos y problemas conocidos del Sistema de Trazabilidad Alimentaria.

---

## 1. Descripción General

**Sistema de Trazabilidad Alimentaria** para panadería industrial.

- Cumple con Reglamento Europeo 178/2002, compatible con APPCC, ISO 22000, IFS y BRC.
- Permite trazabilidad completa desde materias primas hasta cliente final.
- Gestiona lotes, recepciones, producción, almacén, expediciones, alertas y reportes.

---

## 2. Stack Tecnológico

| Capa              | Tecnología             | Versión         |
| ----------------- | ---------------------- | --------------- |
| **Frontend**      | Next.js                | 14 (App Router) |
|                   | TypeScript             | 5.3             |
|                   | Tailwind CSS           | 3.4             |
|                   | shadcn/ui              | Último          |
|                   | Zustand                | 4.4             |
|                   | React Query (TanStack) | 5.17            |
|                   | Axios                  | 1.6             |
|                   | Socket.io-client       | 4.8             |
| **Backend**       | Node.js                | 20              |
|                   | Express                | 4.18            |
|                   | TypeScript             | 5.3             |
|                   | Prisma ORM             | 5.10            |
|                   | JWT (jsonwebtoken)     | 9.0             |
|                   | Winston                | 3.11            |
|                   | Bull (colas)           | 4.12            |
|                   | Socket.io              | 4.7             |
| **Base de Datos** | PostgreSQL             | 16              |
| **Cache/Colas**   | Redis                  | 7               |
| **Monorepo**      | Turbo                  | 1.13            |
| **DevOps**        | Docker, Docker Compose |

---

## 3. Estructura de Carpetas

```
trazabilidad-alimentaria/
├── frontend/                 # Next.js 14 + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── app/              # App Router (páginas)
│   │   │   ├── (auth)/       # Login, forgot-password, reset-password
│   │   │   ├── (dashboard)/  # Módulos protegidos
│   │   │   │   ├── dashboard/
│   │   │   │   ├── recepcion/
│   │   │   │   ├── produccion/
│   │   │   │   ├── almacen/
│   │   │   │   ├── expedicion/
│   │   │   │   ├── trazabilidad/
│   │   │   │   ├── alertas/
│   │   │   │   ├── reportes/
│   │   │   │   ├── configuracion/
│   │   │   │   └── perfil/
│   │   │   ├── api/          # Route handlers de Next.js
│   │   │   └── public/       # Portal QR público
│   │   ├── components/       # Componentes React
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilidades y API clients
│   │   ├── stores/           # Estado global (Zustand)
│   │   └── types/            # Tipos TypeScript
│   ├── public/               # Assets estáticos
│   ├── Dockerfile            # Producción (usa standalone)
│   └── Dockerfile.dev        # Desarrollo
├── backend/                  # Express + Prisma
│   ├── src/
│   │   ├── config/           # Configuración (app.ts, database.ts)
│   │   ├── controllers/      # Controladores HTTP
│   │   ├── services/         # Lógica de negocio
│   │   ├── routes/           # Definición de rutas
│   │   ├── middleware/       # Middlewares (auth, rate limit, error handler)
│   │   ├── repositories/     # Acceso a datos (si aplica)
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilidades (logger, helpers)
│   │   ├── queues/           # Colas Bull
│   │   ├── events/           # Eventos
│   │   ├── jobs/             # Tareas programadas
│   │   └── websocket/        # WebSockets
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema completo de BD
│   │   └── seed.ts           # Datos de prueba
│   ├── Dockerfile            # Producción (multi-stage)
│   └── Dockerfile.dev        # Desarrollo
├── docs/                     # Documentación (varios archivos vacíos)
├── scripts/                  # Scripts de utilidad
├── docker-compose.yml        # Docker PRODUCCIÓN (tiene problemas)
├── docker-compose.dev.yml    # Docker DESARROLLO (funcional)
├── turbo.json                # Configuración de Turbo
└── package.json              # Root del monorepo (workspaces)
```

---

## 4. Variables de Entorno (.env)

El archivo `.env` ya existe configurado para desarrollo local. Los valores sensibles (AWS, SMTP) están expuestos — **NO subir a producción sin rotarlos**.

**Claves importantes:**

- `DATABASE_URL`: Conexión PostgreSQL
- `JWT_SECRET` / `JWT_REFRESH_SECRET`: Secrets para tokens
- `REDIS_URL`: Conexión Redis
- `NEXT_PUBLIC_API_URL`: URL del backend para el frontend
- `NEXT_PUBLIC_QR_BASE_URL`: Base para códigos QR

> **Nota Docker:** El `.env` del repo apunta a `localhost`, pero en los contenedores Docker las URLs son: `postgres:5432` y `redis:6379`. El `docker-compose.dev.yml` usa valores hardcodeados correctos.

---

## 5. Base de Datos (Prisma Schema)

**Motor:** PostgreSQL 16  
**ORM:** Prisma 5.10  
**Client target:** `native`, `linux-musl-openssl-3.0.x`

### Entidades principales:

- **usuarios** (con roles: ADMINISTRADOR, CALIDAD, RECEPCION, PRODUCCION, ALMACEN, DESPACHO, CLIENTE, AUTORIDAD)
- **sesiones** (gestión de tokens de refresco)
- **productos** (materia prima, producto terminado, envase, semielaborado)
- **proveedores** / **clientes**
- **almacenes** / **ubicaciones** (jerarquía: zona > pasillo > estantería > nivel)
- **lineas_produccion**
- **lotes** (tabla central del sistema)
- **materias_primas** (vinculadas a proveedores y lotes)
- **producciones** (vinculan materias primas con lotes terminados)
- **recepciones** / **expediciones** / **items_expedicion**
- **movimientos_lote** (historial de movimientos FIFO)
- **alertas** (con notificaciones y documentos)
- **simulacros_auditoria** (pruebas de crisis)
- **reportes_programados**
- **configuracion_sistema**
- **registros_auditoria** (auditoría completa)

### Códigos de lote:

Formato: `L + fecha(YYMMDD) + línea + correlativo`  
Ejemplo: `L260625L301`

### Credenciales de prueba (seed):

| Rol        | Email                    | Contraseña  | 1   |
| ---------- | ------------------------ | ----------- | --- |
| Admin      | admin@panaderia.com      | password123 |
| Calidad    | calidad@panaderia.com    | password123 |
| Recepción  | recepcion@panaderia.com  | password123 |
| Producción | produccion@panaderia.com | password123 |
| Almacén    | almacen@panaderia.com    | password123 |
| Despacho   | despacho@panaderia.com   | password123 |

---

## 6. API del Backend

**Base URL:** `http://localhost:3001/api/v1`  
**Health check:** `GET http://localhost:3001/health`

### Rutas disponibles (backend/src/routes/):

- `auth.routes.ts` — Login, refresh, logout, forgot/reset password
- `user.routes.ts` — CRUD usuarios
- `product.routes.ts` — Productos
- `supplier.routes.ts` — Proveedores
- `customer.routes.ts` — Clientes
- `warehouse.routes.ts` — Almacenes y ubicaciones
- `inventory.routes.ts` — Inventario / movimientos
- `production-line.routes.ts` — Líneas de producción
- `production.routes.ts` — Órdenes de producción
- `reception.routes.ts` — Recepciones de materia prima
- `shipment.routes.ts` — Expediciones
- `traceability.routes.ts` — Consulta de trazabilidad
- `alert.routes.ts` — Alertas y crisis
- `report.routes.ts` — Reportes
- `barcode.routes.ts` — Generación de códigos de barras/QR
- `label.routes.ts` — Etiquetas
- `dashboard.routes.ts` — KPIs y dashboard

### Middlewares clave:

- `auth.middleware` — Validación JWT
- `role.middleware` — Control por roles
- `rateLimiter` — Límite de peticiones
- `errorHandler` — Manejo centralizado de errores
- `requestLogger` — Log de requests con ID único

---

## 7. Docker: Dev vs Producción

### ⚠️ IMPORTANTE: Estado actual

**`docker-compose.dev.yml` → FUNCIONA** (usar este siempre para desarrollo)  
**`docker-compose.yml` → TIENE PROBLEMAS** (no usar hasta corregir)

### docker-compose.dev.yml (DESARROLLO):

```bash
# Levantar entorno de desarrollo
docker compose -f docker-compose.dev.yml up -d --build

# Ver logs
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend

# Ejecutar comandos en contenedores
docker compose -f docker-compose.dev.yml exec backend npx prisma db push
docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```

Servicios:

- `postgres:16-alpine` → puerto 5432
- `redis:7-alpine` → puerto 6379 (sin password en dev)
- `backend` → puerto 3001 (hot-reload con ts-node-dev)
- `frontend` → puerto 3000 (hot-reload Next.js)

**Volumes de desarrollo:**

- `./backend/src:/app/src` (código backend sincronizado)
- `./backend/prisma:/app/prisma`
- `./frontend/src:/app/src` (código frontend sincronizado)
- `./frontend/public:/app/public`

### docker-compose.yml (PRODUCCIÓN) — CORREGIDO:

Antes tenía problemas conocidos que ya fueron solucionados:

1. ✅ **Variables con valores por defecto seguros:** Todas las variables opcionales ahora tienen defaults (ej. `JWT_SECRET`, `SMTP_HOST`, `AWS_*`).
2. ✅ **Script init-db.sql eliminado:** Se quitó la referencia a `./scripts/init-db.sql` que no existía.
3. ✅ **Frontend standalone verificado:** El `next.config.js` sí tiene `output: 'standalone'`.
4. ✅ **Healthchecks con Node.js interno:** Se reemplazó `wget` por `node -e "require('http').get(...)"` en ambos healthchecks (backend y frontend), compatible con `node:20-alpine`.

> **Nota:** Aunque está corregido, seguir usando `docker-compose.dev.yml` para desarrollo. El de producción requiere variables seguras reales en un archivo `.env.prod` antes de usarlo.

---

## 8. Comandos Útiles

### Desarrollo local (sin Docker):

```bash
npm install                    # Instalar dependencias root
npm run dev                    # Iniciar frontend + backend con Turbo
npm run dev:frontend           # Solo frontend
npm run dev:backend            # Solo backend
npm run build                  # Build producción
npm run lint                   # Lint todo
npm run format                 # Formatear con Prettier
npm run test                   # Ejecutar tests
```

### Base de datos (Prisma):

```bash
npm run db:generate            # Generar Prisma Client
npm run db:push                # Sincronizar schema con BD
npm run db:migrate             # Crear y aplicar migración
npm run db:seed                # Cargar datos de prueba
npm run db:studio              # Abrir Prisma Studio
```

### Docker:

```bash
# Desarrollo
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml down -v   # Bajar y eliminar volúmenes

# Backend shell
docker compose -f docker-compose.dev.yml exec backend sh
```

---

## 9. Convenciones de Código

### Backend:

- **Arquitectura:** MVC con Services (Controller → Service → Prisma)
- **Imports:** Usar path aliases definidos en `tsconfig.json`:
  - `@config/*`, `@controllers/*`, `@services/*`, `@routes/*`, `@middleware/*`, `@utils/*`, `@customTypes/*`, `@repositories/*`, `@queues/*`, `@events/*`, `@jobs/*`, `@websocket/*`
- **Nomenclatura:** camelCase para variables/funciones, PascalCase para clases/interfaces, kebab-case para archivos.
- **Errores:** Usar el middleware `errorHandler` centralizado. NO hacer `throw` de strings, siempre instancias de `Error`.
- **Logger:** Usar `logger` de Winston importado de `@utils/logger`.
- **Base de datos:** Usar siempre el cliente `prisma` importado de `@config/database`.

### Frontend:

- **App Router:** Next.js 14 con App Router (`frontend/src/app/`)
- **Estado global:** Zustand en `frontend/src/stores/`
- **Fetch de datos:** React Query (TanStack) en hooks
- **API Client:** Axios configurado en `frontend/src/lib/api/`
- **Componentes UI:** shadcn/ui base en `frontend/src/components/ui/`
- **Path aliases:** `@/*`, `@components/*`, `@hooks/*`, `@lib/*`, `@stores/*`, `@types/*`, `@constants/*`
- **Estilos:** Tailwind CSS con clases utilitarias. Para componentes complejos usar `cn()` de `class-variance-authority`.

---

## 10. Problemas Conocidos y Soluciones

| Problema                                 | Solución                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `docker-compose.yml` de producción falla | Usar siempre `docker-compose.dev.yml` para desarrollo                                              |
| Tabla `usuarios` no existe al iniciar    | Ejecutar `npx prisma db push` y `npx prisma db seed` dentro del contenedor backend                 |
| Frontend no conecta al backend en Docker | Verificar que `NEXT_PUBLIC_API_URL` en `docker-compose.dev.yml` sea `http://localhost:3001/api/v1` |
| `version: '3.8'` obsoleto en Docker      | Advertencia inofensiva, se puede eliminar la línea si se desea                                     |
| Healthcheck de producción usa `wget`     | En `node:20-alpine` no viene `wget`, usar `curl` o instalarlo                                      |
| Seed no funcionaba con `prisma db seed`  | Se agregó `"prisma": { "seed": "ts-node prisma/seed.ts" }` a `backend/package.json`                |

---

## 11. Decisiones Arquitectónicas Clave

1. **Monorepo con Turbo:** Frontend y backend comparten root pero tienen sus propios `package.json`. El root orquesta scripts comunes.
2. **Prisma como ORM único:** No hay migrations iniciales en el repo; se usa `db push` para desarrollo rápido.
3. **Autenticación JWT + Refresh Tokens:** Tokens de acceso cortos (15m) y tokens de refresco de 7 días almacenados en BD (tabla `sesiones`).
4. **Roles granulares:** Cada usuario tiene un rol que define qué módulos puede ver. Algunos módulos requieren escaneo obligatorio de códigos de barras (configurable por usuario).
5. **Códigos de lote automáticos:** Generados con prefijo configurable, fecha, línea y correlativo.
6. **Portal QR público:** Ruta `/t/:codigo` accesible sin autenticación para que consumidores consulten trazabilidad.
7. **Auditoría completa:** Toda acción CRUD se registra en `registros_auditoria` con usuario, IP, valores antes/después.
8. **Gestión de crisis:** Módulo de alertas con simulacros de auditoría que miden tiempos de respuesta y tasa de recuperación.

---

## 12. Notas para el Agente IA

- **Siempre** revisar si un cambio en backend requiere regenerar Prisma Client (`npx prisma generate`).
- **Siempre** revisar si un cambio en el schema de Prisma requiere `npx prisma db push` o una migración.
- **Nunca** modificar el `docker-compose.yml` de producción sin entender el impacto en las variables de entorno.
- **Preferir** `docker-compose.dev.yml` para cualquier prueba o desarrollo.
- **Si** se agrega una nueva ruta en el backend, exportarla en `backend/src/routes/index.ts`.
- **Si** se agrega una nueva página en el frontend, crearla bajo `frontend/src/app/(dashboard)/` o `frontend/src/app/(auth)/` según corresponda.
- **Mantener** consistencia con shadcn/ui para nuevos componentes de UI.
- **El idioma del proyecto es español:** nombres de campos en BD, mensajes de error, UI, documentación. Mantener consistencia.
- **Cuidado con secrets:** El archivo `.env` actual contiene credenciales reales de AWS y SendGrid. Nunca exponerlas en código ni logs.

---

_Última actualización: 2026-06-20_
_Mantenido por: Agente IA (OpenCode)_
