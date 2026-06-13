import { prisma } from '@config/database';
import { daysUntilExpiry } from '@utils/dateUtils';

export class DashboardService {
  async getKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalLotesActivos,
      recepcionesHoy,
      produccionesHoy,
      expedicionesHoy,
      alertasActivas,
      lotesPorVencer,
      lotesVencidos,
    ] = await Promise.all([
      prisma.lote.count({ where: { estado: 'ACTIVO', cantidad: { gt: 0 } } }),

      prisma.recepcion.count({
        where: { creadoEn: { gte: today, lt: tomorrow } },
      }),

      prisma.produccion.count({
        where: { creadoEn: { gte: today, lt: tomorrow } },
      }),

      prisma.expedicion.count({
        where: { creadoEn: { gte: today, lt: tomorrow } },
      }),

      prisma.alerta.count({
        where: { estado: { in: ['ABIERTA', 'INVESTIGANDO'] } },
      }),

      this.countExpiringSoon(7),

      prisma.lote.count({ where: { estado: 'VENCIDO' } }),
    ]);

    const stockPorCategoria = await this.getStockByCategory();

    return {
      totalLotesActivos,
      recepcionesHoy,
      produccionesHoy,
      expedicionesHoy,
      alertasActivas,
      lotesPorVencer,
      lotesVencidos,
      stockPorCategoria,
    };
  }

  async getRecentActivity(limit: number = 10) {
    const [receptions, productions, shipments, movements] = await Promise.all([
      prisma.recepcion.findMany({
        take: 3,
        orderBy: { creadoEn: 'desc' },
        include: {
          proveedor: { select: { nombre: true } },
          receptor: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.produccion.findMany({
        take: 3,
        orderBy: { creadoEn: 'desc' },
        include: {
          lote: { select: { codigo: true, producto: { select: { nombre: true } } } },
          lineaProduccion: { select: { codigo: true } },
          operario: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.expedicion.findMany({
        take: 3,
        orderBy: { creadoEn: 'desc' },
        include: {
          cliente: { select: { nombre: true } },
          preparador: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.movimientoLote.findMany({
        take: 5,
        orderBy: { creadoEn: 'desc' },
        include: {
          lote: { select: { codigo: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
    ]);

    const activities: any[] = [];

    receptions.forEach((r) => {
      activities.push({
        tipo: 'RECEPCION',
        descripcion: `Recepción de ${r.proveedor.nombre}`,
        codigo: r.codigo,
        usuario: `${r.receptor.nombre} ${r.receptor.apellido}`,
        fecha: r.creadoEn,
      });
    });

    productions.forEach((p) => {
      activities.push({
        tipo: 'PRODUCCION',
        descripcion: `Producción de ${p.lote?.producto?.nombre || 'producto'}`,
        codigo: p.lote?.codigo || '',
        usuario: `${p.operario.nombre} ${p.operario.apellido}`,
        fecha: p.creadoEn,
      });
    });

    shipments.forEach((s) => {
      activities.push({
        tipo: 'EXPEDICION',
        descripcion: `Expedición a ${s.cliente.nombre}`,
        codigo: s.codigo,
        usuario: `${s.preparador.nombre} ${s.preparador.apellido}`,
        fecha: s.creadoEn,
      });
    });

    movements.forEach((m) => {
      activities.push({
        tipo: 'MOVIMIENTO',
        descripcion: `Movimiento de lote ${m.lote.codigo}`,
        codigo: m.lote.codigo,
        usuario: `${m.usuario.nombre} ${m.usuario.apellido}`,
        fecha: m.creadoEn,
      });
    });

    activities.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    return activities.slice(0, limit);
  }

  private async countExpiringSoon(days: number): Promise<number> {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + days);

    return prisma.lote.count({
      where: {
        estado: 'ACTIVO',
        cantidad: { gt: 0 },
        fechaCaducidad: {
          not: null,
          lte: limitDate,
          gte: new Date(),
        },
      },
    });
  }

  private async getStockByCategory() {
    const lotes = await prisma.lote.groupBy({
      by: ['productoId'],
      where: {
        estado: 'ACTIVO',
        cantidad: { gt: 0 },
      },
      _sum: { cantidad: true },
    });

    const categorias: Record<string, number> = {};

    for (const lote of lotes) {
      const producto = await prisma.producto.findUnique({
        where: { id: lote.productoId },
        select: { categoria: true },
      });

      if (producto) {
        const cat = producto.categoria;
        categorias[cat] = (categorias[cat] || 0) + (lote._sum.cantidad || 0);
      }
    }

    return Object.entries(categorias).map(([categoria, cantidad]) => ({
      categoria,
      cantidad: Math.round(cantidad * 100) / 100,
    }));
  }
}