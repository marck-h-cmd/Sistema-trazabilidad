import { prisma } from '@config/database';
import { logger } from '@utils/logger';

export async function stockAlertJob(): Promise<void> {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        categoria: { in: ['MATERIA_PRIMA', 'PRODUCTO_TERMINADO'] },
      },
      include: {
        lotes: {
          where: {
            estado: 'ACTIVO',
          },
        },
      },
    });

    const alertas = [];

    for (const producto of productos) {
      const stockTotal = producto.lotes.reduce((sum, lote) => sum + lote.cantidad, 0);

      if (stockTotal === 0) {
        alertas.push({
          producto: producto.nombre,
          sku: producto.sku,
          stock: 0,
          severidad: 'ALTA',
          mensaje: 'Sin stock disponible',
        });
      } else if (stockTotal < 10 && producto.categoria === 'MATERIA_PRIMA') {
        alertas.push({
          producto: producto.nombre,
          sku: producto.sku,
          stock: stockTotal,
          severidad: 'MEDIA',
          mensaje: 'Stock bajo de materia prima',
        });
      } else if (stockTotal < 5 && producto.categoria === 'PRODUCTO_TERMINADO') {
        alertas.push({
          producto: producto.nombre,
          sku: producto.sku,
          stock: stockTotal,
          severidad: 'BAJA',
          mensaje: 'Stock bajo de producto terminado',
        });
      }
    }

    if (alertas.length > 0) {
      logger.warn(`Alertas de stock: ${alertas.length} productos con stock bajo o agotado`);

      for (const alerta of alertas) {
        logger.info(`[${alerta.severidad}] ${alerta.producto} (${alerta.sku}): ${alerta.mensaje} - Stock actual: ${alerta.stock}`);
      }
    } else {
      logger.info('Verificación de stock completada: todos los niveles normales');
    }
  } catch (error) {
    logger.error('Error en verificación de stock:', error);
  }
}