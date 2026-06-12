import { TipoAlerta, SeveridadAlerta, EstadoAlerta } from '@prisma/client';

export interface AlertDTO {
  id: string;
  codigo: string;
  loteId: string;
  lote?: {
    id: string;
    codigo: string;
    producto?: {
      id: string;
      nombre: string;
    };
  };
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  estado: EstadoAlerta;
  titulo: string;
  descripcion: string;
  resolucion: string | null;
  lotesAfectados: string[];
  clientesAfectados: string[];
  cantidadRetirada: number | null;
  cantidadRecuperada: number | null;
  porcentajeRecuperacion: number | null;
  creadaPor: string;
  creador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  resueltaPor: string | null;
  fechaCreacion: Date;
  fechaResolucion: Date | null;
  fechaCierre: Date | null;
}

export interface CreateAlertDTO {
  loteId: string;
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  titulo: string;
  descripcion: string;
}

export interface UpdateAlertDTO {
  estado?: EstadoAlerta;
  resolucion?: string;
  resueltaPor?: string;
}

export interface AlertImpactDTO {
  lotesAfectados: {
    id: string;
    codigo: string;
    producto: string;
    cantidad: number;
    ubicacion: string | null;
  }[];
  clientesAfectados: {
    id: string;
    nombre: string;
    codigo: string;
    cantidadRecibida: number;
    fechaEnvio: Date | null;
  }[];
  stockPendiente: {
    totalLotes: number;
    cantidadTotal: number;
  };
  resumen: {
    totalLotesAfectados: number;
    totalClientesAfectados: number;
    cantidadTotalDistribuida: number;
    cantidadPendienteAlmacen: number;
    porcentajeRecuperable: number;
  };
}

export interface AlertQueryParams {
  page?: number;
  limit?: number;
  estado?: string;
  severidad?: string;
  tipo?: string;
  loteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}