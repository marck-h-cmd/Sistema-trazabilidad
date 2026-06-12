import Bull from 'bull';
import { config } from '@config/app';
import { logger } from '@utils/logger';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface PDFJob {
  type: 'ALBARAN' | 'ETIQUETA' | 'REPORTE' | 'INFORME_CRISIS';
  data: Record<string, any>;
  outputPath?: string;
  metadata?: Record<string, any>;
}

let pdfQueue: Bull.Queue<PDFJob> | null = null;

try {
  if (config.redis.url) {
    pdfQueue = new Bull<PDFJob>('pdf-queue', config.redis.url);

    pdfQueue.process(async (job) => {
      const { type, data, outputPath } = job.data;

      try {
        let pdfBuffer: Buffer;

        switch (type) {
          case 'ALBARAN':
            pdfBuffer = await generateAlbaranPDF(data);
            break;
          case 'ETIQUETA':
            pdfBuffer = await generateLabelPDF(data);
            break;
          case 'REPORTE':
            pdfBuffer = await generateReportPDF(data);
            break;
          case 'INFORME_CRISIS':
            pdfBuffer = await generateCrisisReportPDF(data);
            break;
          default:
            throw new Error(`Tipo de PDF no soportado: ${type}`);
        }

        if (outputPath) {
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(outputPath, pdfBuffer);
        }

        logger.info(`PDF tipo ${type} generado exitosamente`);
        return { buffer: pdfBuffer, outputPath };
      } catch (error) {
        logger.error(`Error generando PDF tipo ${type}:`, error);
        throw error;
      }
    });

    logger.info('Cola de PDF inicializada');
  }
} catch (error) {
  logger.warn('No se pudo inicializar la cola de PDF');
}

async function generateAlbaranPDF(data: Record<string, any>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('ALBARÁN DE ENTREGA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Nº Albarán: ${data.codigo || 'N/A'}`);
    doc.text(`Fecha: ${data.fecha || new Date().toLocaleDateString()}`);
    doc.text(`Cliente: ${data.cliente || 'N/A'}`);
    doc.text(`Transporte: ${data.transporte || 'N/A'}`);
    doc.moveDown();
    doc.text('Productos:');
    doc.moveDown();

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item: any, index: number) => {
        doc.text(`${index + 1}. ${item.producto || 'Producto'} - Lote: ${item.lote || 'N/A'} - Cantidad: ${item.cantidad || 0} ${item.unidad || ''}`);
      });
    }

    doc.end();
  });
}

async function generateLabelPDF(data: Record<string, any>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: [141, 85], margin: 5 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(8).text(data.producto || 'Producto');
    doc.fontSize(6).text(`Lote: ${data.lote || 'N/A'}`);
    doc.text(`Prod: ${data.fechaProduccion || 'N/A'}`);
    doc.text(`Cad: ${data.fechaCaducidad || 'N/A'}`);

    doc.end();
  });
}

async function generateReportPDF(data: Record<string, any>): Promise<Buffer> {
  return Buffer.from('Reporte PDF');
}

async function generateCrisisReportPDF(data: Record<string, any>): Promise<Buffer> {
  return Buffer.from('Informe de Crisis PDF');
}

export async function addPDFToQueue(pdfData: PDFJob): Promise<any> {
  if (pdfQueue) {
    const job = await pdfQueue.add(pdfData, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 10000 },
    });
    return job.finished();
  } else {
    throw new Error('Cola de PDF no disponible');
  }
}

export { pdfQueue };