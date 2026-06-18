export interface Shipment {
  id: string;
  codigo: string;
  clienteId: string;
  cliente?: {
    id: string;
    nombre: string;
    codigo: string;
    emailContacto?: string;
  };
  estado: ShipmentStatus;
  empresaTransporte?: string | null;
  matriculaVehiculo?: string | null;
  nombreConductor?: string | null;
  fechaPreparacion?: string | null;
  fechaEnvio?: string | null;
  fechaEntrega?: string | null;
  fechaPrevistaEntrega?: string | null;
  items?: ShipmentItem[];
  documentos?: Document[];
  preparadoPor: string;
  preparador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  observaciones?: string | null;
  creadoEn: string;
  actualizadoEn?: string;
}

export type ShipmentStatus = 'PREPARANDO' | 'EN_TRANSITO' | 'ENTREGADO' | 'CANCELADO' | 'DEVUELTO';

export interface ShipmentItem {
  id: string;
  expedicionId?: string;
  loteId: string;
  lote?: {
    id: string;
    codigo: string;
    producto?: {
      id: string;
      nombre: string;
    };
    fechaCaducidad?: string | null;
  };
  cantidad: number;
  unidadMedida: string;
  precioUnitario?: number | null;
  precioTotal?: number | null;
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
  estado?: ShipmentStatus;
  observaciones?: string;
}

export interface ShipmentFilters {
  page?: number;
  limit?: number;
  clienteId?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  codigo?: string;
}