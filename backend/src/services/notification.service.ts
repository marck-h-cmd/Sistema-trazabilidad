import { addNotificationToQueue, sendBulkNotifications } from '@queues/notification.queue';
import { addEmailToQueue } from '@queues/email.queue';
import { prisma } from '@config/database';
import { logger } from '@utils/logger';

export class NotificationService {
  async sendAlertNotification(
    alertaId: string,
    destinatarios: string[],
    asunto: string,
    mensaje: string
  ) {
    await sendBulkNotifications(alertaId, destinatarios, asunto, mensaje);

    for (const email of destinatarios) {
      try {
        await addEmailToQueue({
          to: email,
          subject: asunto,
          html: mensaje,
        });
      } catch (error) {
        logger.error(`Error encolando email para ${email}:`, error);
      }
    }
  }

  async sendExpiryNotification(loteId: string) {
    const lote = await prisma.lote.findUnique({
      where: { id: loteId },
      include: { producto: true },
    });

    if (!lote) return;

    const usuariosCalidad = await prisma.usuario.findMany({
      where: { rol: 'CALIDAD', estado: 'ACTIVO' },
      select: { email: true },
    });

    const destinatarios = usuariosCalidad.map((u) => u.email);

    if (destinatarios.length > 0) {
      const asunto = `Lote próximo a vencer: ${lote.codigo}`;
      const mensaje = `
        <h2>Lote próximo a vencer</h2>
        <p><strong>Código:</strong> ${lote.codigo}</p>
        <p><strong>Producto:</strong> ${lote.producto.nombre}</p>
        <p><strong>Fecha de caducidad:</strong> ${lote.fechaCaducidad?.toISOString().split('T')[0]}</p>
        <p><strong>Cantidad restante:</strong> ${lote.cantidad} ${lote.unidadMedida}</p>
        <p>Por favor, tome las acciones necesarias.</p>
      `;

      await sendBulkNotifications('SYSTEM', destinatarios, asunto, mensaje);
    }
  }

  async sendStockLowNotification(productoId: string, stockActual: number) {
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });

    if (!producto) return;

    const usuariosAlmacen = await prisma.usuario.findMany({
      where: { rol: { in: ['ALMACEN', 'ADMINISTRADOR'] }, estado: 'ACTIVO' },
      select: { email: true },
    });

    const destinatarios = usuariosAlmacen.map((u) => u.email);

    if (destinatarios.length > 0) {
      const asunto = `Stock bajo: ${producto.nombre}`;
      const mensaje = `
        <h2>Alerta de Stock Bajo</h2>
        <p><strong>Producto:</strong> ${producto.nombre} (${producto.sku})</p>
        <p><strong>Stock actual:</strong> ${stockActual} ${producto.unidadMedida}</p>
        <p>Se recomienda realizar un pedido de reposición.</p>
      `;

      await sendBulkNotifications('SYSTEM', destinatarios, asunto, mensaje);
    }
  }
}