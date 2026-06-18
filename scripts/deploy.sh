#!/bin/bash

echo "🚀 Desplegando en producción..."

# Verificar variables de entorno
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado. Cópielo desde .env.example"
    exit 1
fi

# Construir imágenes
echo "📦 Construyendo imágenes Docker..."
docker-compose build

# Iniciar servicios
echo "🔥 Iniciando servicios..."
docker-compose up -d

# Esperar a que estén listos
echo "⏳ Esperando servicios..."
sleep 10

# Verificar estado
echo "🔍 Verificando servicios..."
docker-compose ps

echo ""
echo "✅ Despliegue completado!"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:3001/api/v1"