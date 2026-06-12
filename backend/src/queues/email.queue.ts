import Bull from 'bull';
import { config } from '@config/app';
import { logger } from '@utils/logger';
import { transporter, emailDefaults } from '@config/email';

interface EmailJob {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
  cc?: string | string[];
  bcc?: string | string[];
}

let emailQueue: Bull.Queue<EmailJob> | null = null;

try {
  if (config.redis.url) {
    emailQueue = new Bull<EmailJob>('email-queue', config.redis.url);

    emailQueue.process(async (job) => {
      const { to, subject, html, attachments, cc, bcc } = job.data;

      try {
        const info = await transporter.sendMail({
          ...emailDefaults,
          to,
          subject,
          html,
          attachments,
          cc,
          bcc,
        });

        logger.info(`Email enviado a ${Array.isArray(to) ? to.join(', ') : to}: ${info.messageId}`);
        return info;
      } catch (error) {
        logger.error(`Error enviando email a ${Array.isArray(to) ? to.join(', ') : to}:`, error);
        throw error;
      }
    });

    emailQueue.on('completed', (job) => {
      logger.debug(`Job de email completado: ${job.id}`);
    });

    emailQueue.on('failed', (job, error) => {
      logger.error(`Job de email fallido ${job?.id}:`, error);
    });

    logger.info('Cola de email inicializada');
  }
} catch (error) {
  logger.warn('No se pudo inicializar la cola de email, se enviarán directamente');
}

export async function addEmailToQueue(emailData: EmailJob): Promise<void> {
  if (emailQueue) {
    await emailQueue.add(emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    logger.debug('Email agregado a la cola');
  } else {
    try {
      await transporter.sendMail({
        ...emailDefaults,
        ...emailData,
      });
      logger.info('Email enviado directamente');
    } catch (error) {
      logger.error('Error enviando email directamente:', error);
      throw error;
    }
  }
}

export { emailQueue };