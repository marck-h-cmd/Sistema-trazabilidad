import Bull from 'bull';
import { config } from '@config/app';
import { logger } from '@utils/logger';
import { generateBarcode } from '@services/barcode.service';
import { generateQRCode } from '@services/qrcode.service';

interface LabelJob {
  lotId: string;
  lotCode: string;
  productName: string;
  productionDate?: string;
  expiryDate?: string;
  labelType: 'CODE_128' | 'QR' | 'AMBOS';
  quantity: number;
  template?: Record<string, any>;
}

let labelQueue: Bull.Queue<LabelJob> | null = null;

try {
  if (config.redis.url) {
    labelQueue = new Bull<LabelJob>('label-queue', config.redis.url);

    labelQueue.process(async (job) => {
      const { lotId, lotCode, productName, productionDate, expiryDate, labelType, quantity, template } = job.data;

      try {
        const labels: { type: string; data: Buffer }[] = [];

        if (labelType === 'CODE_128' || labelType === 'AMBOS') {
          const barcode = await generateBarcode(lotCode);
          for (let i = 0; i < quantity; i++) {
            labels.push({ type: 'CODE_128', data: barcode.image });
          }
        }

        if (labelType === 'QR' || labelType === 'AMBOS') {
          const qrCode = await generateQRCode(lotCode);
          for (let i = 0; i < quantity; i++) {
            labels.push({ type: 'QR', data: qrCode.image });
          }
        }

        logger.info(`${labels.length} etiquetas generadas para lote ${lotCode}`);
        return { lotId, lotCode, labels, quantity: labels.length };
      } catch (error) {
        logger.error(`Error generando etiquetas para lote ${lotCode}:`, error);
        throw error;
      }
    });

    logger.info('Cola de etiquetas inicializada');
  }
} catch (error) {
  logger.warn('No se pudo inicializar la cola de etiquetas');
}

export async function addLabelToQueue(labelData: LabelJob): Promise<any> {
  if (labelQueue) {
    const job = await labelQueue.add(labelData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      priority: 1,
    });
    return job.finished();
  } else {
    throw new Error('Cola de etiquetas no disponible');
  }
}

export { labelQueue };