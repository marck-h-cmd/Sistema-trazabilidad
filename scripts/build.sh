#!/bin/bash

echo "🏗️  Construyendo proyecto..."

# Limpiar builds anteriores
echo "🧹 Limpiando..."
rm -rf backend/dist
rm -rf frontend/.next

# Construir con Turbo
echo "📦 Compilando..."
npx turbo run build

echo "✅ Build completado!"