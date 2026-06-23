# INSTRUCCIONES.md — Guía de Instalación y Desarrollo

> **Para el equipo de desarrollo:** Sigue estos pasos exactamente en el orden indicado para evitar errores. Este documento cubre dos modalidades: desarrollo 100% con Docker y desarrollo local mixto (backend/frontend local + BD/Redis en Docker).

---

## Requisitos Previos

| Herramienta | Versión mínima | Verificar instalación |
|-------------|---------------|----------------------|
| Node.js | >= 20 | `node -v` |
| npm | >= 10 | `npm -v` |
| Docker Desktop | Última estable | `docker -v` y `docker compose version` |
| Git | Cualquiera | `git -v` |

> **IMPORTANTE:** En Windows, ejecuta todos los comandos en **CMD (Símbolo del sistema)** o **PowerShell** con permisos normales. Docker Desktop debe estar abierto y corriendo.

---

## Opción A: Desarrollo con Docker Compose (Recomendada)

Todo el stack corre en contenedores: PostgreSQL, Redis, Backend (Express) y Frontend (Next.js) con hot-reload.

### Paso 1 — Clonar el repositorio (si aplica)
```cmd
cd C:\Users\jeanm\Downloads
git clone <url-del-repo> Sistema-trazabilidad
cd Sistema-trazabilidad
```

### Paso 2 — Levantar los contenedores por primera vez
```cmd
docker compose -f docker-compose.dev.yml up -d --build
```

**Explicación:**
- `-f docker-compose.dev.yml` → Usa el archivo de desarrollo (NO el de producción)
- `up -d` → Levanta en segundo plano (detached)
- `--build` → Construye las imágenes antes de iniciar

**Espera aproximadamente 2-5 minutos** en la primera ejecución mientras descarga imágenes y compila.

### Paso 3 — Verificar que los contenedores estén corriendo
```cmd
docker compose -f docker-compose.dev.yml ps
```

Debes ver **4 servicios** con estado `Up` o `healthy`:
- `trazabilidad-dev-postgres` (puerto 5432)
- `trazabilidad-dev-redis` (puerto 6379)
- `trazabilidad-dev-backend` (puerto 3001)
- `trazabilidad-dev-frontend` (puerto 3000)

### Paso 4 — Sincronizar la base de datos con Prisma
```cmd
docker compose -f docker-compose.dev.yml exec backend npx prisma db push
```

**¿Qué hace?** Crea todas las tablas del schema (`usuarios`, `lotes`, `productos`, etc.) en PostgreSQL.

> Si te pide confirmación por datos existentes, escribe `y` y presiona Enter.

### Paso 5 — Cargar datos de prueba (seed)
```cmd
docker compose -f docker-compose.dev.yml exec backend npx ts-node prisma/seed.ts
```

**¿Qué hace?** Inserta usuarios, productos, proveedores, clientes, almacenes, líneas de producción y configuración inicial.

> Alternativa (si ya reconstruiste la imagen con `backend/package.json` actualizado):
> ```cmd
> docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
> ```

### Paso 6 — Acceder a la aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación web principal |
| Backend API | http://localhost:3001/api/v1 | API REST |
| Health Check | http://localhost:3001/health | Estado del backend |
| Prisma Studio | *(ver paso 7)* | Explorador visual de la BD |

**Credenciales de prueba:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@panaderia.com` | `password123` |
| Calidad | `calidad@panaderia.com` | `password123` |
| Recepción | `recepcion@panaderia.com` | `password123` |
| Producción | `produccion@panaderia.com` | `password123` |
| Almacén | `almacen@panaderia.com` | `password123` |
| Despacho | `despacho@panaderia.com` | `password123` |

### Paso 7 — Comandos útiles durante el desarrollo

**Ver logs en tiempo real:**
```cmd
:: Backend
docker compose -f docker-compose.dev.yml logs -f backend

:: Frontend
docker compose -f docker-compose.dev.yml logs -f frontend

:: Base de datos
docker compose -f docker-compose.dev.yml logs -f postgres

:: Redis
docker compose -f docker-compose.dev.yml logs -f redis
```

**Abrir Prisma Studio (explorador de BD):**
```cmd
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```
Luego abre http://localhost:5555 en tu navegador.

**Entrar a la shell del backend:**
```cmd
docker compose -f docker-compose.dev.yml exec backend sh
```

**Reiniciar un servicio específico:**
```cmd
:: Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend

:: Reiniciar frontend
docker compose -f docker-compose.dev.yml restart frontend
```

**Bajar todos los contenedores:**
```cmd
docker compose -f docker-compose.dev.yml down
```

**Bajar TODO incluyendo volúmenes de BD (BORRA datos):**
```cmd
docker compose -f docker-compose.dev.yml down -v
```
> ⚠️ **CUIDADO:** Esto elimina la base de datos y los datos de Redis. Deberás repetir los pasos 4 y 5.

### Solución de problemas — Opción A

| Problema | Solución |
|----------|----------|
| `Error: The table public.usuarios does not exist` | No ejecutaste el paso 4 (prisma db push). Corre: `docker compose -f docker-compose.dev.yml exec backend npx prisma db push` |
| `Error: connect ECONNREFUSED ::1:5432` | Docker Desktop no está corriendo o el contenedor postgres no está levantado. Ejecuta: `docker compose -f docker-compose.dev.yml ps` |
| Frontend muestra "Failed to fetch" | El backend no está listo. Espera 10 segundos y refresca. Revisa logs: `docker compose -f docker-compose.dev.yml logs backend` |
| Puerto 5432 o 6379 ya está en uso | Otro programa (posiblemente PostgreSQL local) usa ese puerto. Detén el servicio local o cambia los puertos en `docker-compose.dev.yml` |
| Cambios en código no se reflejan | En Windows con WSL2 a veces hay delay en file sync. Guarda de nuevo el archivo o reinicia el contenedor del servicio |
| `version is obsolete` warning | Es una advertencia inofensiva de Docker. El compose funciona correctamente. |

--------------------------------------------------------------------------------------------

## Opción B: Desarrollo Local Mixto (Backend + Frontend locales, BD + Redis en Docker)

Esta opción corre **Node.js directamente en tu máquina** (mejor performance en Windows) y solo usa Docker para PostgreSQL y Redis.

> **Recomendación:** Útil si necesitas debuggear con breakpoints en tu IDE o si los volumes de Docker son lentos en tu disco.

### Paso 1 — Clonar el repositorio (si aplica)
```cmd
cd C:\Users\jeanm\Downloads
git clone <url-del-repo> Sistema-trazabilidad
cd Sistema-trazabilidad
```

### Paso 2 — Instalar dependencias del monorepo
```cmd
npm install
```

**¿Qué hace?** Instala dependencias en el root, `frontend/` y `backend/` gracias a los workspaces de npm.

### Paso 3 — Generar Prisma Client
```cmd
cd backend && npx prisma generate && cd ..
```

**¿Qué hace?** Genera el cliente TypeScript de Prisma basado en `schema.prisma`. Es necesario antes de compilar o correr el backend.

### Paso 4 — Levantar solo la base de datos y Redis
```cmd
docker compose -f docker-compose.teste.yml up -d
```

**¿Qué hace?** Solo crea dos contenedores:
- `trazabilidad-local-postgres` en puerto **5432**
- `trazabilidad-local-redis` en puerto **6379**

> Nota: Este archivo `docker-compose.teste.yml` NO incluye backend ni frontend. Esos correrán localmente.

### Paso 5 — Verificar que BD y Redis estén listos
```cmd
docker compose -f docker-compose.teste.yml ps
```

Ambos deben mostrar estado `Up` o `healthy`.

### Paso 6 — Sincronizar el schema de base de datos
```cmd
cd backend && npx prisma db push && cd ..
```

**¿Qué hace?** Crea todas las tablas en PostgreSQL local (puerto 5432).

### Paso 7 — Cargar datos de prueba (seed)
```cmd
cd backend && npx ts-node prisma/seed.ts && cd ..
```

**¿Qué hace?** Inserta los usuarios, productos, proveedores, etc.

> Alternativa (si `backend/package.json` tiene la config de prisma.seed):
> ```cmd
> cd backend && npx prisma db seed && cd ..
> ```

### Paso 8 — Abrir Prisma Studio (opcional pero recomendado)
```cmd
cd backend && npx prisma studio
```
Se abrirá automáticamente en http://localhost:5555

### Paso 9 — Iniciar el backend local
**Abre una nueva ventana de CMD** y ejecuta:
```cmd
cd C:\Users\jeanm\Downloads\Sistema-trazabilidad
npm run dev:backend
```

**¿Qué hace?** Inicia el backend de Express en http://localhost:3001 con hot-reload (ts-node-dev).

**Debes ver en la consola:**
```
🚀 Servidor corriendo en puerto 3001 [development]
📚 API: http://localhost:3001/api/v1
❤️  Health: http://localhost:3001/health
```

### Paso 10 — Iniciar el frontend local
**Abre OTRA nueva ventana de CMD** (mantén la del backend abierta) y ejecuta:
```cmd
cd C:\Users\jeanm\Downloads\Sistema-trazabilidad
npm run dev:frontend
```

**¿Qué hace?** Inicia Next.js en http://localhost:3000 con hot-reload.

### Paso 11 — Acceder a la aplicación

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Health Check | http://localhost:3001/health |
| Prisma Studio | http://localhost:5555 |

Usa las mismas credenciales de prueba de la **Opción A**.

### Comandos útiles — Opción B

**Ver logs de BD y Redis:**
```cmd
:: PostgreSQL
docker compose -f docker-compose.teste.yml logs -f postgres

:: Redis
docker compose -f docker-compose.teste.yml logs -f redis
```

**Reiniciar solo la base de datos:**
```cmd
docker compose -f docker-compose.teste.yml restart postgres
```

**Bajar BD y Redis:**
```cmd
docker compose -f docker-compose.teste.yml down
```

**Bajar BD y Redis BORRANDO datos:**
```cmd
docker compose -f docker-compose.teste.yml down -v
```
> ⚠️ **CUIDADO:** Pierdes la base de datos. Deberás repetir pasos 6 y 7.

**Reinstalar dependencias (si algo falla):**
```cmd
:: Desde el root
cd C:\Users\jeanm\Downloads\Sistema-trazabilidad
npm install

:: O solo backend
cd backend && npm install && cd ..

:: O solo frontend
cd frontend && npm install && cd ..
```

### Solución de problemas — Opción B

| Problema | Solución |
|----------|----------|
| `Error: P1001: Can't reach database server` | Docker no tiene corriendo postgres. Ejecuta: `docker compose -f docker-compose.teste.yml up -d` |
| `Error: The table public.usuarios does not exist` | No ejecutaste `npx prisma db push`. Corre el paso 6. |
| `npm run dev:backend` no hace nada o falla | Verifica que `npx prisma generate` se haya ejecutado en el paso 3. |
| Frontend dice "Failed to connect to backend" | El backend no está corriendo. Asegúrate de tener la terminal del backend abierta en el paso 9. |
| Puerto 3000 o 3001 ya está en uso | Otra aplicación usa ese puerto. Cierra otras instancias de Node.js: `taskkill /F /IM node.exe` (cuidado, cierra TODO node) |
| Cambios en `schema.prisma` no se reflejan | Después de editar el schema, ejecuta: `cd backend && npx prisma generate && npx prisma db push` |
| Docker dice "port is already allocated" | Ya hay otra instancia de postgres/redis corriendo. Ejecuta: `docker compose -f docker-compose.teste.yml down` y vuelve a subir. |

---

## Comparativa rápida: ¿Qué opción elegir?

| Criterio | Opción A (Todo Docker) | Opción B (Local + Docker DB) |
|----------|------------------------|------------------------------|
| **Setup inicial** | 2 comandos | 4-5 comandos |
| **Performance Windows** | Buena (volumes pueden ser lentos) | Excelente (Node.js nativo) |
| **Hot-reload** | ✅ Sí | ✅ Sí |
| **Debug con IDE** | Más complejo (attach a contenedor) | Fácil (proceso local) |
| **Aislación** | Total (todo en contenedores) | Parcial (solo BD/Redis en Docker) |
| **Uso de RAM** | Mayor (4 contenedores) | Menor (2 contenedores + Node local) |
| **Recomendación** | Para empezar rápido | Para desarrollo diario prolongado |

---

## Notas finales para el equipo

1. **NUNCA uses `docker-compose.yml`** (el de producción) para desarrollo. Ese archivo está configurado para deploys reales y requiere variables de entorno de producción.

2. **Siempre verifica** que el archivo `.env` en la raíz tenga las URLs correctas:
   - Para Opción A (Docker): El `.env` se ignora en los contenedores (valores están en `docker-compose.dev.yml`)
   - Para Opción B (Local): El `.env` DEBE apuntar a `localhost`:
     ```
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trazabilidad?schema=public"
     REDIS_URL=redis://localhost:6379
     ```

3. **Antes de hacer un commit**, ejecuta:
   ```cmd
   npm run lint
   npm run format
   ```

4. **Si agregas una nueva dependencia** (npm install algo):
   - Opción A: Reconstruir contenedores: `docker compose -f docker-compose.dev.yml up -d --build`
   - Opción B: Instalar localmente: `npm install` (desde root, frontend o backend según corresponda)

5. **Para producción**, consulta la documentación de despliegue. Los pasos de este archivo son **exclusivamente para desarrollo**.

---

*Documento creado: 2026-06-20*  
*Actualizado por: Equipo de Desarrollo*
