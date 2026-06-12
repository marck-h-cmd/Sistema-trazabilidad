import { EstadoExpedicion } from '@prisma/client';

export interface ShipmentDTO {
  id: string;
  codigo: string;
  clienteId: string;
  cliente?: {
    id: string;
    nombre: string;
    codigo: string;
    emailContacto: string;
  };
  estado: EstadoExpedicion;
  empresaTransporte: string | null;
  matriculaVehiculo: string | null;
  nombreConductor: string | null;
  fechaPreparacion: Date | null;
  fechaEnvio: Date | null;
  fechaEntrega: Date | null;
  fechaPrevistaEntrega: Date | null;
  items: ShipmentItemDTO[];
  preparadoPor: string;
  preparador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  observaciones: string | null;
  creadoEn: Date;
}

export interface ShipmentItemDTO {
  id: string;
  loteId: string;
  lote?: {
    id: string;
    codigo: string;
    producto?: {
      id: string;
      nombre: string;
      sku: string;
    };
    fechaCaducidad: Date | null;
  };
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number | null;
  precioTotal: number | null;
  verificado: boolean;
}

export interface CreateShipmentDTO {
  clienteId: string;
  items: {
    loteId: string;
    cantidad: number;
    precioUnitario?: number;
  }[];
  empresaTransporte?: string;
  matriculaVehiculo?: string;
  nombreConductor?: string;
  fechaPrevistaEntrega?: string;
  observaciones?: string;
}

export interface UpdateShipmentDTO {
  estado?: EstadoExpedicion;
  fechaEnvio?: string;
  fechaEntrega?: string;
  observaciones?: string;
}

export interface ShipmentQueryParams {
  page?: number;
  limit?: number;
  clienteId?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  codigo?: string;
}