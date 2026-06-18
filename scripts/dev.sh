#!/bin/bash

echo "🚀 Iniciando entorno de desarrollo..."

# Verificar si hay cambios en Prisma
if [ -f "backend/prisma/schema.prisma" ]; then
    echo "📦 Verificando Prisma..."
    cd backend
    npx prisma generate
    cd ..
fi

# Iniciar con Turbo
echo "🔥 Iniciando servidores..."
npx turbo run dev