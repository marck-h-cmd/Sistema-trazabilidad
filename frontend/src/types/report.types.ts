export interface ReportConfig {
  tipo: ReportType;
  formato: 'pdf' | 'excel' | 'csv';
  fechaInicio?: string;
  fechaFin?: string;
  productoId?: string;
  proveedorId?: string;
  clienteId?: string;
  almacenId?: string;
  estado?: string;
  agruparPor?: string;
}

export type ReportType =
  | 'STOCK'
  | 'CADUCIDADES'
  | 'TRAZABILIDAD'
  | 'MOVIMIENTOS'
  | 'EXPEDICIONES'
  | 'AUDITORIA'
  | 'CRISIS'
  | 'RECEPCIONES';

export interface StockReportItem {
  productoId: string;
  producto: string;
  sku: string;
  categoria: string;
  lotes: {
    codigo: string;
    cantidad: number;
    unidad: string;
    fechaCaducidad: string;
    ubicacion: string;
    estado: string;
    diasRestantes: number;
  }[];
  cantidadTotal: number;
  unidad: string;
}

export interface ExpiryReportItem {
  codigo: string;
  producto: string;
  cantidad: number;
  fechaCaducidad: string;
  diasRestantes: number;
  ubicacion: string;
  estado: string;
  alerta: 'rojo' | 'amarillo' | 'verde';
}

export interface ExpiryReport {
  lotes: ExpiryReportItem[];
  resumen: {
    totalLotes: number;
    vencidos: number;
    proximos7Dias: number;
    proximos15Dias: number;
    proximos30Dias: number;
  };
}

export interface ShipmentReport {
  expediciones: {
    codigo: string;
    cliente: string;
    fechaEnvio: string;
    estado: string;
    cantidadItems: number;
    cantidadTotal: number;
    transportista: string;
  }[];
  resumen: {
    totalExpediciones: number;
    totalEntregadas: number;
    totalEnTransito: number;
    totalCanceladas: number;
  };
}

export interface ReportSchedule {
  id: string;
  nombre: string;
  tipo: string;
  frecuencia: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL';
  parametros: Record<string, any>;
  destinatarios: string[];
  activo: boolean;
  ultimoEnvio?: string | null;
  proximoEnvio: string;
}

export interface DashboardKPIs {
  totalLotesActivos: number;
  recepcionesHoy: number;
  produccionesHoy: number;
  expedicionesHoy: number;
  alertasActivas: number;
  lotesPorVencer: number;
  lotesVencidos: number;
  stockPorCategoria: {
    categoria: string;
    cantidad: number;
  }[];
}

export interface RecentActivity {
  tipo: string;
  descripcion: string;
  codigo: string;
  usuario: string;
  fecha: string;
}