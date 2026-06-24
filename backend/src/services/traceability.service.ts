import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { FullTraceabilityDTO, BackwardTraceItem, ForwardTraceItem, TimelineItem, PublicTraceabilityDTO } from '@customTypes/traceability.types';
import { formatDate } from '@utils/dateUtils';

interface TraceabilityUserContext {
  id: string;
  rol: string;
  clienteId?: string | null;
}

export class TraceabilityService {
  async getFullTraceability(codigo: string, user?: TraceabilityUserContext | null): Promise<FullTraceabilityDTO> {
    const lote = await prisma.lote.findUnique({
      where: { codigo },
      include: {
        producto: true,
        ubicacion: {
          include: { almacen: true },
        },
      },
    });

    if (!lote) {
      throw ApiError.notFound('Lote no encontrado');
    }

    const accessCache = new Map<string, Promise<void>>();
    await this.ensureLotAccess(lote.id, user, accessCache);

    const [backwardTrace, forwardTrace, timeline] = await Promise.all([
      this.getBackwardTrace(lote.id, user, accessCache),
      this.getForwardTrace(lote.id, user, accessCache),
      this.getTimeline(lote.id, user, accessCache),
    ]);

    return {
      lote: {
        id: lote.id,
        codigo: lote.codigo,
        producto: {
          id: lote.producto.id,
          nombre: lote.producto.nombre,
          sku: lote.producto.sku,
          descripcion: lote.producto.descripcion,
        },
        cantidad: lote.cantidad,
        cantidadInicial: lote.cantidadInicial,
        unidadMedida: lote.unidadMedida,
        fechaProduccion: lote.fechaProduccion ? formatDate(lote.fechaProduccion) : null,
        fechaCaducidad: lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : null,
        fechaRecepcion: lote.fechaRecepcion ? formatDate(lote.fechaRecepcion) : null,
        estado: lote.estado,
        ubicacionActual: lote.ubicacion
          ? {
              almacen: lote.ubicacion.almacen.nombre,
              ubicacion: lote.ubicacion.codigoCompleto,
              codigoCompleto: lote.ubicacion.codigoCompleto,
            }
          : null,
      },
      trazabilidadHaciaAtras: backwardTrace,
      trazabilidadHaciaAdelante: forwardTrace,
      lineaTiempo: timeline,
    };
  }

  async getBackwardTrace(
    loteId: string,
    user?: TraceabilityUserContext | null,
    accessCache?: Map<string, Promise<void>>
  ): Promise<BackwardTraceItem[]> {
    await this.ensureLotAccess(loteId, user, accessCache);

    const materiasPrimas = await prisma.materiaPrima.findMany({
      where: {
        produccion: {
          loteId: loteId,
        },
      },
      include: {
        lote: {
          include: {
            producto: true,
          },
        },
        proveedor: true,
      },
    });

    if (materiasPrimas.length === 0) {
      const lote = await prisma.lote.findUnique({
        where: { id: loteId },
        include: { lotePadre: true },
      });

      if (lote?.lotePadreId) {
        return this.getBackwardTrace(lote.lotePadreId, user);
      }

      return [];
    }

    return materiasPrimas.map((mp) => ({
      materiaPrima: {
        id: mp.lote.producto.id,
        nombre: mp.lote.producto.nombre,
        sku: mp.lote.producto.sku,
      },
      loteMateriaPrima: {
        id: mp.lote.id,
        codigo: mp.lote.codigo,
      },
      proveedor: {
        id: mp.proveedor.id,
        nombre: mp.proveedor.nombre,
        codigo: mp.proveedor.codigo,
      },
      cantidadUtilizada: mp.cantidad,
      unidadMedida: mp.unidadMedida,
      fechaRecepcion: mp.fechaRecepcion ? formatDate(mp.fechaRecepcion) : '',
      numeroLoteProveedor: mp.codigoLoteProveedor,
    }));
  }

  async getForwardTrace(
    loteId: string,
    user?: TraceabilityUserContext | null,
    accessCache?: Map<string, Promise<void>>
  ): Promise<ForwardTraceItem[]> {
    await this.ensureLotAccess(loteId, user, accessCache);

    const itemsExpedicion = await prisma.itemExpedicion.findMany({
      where: { loteId },
      include: {
        expedicion: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (itemsExpedicion.length === 0) {
      const lotesHijos = await prisma.lote.findMany({
        where: { lotePadreId: loteId },
      });

      if (lotesHijos.length > 0) {
        const traces: ForwardTraceItem[] = [];
        for (const hijo of lotesHijos) {
          const childTraces = await this.getForwardTrace(hijo.id, user);
          traces.push(...childTraces);
        }
        return traces;
      }

      return [];
    }

    return itemsExpedicion.map((item) => ({
      cliente: {
        id: item.expedicion.cliente.id,
        nombre: item.expedicion.cliente.nombre,
        codigo: item.expedicion.cliente.codigo,
        tipo: item.expedicion.cliente.tipo,
      },
      expedicion: {
        id: item.expedicion.id,
        codigo: item.expedicion.codigo,
        fechaEnvio: item.expedicion.fechaEnvio ? formatDate(item.expedicion.fechaEnvio) : null,
        estado: item.expedicion.estado,
      },
      cantidadEnviada: item.cantidad,
      unidadMedida: item.unidadMedida,
      fechaPrevistaEntrega: item.expedicion.fechaPrevistaEntrega
        ? formatDate(item.expedicion.fechaPrevistaEntrega)
        : null,
    }));
  }

  async getTimeline(
    loteId: string,
    user?: TraceabilityUserContext | null,
    accessCache?: Map<string, Promise<void>>
  ): Promise<TimelineItem[]> {
    await this.ensureLotAccess(loteId, user, accessCache);

    const movimientos = await prisma.movimientoLote.findMany({
      where: { loteId },
      orderBy: { creadoEn: 'asc' },
      include: {
        usuario: {
          select: { nombre: true, apellido: true },
        },
        ubicacionOrigen: true,
        ubicacionDestino: true,
      },
    });

    const timeline: TimelineItem[] = movimientos.map((mov) => ({
      fecha: formatDate(mov.creadoEn, "yyyy-MM-dd'T'HH:mm:ss"),
      tipo: this.mapMovementType(mov.tipo),
      descripcion: this.getMovementDescription(mov),
      detalles: {
        cantidad: mov.cantidad,
        unidad: mov.unidadMedida,
        origen: mov.ubicacionOrigen?.codigoCompleto || null,
        destino: mov.ubicacionDestino?.codigoCompleto || null,
      },
      usuario: `${mov.usuario.nombre} ${mov.usuario.apellido}`,
    }));

    return timeline;
  }

  async getPublicTraceability(codigo: string): Promise<PublicTraceabilityDTO> {
    const lote = await prisma.lote.findUnique({
      where: { codigo },
      include: {
        producto: true,
        materiasPrimas: {
          include: {
            lote: {
              include: {
                producto: true,
              },
            },
            proveedor: true,
          },
        },
        produccion: true,
      },
    });

    if (!lote) {
      throw ApiError.notFound('Lote no encontrado');
    }

    const ingredientes = lote.materiasPrimas.map(
      (mp) => mp.lote.producto.nombre
    );

    const alergenos = this.extractAlergenos(lote.producto.nombre, ingredientes);

    return {
      producto: {
        nombre: lote.producto.nombre,
        descripcion: lote.producto.descripcion,
        categoria: lote.producto.categoria,
      },
      lote: {
        codigo: lote.codigo,
        fechaProduccion: lote.fechaProduccion ? formatDate(lote.fechaProduccion) : null,
        fechaCaducidad: lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : null,
        fechaEnvasado: lote.fechaEnvasado ? formatDate(lote.fechaEnvasado) : null,
      },
      ingredientes: [...new Set(ingredientes)],
      alergenos,
      informacionNutricional: (lote.metadatos as any)?.informacionNutricional || null,
      sellosCalidad: (lote.metadatos as any)?.sellosCalidad || [],
    };
  }

  private async ensureLotAccess(
    loteId: string,
    user?: TraceabilityUserContext | null,
    accessCache?: Map<string, Promise<void>>
  ): Promise<void> {
    if (!user?.id) {
      return;
    }

    const cacheKey = `${user.id}:${loteId}`;
    const cached = accessCache?.get(cacheKey);
    if (cached) {
      await cached;
      return;
    }

    const accessCheck = (async () => {
      const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, rol: true, clienteId: true },
    });

      if (!usuario) {
        throw ApiError.forbidden('No tiene permiso para consultar este lote');
      }

      if (usuario.rol === 'CLIENTE') {
        const hasClientAccess = await prisma.itemExpedicion.findFirst({
          where: {
            loteId,
            expedicion: {
              clienteId: usuario.clienteId || '',
            },
          },
        });

        if (!hasClientAccess) {
          throw ApiError.forbidden('No tiene permiso para consultar este lote');
        }
        return;
      }

      if (usuario.rol === 'AUTORIDAD') {
        const activeAlerts = await prisma.alerta.count({
          where: {
            loteId,
            estado: {
              in: ['ABIERTA', 'INVESTIGANDO'],
            },
          },
        });

        if (activeAlerts === 0) {
          throw ApiError.forbidden('No tiene permiso para consultar este lote');
        }
      }
    })();

    accessCache?.set(cacheKey, accessCheck);
    await accessCheck;
  }

  private mapMovementType(tipo: string): TimelineItem['tipo'] {
    const typeMap: Record<string, TimelineItem['tipo']> = {
      RECEPCION: 'RECEPCION',
      PRODUCCION: 'PRODUCCION',
      MOVIMIENTO_INTERNO: 'MOVIMIENTO',
      EXPEDICION: 'EXPEDICION',
      DEVOLUCION: 'MOVIMIENTO',
      AJUSTE: 'MOVIMIENTO',
      CONSUMO: 'PRODUCCION',
      MERMA: 'MOVIMIENTO',
    };
    return typeMap[tipo] || 'MOVIMIENTO';
  }

  private getMovementDescription(mov: any): string {
    switch (mov.tipo) {
      case 'RECEPCION':
        return `Recepción de materia prima - ${mov.observaciones || ''}`;
      case 'PRODUCCION':
        return `Producción de lote - ${mov.observaciones || ''}`;
      case 'MOVIMIENTO_INTERNO':
        return `Movimiento de ${mov.ubicacionOrigen?.codigoCompleto || 'origen'} a ${mov.ubicacionDestino?.codigoCompleto || 'destino'}`;
      case 'EXPEDICION':
        return `Expedición a cliente - ${mov.observaciones || ''}`;
      case 'CONSUMO':
        return `Consumo en producción - ${mov.observaciones || ''}`;
      default:
        return mov.observaciones || 'Movimiento registrado';
    }
  }

  private extractAlergenos(producto: string, ingredientes: string[]): string[] {
    const alergenosComunes: Record<string, string[]> = {
      'trigo': ['GLUTEN'],
      'harina': ['GLUTEN'],
      'cebada': ['GLUTEN'],
      'centeno': ['GLUTEN'],
      'avena': ['GLUTEN'],
      'huevo': ['HUEVO'],
      'huevos': ['HUEVO'],
      'leche': ['LACTEOS'],
      'lacteos': ['LACTEOS'],
      'queso': ['LACTEOS'],
      'mantequilla': ['LACTEOS'],
      'soja': ['SOJA'],
      'frutos secos': ['FRUTOS_SECOS'],
      'almendra': ['FRUTOS_SECOS'],
      'nuez': ['FRUTOS_SECOS'],
      'avellana': ['FRUTOS_SECOS'],
    };

    const alergenos = new Set<string>();
    const todosIngredientes = [producto, ...ingredientes].map((i) => i.toLowerCase());

    for (const ingrediente of todosIngredientes) {
      for (const [key, values] of Object.entries(alergenosComunes)) {
        if (ingrediente.includes(key)) {
          values.forEach((v) => alergenos.add(v));
        }
      }
    }

    return Array.from(alergenos);
  }
}