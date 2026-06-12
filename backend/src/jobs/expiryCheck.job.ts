import { prisma } from '@config/database';
import { logger } from '@utils/logger';
import { daysUntilExpiry } from '@utils/dateUtils';

export async function expiryCheckJob(): Promise<void> {
  try {
    const lotes = await prisma.lote.findMany({
      where: {
        estado: 'ACTIVO',
        fechaCaducidad: { not: null },
      },
      include: {
        producto: {
          select: {
            nombre: true,
            sku: true,
          },
        },
        ubicacion: {
          select: {
            codigoCompleto: true,
          },
        },
      },
    });

    let vencidosCount = 0;
    let proximosVencerCount = 0;

    for (const lote of lotes) {
      if (!lote.fechaCaducidad) continue;

      const diasRestantes = daysUntilExpiry(lote.fechaCaducidad);

      if (diasRestantes < 0 && lote.estado === 'ACTIVO') {
        await prisma.lote.update({
          where: { id: lote.id },
          data: { estado: 'VENCIDO' },
        });

        await prisma.movimientoLote.create({
          data: {
            loteId: lote.id,
            tipo: 'AJUSTE',
            cantidad: lote.cantidad,
            unidadMedida: lote.unidadMedida,
            realizadoPor: 'SYSTEM',
            observaciones: 'Lote marcado como vencido automáticamente',
          },
        });

        logger.warn(`Lote ${lote.codigo} marcado como vencido`);
        vencidosCount++;
      } else if (diasRestantes <= 7 && diasRestantes >= 0) {
        logger.info(
          `Lote ${lote.codigo} (${lote.producto.nombre}) vencerá en ${diasRestantes} días. Ubicación: ${lote.ubicacion?.codigoCompleto || 'N/A'}`
        );
        proximosVencerCount++;
      }
    }

    logger.info(
      `Verificación de caducidades completada: ${vencidosCount} vencidos, ${proximosVencerCount} próximos a vencer`
    );
  } catch (error) {
    logger.error('Error en verificación de caducidades:', error);
  }
}