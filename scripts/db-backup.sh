#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "💾 Realizando backup de base de datos..."

if command -v docker &> /dev/null && docker ps | grep -q trazabilidad-postgres; then
    # Backup desde Docker
    docker exec trazabilidad-postgres pg_dump -U postgres trazabilidad > $BACKUP_FILE
else
    # Backup local
    PGPASSWORD="password" pg_dump -h localhost -U postgres trazabilidad > $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "✅ Backup guardado en: $BACKUP_FILE"
    
    # Comprimir
    gzip $BACKUP_FILE
    echo "📦 Comprimido: $BACKUP_FILE.gz"
    
    # Limpiar backups antiguos (30 días)
    find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
    echo "🧹 Backups antiguos eliminados"
else
    echo "❌ Error al realizar backup"
    exit 1
fi