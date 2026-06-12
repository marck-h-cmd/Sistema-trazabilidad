import { TipoMovimiento } from '@prisma/client';

export interface MovementDTO {
  id: string;
  loteId: string;
  lote?: {
    id: string;
    codigo: string;
    producto?: {
      id: string;
      nombre: string;
    };
  };
  tipo: TipoMovimiento;
  ubicacionOrigenId: string | null;
  ubicacionOrigen?: {
    id: string;
    codigoCompleto: string;
  } | null;
  ubicacionDestinoId: string | null;
  ubicacionDestino?: {
    id: string;
    codigoCompleto: string;
  } | null;
  cantidad: number;
  unidadMedida: string;
  referenciaId: string | null;
  referenciaTipo: string | null;
  realizadoPor: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  observaciones: string | null;
  creadoEn: Date;
}

export interface CreateMovementDTO {
  loteId: string;
  tipo: TipoMovimiento;
  ubicacionOrigenId?: string;
  ubicacionDestinoId?: string;
  cantidad: number;
  unidadMedida: string;
  referenciaId?: string;
  referenciaTipo?: string;
  observaciones?: string;
}

export interface MovementQueryParams {
  page?: number;
  limit?: number;
  loteId?: string;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  realizadoPor?: string;
  ubicacionId?: string;
}