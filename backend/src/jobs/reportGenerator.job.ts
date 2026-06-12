import { prisma } from '@config/database';
import { logger } from '@utils/logger';
import { sendScheduledReport } from '@services/email.service';

export async function reportGeneratorJob(frecuencia: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' = 'DIARIO'): Promise<void> {
  try {
    const reportesProgramados = await prisma.reporteProgramado.findMany({
      where: {
        activo: true,
        frecuencia: frecuencia as any,
      },
    });

    if (reportesProgramados.length === 0) {
      logger.info(`No hay reportes programados para frecuencia: ${frecuencia}`);
      return;
    }

    logger.info(`Generando ${reportesProgramados.length} reportes programados (${frecuencia})...`);

    for (const reporte of reportesProgramados) {
      try {
        let reportData: any;

        switch (reporte.tipo) {
          case 'STOCK':
            reportData = await generateStockReport(reporte.parametros as any);
            break;
          case 'CADUCIDADES':
            reportData = await generateExpiryReport(reporte.parametros as any);
            break;
          case 'MOVIMIENTOS':
            reportData = await generateMovementsReport(reporte.parametros as any);
            break;
          case 'AUDITORIA':
            reportData = await generateAuditReport(reporte.parametros as any);
            break;
          default:
            logger.warn(`Tipo de reporte no soportado: ${reporte.tipo}`);
            continue;
        }

        if (reporte.destinatarios.length > 0 && reportData) {
          await sendScheduledReport(
            reporte.destinatarios,
            reporte.nombre,
            reporte.tipo,
            reportData
          );
        }

        await prisma.reporteProgramado.update({
          where: { id: reporte.id },
          data: {
            ultimoEnvio: new Date(),
            proximoEnvio: calcularProximoEnvio(frecuencia),
          },
        });

        logger.info(`Reporte "${reporte.nombre}" generado y enviado exitosamente`);
      } catch (error) {
        logger.error(`Error generando reporte "${reporte.nombre}":`, error);
      }
    }

    logger.info('Generación de reportes programados completada');
  } catch (error) {
    logger.error('Error en generación de reportes programados:', error);
  }
}

async function generateStockReport(params: { productoId?: string; almacenId?: string }): Promise<any> {
  const where: any = { estado: 'ACTIVO' };
  if (params.productoId) where.productoId = params.productoId;
  if (params.almacenId) where.almacenId = params.almacenId;

  return await prisma.lote.findMany({
    where,
    include: {
      producto: { select: { nombre: true, sku: true, categoria: true } },
      ubicacion: { select: { codigoCompleto: true } },
    },
    orderBy: { fechaCaducidad: 'asc' },
  });
}

async function generateExpiryReport(params: { dias?: number }): Promise<any> {
  const dias = params.dias || 30;
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + dias);

  return await prisma.lote.findMany({
    where: {
      estado: 'ACTIVO',
      fechaCaducidad: {
        not: null,
        lte: fechaLimite,
      },
    },
    include: {
      producto: { select: { nombre: true, sku: true } },
      ubicacion: { select: { codigoCompleto: true } },
    },
    orderBy: { fechaCaducidad: 'asc' },
  });
}

async function generateMovementsReport(params: { fechaInicio?: string; fechaFin?: string }): Promise<any> {
  const where: any = {};
  if (params.fechaInicio || params.fechaFin) {
    where.creadoEn = {};
    if (params.fechaInicio) where.creadoEn.gte = new Date(params.fechaInicio);
    if (params.fechaFin) where.creadoEn.lte = new Date(params.fechaFin);
  }

  return await prisma.movimientoLote.findMany({
    where,
    include: {
      lote: { select: { codigo: true, producto: { select: { nombre: true } } } },
      usuario: { select: { nombre: true, apellido: true } },
      ubicacionOrigen: { select: { codigoCompleto: true } },
      ubicacionDestino: { select: { codigoCompleto: true } },
    },
    orderBy: { creadoEn: 'desc' },
    take: 100,
  });
}

async function generateAuditReport(params: { fechaInicio?: string; fechaFin?: string }): Promise<any> {
  const where: any = {};
  if (params.fechaInicio || params.fechaFin) {
    where.creadoEn = {};
    if (params.fechaInicio) where.creadoEn.gte = new Date(params.fechaInicio);
    if (params.fechaFin) where.creadoEn.lte = new Date(params.fechaFin);
  }

  return await prisma.simulacroAuditoria.findMany({
    where,
    include: {
      lote: { select: { codigo: true } },
      usuario: { select: { nombre: true, apellido: true } },
    },
    orderBy: { creadoEn: 'desc' },
  });
}

function calcularProximoEnvio(frecuencia: string): Date {
  const ahora = new Date();
  switch (frecuencia) {
    case 'DIARIO':
      ahora.setDate(ahora.getDate() + 1);
      break;
    case 'SEMANAL':
      ahora.setDate(ahora.getDate() + 7);
      break;
    case 'MENSUAL':
      ahora.setMonth(ahora.getMonth() + 1);
      break;
    case 'TRIMESTRAL':
      ahora.setMonth(ahora.getMonth() + 3);
      break;
  }
  ahora.setHours(7, 0, 0, 0);
  return ahora;
}