#!/bin/bash

echo "========================================="
echo "  CONFIGURACIÓN INICIAL DEL PROYECTO"
echo "  Trazabilidad Alimentaria"
echo "========================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálelo desde https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Verificar Docker (opcional)
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker -v)"
else
    echo "⚠️  Docker no está instalado (opcional para desarrollo local)"
fi

echo ""
echo "📦 Instalando dependencias..."

# Instalar dependencias
npm install

echo ""
echo "🗄️  Configurando base de datos..."

# Generar Prisma Client
cd backend
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Cargar datos de prueba
npx prisma db seed

cd ..

echo ""
echo "✅ Configuración completada!"
echo ""
echo "Para iniciar el proyecto:"
echo "  Desarrollo: npm run dev"
echo "  Solo backend: npm run dev:backend"
echo "  Solo frontend: npm run dev:frontend"
echo "  Docker: npm run docker:dev"
echo ""
echo "Credenciales de prueba:"
echo "  Admin: admin@panaderia.com / password123"
echo "  Recepción: recepcion@panaderia.com / password123"
echo ""
echo "Accesos:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001/api/v1"
echo "  Prisma Studio: http://localhost:5555"
echo ""