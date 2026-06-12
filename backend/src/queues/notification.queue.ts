import Bull from 'bull';
import { config } from '@config/app';
import { logger } from '@utils/logger';
import { prisma } from '@config/database';

interface NotificationJob {
  alertaId: string;
  tipo: 'CORREO' | 'SMS' | 'SISTEMA';
  destinatario: string;
  asunto: string;
  mensaje: string;
}

let notificationQueue: Bull.Queue<NotificationJob> | null = null;

try {
  if (config.redis.url) {
    notificationQueue = new Bull<NotificationJob>('notification-queue', config.redis.url);

    notificationQueue.process(async (job) => {
      const { alertaId, tipo, destinatario, asunto, mensaje } = job.data;

      try {
        await prisma.notificacion.create({
          data: {
            alertaId,
            tipo,
            destinatario,
            asunto,
            mensaje,
            enviada: true,
            fechaEnvio: new Date(),
          },
        });

        logger.info(`Notificación registrada para alerta ${alertaId}: ${destinatario}`);
        return { success: true, alertaId, destinatario };
      } catch (error) {
        logger.error(`Error registrando notificación para alerta ${alertaId}:`, error);

        await prisma.notificacion.create({
          data: {
            alertaId,
            tipo,
            destinatario,
            asunto,
            mensaje,
            enviada: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          },
        });

        throw error;
      }
    });

    notificationQueue.on('completed', (job) => {
      logger.debug(`Notificación completada: ${job.id}`);
    });

    notificationQueue.on('failed', (job, error) => {
      logger.error(`Notificación fallida ${job?.id}:`, error);
    });

    logger.info('Cola de notificaciones inicializada');
  }
} catch (error) {
  logger.warn('No se pudo inicializar la cola de notificaciones');
}

export async function addNotificationToQueue(notificationData: NotificationJob): Promise<void> {
  if (notificationQueue) {
    await notificationQueue.add(notificationData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    logger.debug('Notificación agregada a la cola');
  } else {
    try {
      await prisma.notificacion.create({
        data: {
          alertaId: notificationData.alertaId,
          tipo: notificationData.tipo,
          destinatario: notificationData.destinatario,
          asunto: notificationData.asunto,
          mensaje: notificationData.mensaje,
          enviada: true,
          fechaEnvio: new Date(),
        },
      });
      logger.info('Notificación registrada directamente');
    } catch (error) {
      logger.error('Error registrando notificación directamente:', error);
    }
  }
}

export async function sendBulkNotifications(
  alertaId: string,
  destinatarios: string[],
  asunto: string,
  mensaje: string,
  tipo: 'CORREO' | 'SMS' | 'SISTEMA' = 'CORREO'
): Promise<void> {
  for (const destinatario of destinatarios) {
    await addNotificationToQueue({
      alertaId,
      tipo,
      destinatario,
      asunto,
      mensaje,
    });
  }

  logger.info(`${destinatarios.length} notificaciones encoladas para alerta ${alertaId}`);
}

export { notificationQueue };