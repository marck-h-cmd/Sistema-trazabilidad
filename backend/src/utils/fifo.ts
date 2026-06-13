import { prisma } from '@config/database';
import { EstadoLote } from '@prisma/client';
import { ApiError } from './errors';

export interface FifoItem {
  loteId: string;
  codigo: string;
  cantidadDisponible: number;
  fechaCaducidad: Date;
  ubicacion: string;
}

export interface FifoSuggestion {
  lotes: FifoItem[];
  cantidadTotal: number;
  message: string;
}

export async function getFifoSuggestions(
  productoId: string,
  cantidadNecesaria: number
): Promise<FifoSuggestion> {
  const lotesDisponibles = await prisma.lote.findMany({
    where: {
      productoId,
      estado: EstadoLote.ACTIVO,
      cantidad: { gt: 0 },
      fechaCaducidad: { not: null },
    },
    include: {
      ubicacion: {
        select: {
          codigoCompleto: true,
        },
      },
    },
    orderBy: {
      fechaCaducidad: 'asc',
    },
  });

  if (lotesDisponibles.length === 0) {
    throw ApiError.notFound('No hay lotes disponibles para este producto');
  }

  const suggestion: FifoItem[] = [];
  let cantidadAcumulada = 0;

  for (const lote of lotesDisponibles) {
    if (cantidadAcumulada >= cantidadNecesaria) break;

    const cantidadTomar = Math.min(lote.cantidad, cantidadNecesaria - cantidadAcumulada);

    suggestion.push({
      loteId: lote.id,
      codigo: lote.codigo,
      cantidadDisponible: cantidadTomar,
      fechaCaducidad: lote.fechaCaducidad!,
      ubicacion: lote.ubicacion?.codigoCompleto || 'Sin ubicación',
    });

    cantidadAcumulada += cantidadTomar;
  }

  if (cantidadAcumulada < cantidadNecesaria) {
    return {
      lotes: suggestion,
      cantidadTotal: cantidadAcumulada,
      message: `Stock insuficiente. Solo hay ${cantidadAcumulada} disponible de ${cantidadNecesaria} necesario.`,
    };
  }

  return {
    lotes: suggestion,
    cantidadTotal: cantidadAcumulada,
    message: `Sugerencia FIFO generada exitosamente.`,
  };
}

export async function validateFifoOrder(
  lotesSeleccionados: { loteId: string; cantidad: number }[]
): Promise<{ valid: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const lotesInfo = [];

  for (const item of lotesSeleccionados) {
    const lote = await prisma.lote.findUnique({
      where: { id: item.loteId },
      select: {
        id: true,
        codigo: true,
        fechaCaducidad: true,
        estado: true,
      },
    });

    if (lote) {
      lotesInfo.push(lote);
    }
  }

  const allLotesDisponibles = await prisma.lote.findMany({
    where: {
      id: { in: lotesSeleccionados.map((l) => l.loteId) },
    },
    orderBy: {
      fechaCaducidad: 'asc',
    },
  });

  if (allLotesDisponibles.length > 0 && lotesInfo.length > 0) {
    const oldestAvailable = allLotesDisponibles[0];
    const selectedIds = lotesInfo.map((l) => l.id);

    if (!selectedIds.includes(oldestAvailable.id)) {
      warnings.push(
        `El lote ${oldestAvailable.codigo} con caducidad ${oldestAvailable.fechaCaducidad?.toISOString().split('T')[0]} debería consumirse primero según FIFO.`
      );
    }
  }

  for (const lote of lotesInfo) {
    if (lote.estado === 'VENCIDO') {
      warnings.push(`El lote ${lote.codigo} está vencido.`);
    }
    if (lote.estado === 'BLOQUEADO') {
      warnings.push(`El lote ${lote.codigo} está bloqueado por alerta sanitaria.`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}