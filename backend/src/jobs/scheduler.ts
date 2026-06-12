import cron from 'node-cron';
import { logger } from '@utils/logger';
import { expiryCheckJob } from './expiryCheck.job';
import { stockAlertJob } from './stockAlert.job';
import { reportGeneratorJob } from './reportGenerator.job';
import { backupJob } from './backup.job';
import { cleanupJob } from './cleanup.job';

let scheduledTasks: cron.ScheduledTask[] = [];

export function initializeScheduler(): void {
  logger.info('Inicializando tareas programadas...');

  scheduledTasks.push(
    cron.schedule('0 8 * * *', async () => {
      logger.info('Ejecutando verificación de caducidades...');
      await expiryCheckJob();
    }, {
      name: 'expiry-check',
      timezone: 'Europe/Madrid',
    })
  );

  scheduledTasks.push(
    cron.schedule('0 9 * * *', async () => {
      logger.info('Ejecutando alerta de stock bajo...');
      await stockAlertJob();
    }, {
      name: 'stock-alert',
      timezone: 'Europe/Madrid',
    })
  );

  scheduledTasks.push(
    cron.schedule('0 7 * * 1', async () => {
      logger.info('Generando reportes semanales programados...');
      await reportGeneratorJob('SEMANAL');
    }, {
      name: 'weekly-report',
      timezone: 'Europe/Madrid',
    })
  );

  scheduledTasks.push(
    cron.schedule('0 7 1 * *', async () => {
      logger.info('Generando reportes mensuales programados...');
      await reportGeneratorJob('MENSUAL');
    }, {
      name: 'monthly-report',
      timezone: 'Europe/Madrid',
    })
  );

  scheduledTasks.push(
    cron.schedule('0 0 * * *', async () => {
      logger.info('Ejecutando backup diario...');
      await backupJob();
    }, {
      name: 'daily-backup',
      timezone: 'Europe/Madrid',
    })
  );

  scheduledTasks.push(
    cron.schedule('0 2 * * 0', async () => {
      logger.info('Ejecutando limpieza de archivos temporales...');
      await cleanupJob();
    }, {
      name: 'weekly-cleanup',
      timezone: 'Europe/Madrid',
    })
  );

  logger.info(`${scheduledTasks.length} tareas programadas inicializadas`);
}

export function stopScheduler(): void {
  scheduledTasks.forEach((task) => task.stop());
  scheduledTasks = [];
  logger.info('Todas las tareas programadas detenidas');
}

export function getScheduledTasks(): { name: string; running: boolean }[] {
  return scheduledTasks.map((task) => ({
    name: (task as any).options?.name || 'unknown',
    running: (task as any).isRunning?.() || false,
  }));
}