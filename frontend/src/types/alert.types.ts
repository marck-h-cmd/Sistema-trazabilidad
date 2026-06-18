export interface Alert {
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
  tipo: AlertType;
  severidad: AlertSeverity;
  estado: AlertStatus;
  titulo: string;
  descripcion: string;
  resolucion?: string | null;
  lotesAfectados: string[];
  clientesAfectados: string[];
  cantidadRetirada?: number | null;
  cantidadRecuperada?: number | null;
  porcentajeRecuperacion?: number | null;
  creadaPor: string;
  creador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  resueltaPor?: string | null;
  fechaCreacion: string;
  fechaResolucion?: string | null;
  fechaCierre?: string | null;
  notificaciones?: Notification[];
  documentos?: Document[];
  creadoEn: string;
  actualizadoEn?: string;
}

export type AlertType =
  | 'CONTAMINACION'
  | 'CUERPO_EXTRAÑO'
  | 'ETIQUETADO'
  | 'CALIDAD'
  | 'INCUMPLIMIENTO_ESPECIFICACIONES'
  | 'OTRO';

export type AlertSeverity = 'AVISO' | 'CRITICO';

export type AlertStatus = 'ABIERTA' | 'INVESTIGANDO' | 'RESUELTA' | 'CERRADA';

export interface Notification {
  id: string;
  alertaId?: string;
  tipo: string;
  destinatario: string;
  asunto: string;
  mensaje: string;
  enviada: boolean;
  fechaEnvio?: string | null;
  error?: string | null;
}

export interface Document {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'IMAGEN' | 'EXCEL' | 'OTRO';
  url: string;
  tamano: number;
  extension: string;
}

export interface CreateAlertDTO {
  loteId: string;
  tipo: AlertType;
  severidad: AlertSeverity;
  titulo: string;
  descripcion: string;
}

export interface UpdateAlertDTO {
  estado?: AlertStatus;
  resolucion?: string;
  resueltaPor?: string;
}

export interface AlertImpactAnalysis {
  lotesAfectados: {
    id: string;
    codigo: string;
    producto: string;
    cantidad: number;
    ubicacion?: string | null;
  }[];
  clientesAfectados: {
    id: string;
    nombre: string;
    codigo: string;
    cantidadRecibida: number;
    fechaEnvio?: string | null;
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

export interface AlertFilters {
  page?: number;
  limit?: number;
  estado?: string;
  severidad?: string;
  tipo?: string;
  loteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}