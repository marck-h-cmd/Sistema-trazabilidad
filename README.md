# 🍞 Sistema de Trazabilidad Alimentaria

Sistema web completo para la trazabilidad de productos alimenticios y lotes en una panadería industrial. Cumple con el Reglamento Europeo 178/2002 y es compatible con APPCC, ISO 22000, IFS y BRC.

## ✨ Características

- 🔍 **Trazabilidad completa** desde materias primas hasta cliente final
- 📱 **Escaneo de códigos** Code 128 (interno) y QR (consumidor)
- 📊 **Dashboard gerencial** con KPIs en tiempo real
- 🚨 **Sistema de alertas** y gestión de crisis
- 📦 **Control de inventario** con algoritmo FIFO
- 🏭 **Gestión de producción** con vinculación automática
- 🚚 **Expedición** con validación de lotes
- 📄 **Reportes exportables** PDF/Excel/CSV
- 🌙 **Modo oscuro** con preferencia del sistema
- 📲 **Portal público QR** para consumidor final

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Base de Datos** | PostgreSQL 16 |
| **Cache/Colas** | Redis |
| **Testing** | Jest, Supertest, Testing Library |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

## 🚀 Inicio Rápido

### Requisitos

- Node.js >= 20
- npm >= 10
- PostgreSQL 16 (o Docker)
- Redis (opcional, o Docker)

### Instalación

\`\`\`bash
# Clonar repositorio
git clone https://github.com/panaderia/trazabilidad-alimentaria.git
cd trazabilidad-alimentaria

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# Iniciar desarrollo
npm run dev
\`\`\`

### Con Docker

\`\`\`bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up --build

# Producción
docker-compose up -d --build
\`\`\`

## 📋 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@panaderia.com | password123 |
| Calidad | calidad@panaderia.com | password123 |
| Recepción | recepcion@panaderia.com | password123 |
| Producción | produccion@panaderia.com | password123 |
| Almacén | almacen@panaderia.com | password123 |
| Despacho | despacho@panaderia.com | password123 |

## 📖 Documentación

- [Arquitectura del Sistema](./docs/arquitectura.md)
- [Guía de API](./docs/api-guide.md)
- [Diagrama de Base de Datos](./docs/database-diagram.md)
- [Guía de Despliegue](./docs/deployment.md)
- [Normas de Diseño](./docs/normas-diseno.md)
- [Manual de Usuario](./docs/manual-usuario.md)

## 📁 Estructura del Proyecto

\`\`\`
trazabilidad-alimentaria/
├── frontend/          # Next.js 14 + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── app/       # App Router (páginas)
│   │   ├── components/# Componentes React
│   │   ├── hooks/     # Custom hooks
│   │   ├── lib/       # Utilidades y API clients
│   │   ├── stores/    # Estado global (Zustand)
│   │   └── types/     # Tipos TypeScript
│   └── public/        # Assets estáticos
├── backend/           # Express + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   └── utils/
│   └── prisma/        # Schema y migraciones
├── docs/              # Documentación
├── scripts/           # Scripts de utilidad
└── docker/            # Configuración Docker
\`\`\`

## 🔒 Normativas

- ✅ Reglamento Europeo 178/2002
- ✅ Real Decreto 1808/1991
- ✅ Guías CONSEBRO (Navarra)
- ✅ Compatible APPCC, ISO 22000, IFS, BRC

## 📝 Licencia

MIT © 2024 Panadería Artesanal S.L.