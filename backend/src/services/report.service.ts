import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { ReportConfig, StockReportDTO, ExpiryReportDTO, TraceabilityReportDTO, ShipmentReportDTO } from '@customTypes/report.types';
import { TraceabilityService } from '@services/traceability.service';
import { daysUntilExpiry } from '@utils/dateUtils';

export class ReportService {
  private traceabilityService: TraceabilityService;

  constructor() {
    this.traceabilityService = new TraceabilityService();
  }

  async generateStockReport(params: ReportConfig): Promise<StockReportDTO[]> {
    const where: any = { estado: 'ACTIVO', cantidad: { gt: 0 } };

    if (params.productoId) where.productoId = params.productoId;
    if (params.almacenId) where.almacenId = params.almacenId;

    const lotes = await prisma.lote.findMany({
      where,
      include: {
        producto: { select: { id: true, nombre: true, sku: true, categoria: true } },
        ubicacion: { select: { codigoCompleto: true } },
      },
      orderBy: { producto: { nombre: 'asc' } },
    });

    const grouped: Record<string, StockReportDTO> = {};

    for (const lote of lotes) {
      const key = lote.productoId;

      if (!grouped[key]) {
        grouped[key] = {
          productoId: lote.producto.id,
          producto: lote.producto.nombre,
          sku: lote.producto.sku,
          categoria: lote.producto.categoria,
          lotes: [],
          cantidadTotal: 0,
          unidad: lote.unidadMedida,
        };
      }

      grouped[key].lotes.push({
        codigo: lote.codigo,
        cantidad: lote.cantidad,
        unidad: lote.unidadMedida,
        fechaCaducidad: lote.fechaCaducidad?.toISOString() || '',
        ubicacion: lote.ubicacion?.codigoCompleto || 'Sin ubicación',
        estado: lote.estado,
        diasRestantes: lote.fechaCaducidad ? daysUntilExpiry(lote.fechaCaducidad) : 0,
      });

      grouped[key].cantidadTotal += lote.cantidad;
    }

    return Object.values(grouped);
  }

  async generateExpiryReport(params: ReportConfig): Promise<ExpiryReportDTO> {
    const dias = 30;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const lotes = await prisma.lote.findMany({
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

    const lotesData = lotes.map((lote) => {
      const diasRest = daysUntilExpiry(lote.fechaCaducidad!);
      let alerta: 'rojo' | 'amarillo' | 'verde' = 'verde';

      if (diasRest < 0) alerta = 'rojo';
      else if (diasRest <= 7) alerta = 'rojo';
      else if (diasRest <= 15) alerta = 'amarillo';

      return {
        codigo: lote.codigo,
        producto: lote.producto.nombre,
        cantidad: lote.cantidad,
        fechaCaducidad: lote.fechaCaducidad!.toISOString(),
        diasRestantes: diasRest,
        ubicacion: lote.ubicacion?.codigoCompleto || 'Sin ubicación',
        estado: lote.estado,
        alerta,
      };
    });

    return {
      lotes: lotesData,
      resumen: {
        totalLotes: lotes.length,
        vencidos: lotesData.filter((l) => l.diasRestantes < 0).length,
        proximos7Dias: lotesData.filter((l) => l.diasRestantes >= 0 && l.diasRestantes <= 7).length,
        proximos15Dias: lotesData.filter((l) => l.diasRestantes > 7 && l.diasRestantes <= 15).length,
        proximos30Dias: lotesData.filter((l) => l.diasRestantes > 15 && l.diasRestantes <= 30).length,
      },
    };
  }

  async generateTraceabilityReport(loteId: string): Promise<TraceabilityReportDTO> {
    const lote = await prisma.lote.findUnique({
      where: { id: loteId },
      include: { producto: true },
    });

    if (!lote) throw ApiError.notFound('Lote no encontrado');

    const trace = await this.traceabilityService.getFullTraceability(lote.codigo);

    return {
      lote: {
        codigo: trace.lote.codigo,
        producto: trace.lote.producto.nombre,
        fechaProduccion: trace.lote.fechaProduccion || '',
        fechaCaducidad: trace.lote.fechaCaducidad || '',
        cantidad: trace.lote.cantidad,
        estado: trace.lote.estado,
      },
      trazabilidadHaciaAtras: trace.trazabilidadHaciaAtras.map((t) => ({
        materiaPrima: t.materiaPrima.nombre,
        loteMP: t.loteMateriaPrima.codigo,
        proveedor: t.proveedor.nombre,
        fechaRecepcion: t.fechaRecepcion,
        cantidad: t.cantidadUtilizada,
      })),
      trazabilidadHaciaAdelante: trace.trazabilidadHaciaAdelante.map((t) => ({
        cliente: t.cliente.nombre,
        codigoExpedicion: t.expedicion.codigo,
        fechaEnvio: t.expedicion.fechaEnvio || '',
        cantidad: t.cantidadEnviada,
        estado: t.expedicion.estado,
      })),
      movimientos: trace.lineaTiempo.map((t) => ({
        fecha: t.fecha,
        tipo: t.tipo,
        origen: t.detalles.origen || '',
        destino: t.detalles.destino || '',
        cantidad: t.detalles.cantidad,
        usuario: t.usuario,
      })),
    };
  }

  async generateShipmentReport(params: ReportConfig): Promise<ShipmentReportDTO> {
    const where: any = {};

    if (params.clienteId) where.clienteId = params.clienteId;
    if (params.estado) where.estado = params.estado;
    if (params.fechaInicio || params.fechaFin) {
      where.fechaEnvio = {};
      if (params.fechaInicio) where.fechaEnvio.gte = new Date(params.fechaInicio);
      if (params.fechaFin) where.fechaEnvio.lte = new Date(params.fechaFin);
    }

    const expediciones = await prisma.expedicion.findMany({
      where,
      include: {
        cliente: { select: { nombre: true } },
        items: true,
      },
      orderBy: { fechaEnvio: 'desc' },
    });

    return {
      expediciones: expediciones.map((exp) => ({
        codigo: exp.codigo,
        cliente: exp.cliente.nombre,
        fechaEnvio: exp.fechaEnvio?.toISOString() || '',
        estado: exp.estado,
        cantidadItems: exp.items.length,
        cantidadTotal: exp.items.reduce((sum, item) => sum + item.cantidad, 0),
        transportista: exp.empresaTransporte || 'N/A',
      })),
      resumen: {
        totalExpediciones: expediciones.length,
        totalEntregadas: expediciones.filter((e) => e.estado === 'ENTREGADO').length,
        totalEnTransito: expediciones.filter((e) => e.estado === 'EN_TRANSITO').length,
        totalCanceladas: expediciones.filter((e) => e.estado === 'CANCELADO').length,
      },
    };
  }
}