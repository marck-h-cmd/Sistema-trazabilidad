import fs from 'fs';
import path from 'path';
import { prisma } from '@config/database';
import { logger } from '@utils/logger';
import { config } from '@config/app';

export async function cleanupJob(): Promise<void> {
  try {
    logger.info('Iniciando limpieza del sistema...');

    await cleanupTempFiles();
    await cleanupExpiredSessions();
    await cleanupOldAuditLogs();

    logger.info('Limpieza del sistema completada exitosamente');
  } catch (error) {
    logger.error('Error en limpieza del sistema:', error);
  }
}

async function cleanupTempFiles(): Promise<void> {
  const tempDir = path.join(config.upload.dir, 'temp');

  if (!fs.existsSync(tempDir)) {
    logger.info('Directorio temporal no existe, omitiendo limpieza');
    return;
  }

  const files = fs.readdirSync(tempDir);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  }

  logger.info(`Archivos temporales eliminados: ${deletedCount}`);
}

async function cleanupExpiredSessions(): Promise<void> {
  const result = await prisma.sesion.deleteMany({
    where: {
      expiraEn: {
        lt: new Date(),
      },
    },
  });

  logger.info(`Sesiones expiradas eliminadas: ${result.count}`);
}

async function cleanupOldAuditLogs(): Promise<void> {
  const retentionDays = 365;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const count = await prisma.registroAuditoria.count({
    where: {
      creadoEn: {
        lt: cutoffDate,
      },
    },
  });

  if (count > 0) {
    logger.info(`Se encontraron ${count} registros de auditoría antiguos (más de ${retentionDays} días)`);
  }
}