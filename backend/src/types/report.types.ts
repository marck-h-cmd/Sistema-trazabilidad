export interface ReportConfig {
  tipo: 'STOCK' | 'CADUCIDADES' | 'TRAZABILIDAD' | 'MOVIMIENTOS' | 'EXPEDICIONES' | 'AUDITORIA' | 'CRISIS' | 'RECEPCIONES';
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

export interface StockReportDTO {
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

export interface ExpiryReportDTO {
  lotes: {
    codigo: string;
    producto: string;
    cantidad: number;
    fechaCaducidad: string;
    diasRestantes: number;
    ubicacion: string;
    estado: string;
    alerta: 'rojo' | 'amarillo' | 'verde';
  }[];
  resumen: {
    totalLotes: number;
    vencidos: number;
    proximos7Dias: number;
    proximos15Dias: number;
    proximos30Dias: number;
  };
}

export interface TraceabilityReportDTO {
  lote: {
    codigo: string;
    producto: string;
    fechaProduccion: string;
    fechaCaducidad: string;
    cantidad: number;
    estado: string;
  };
  trazabilidadHaciaAtras: {
    materiaPrima: string;
    loteMP: string;
    proveedor: string;
    fechaRecepcion: string;
    cantidad: number;
  }[];
  trazabilidadHaciaAdelante: {
    cliente: string;
    codigoExpedicion: string;
    fechaEnvio: string;
    cantidad: number;
    estado: string;
  }[];
  movimientos: {
    fecha: string;
    tipo: string;
    origen: string;
    destino: string;
    cantidad: number;
    usuario: string;
  }[];
}

export interface ShipmentReportDTO {
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

export interface AuditReportDTO {
  simulacros: {
    id: string;
    lote: string;
    fecha: string;
    tiempoTotal: number;
    tasaRecuperacion: number;
    aprobado: boolean;
  }[];
  resumen: {
    totalSimulacros: number;
    aprobados: number;
    tiempoPromedio: number;
    tasaRecuperacionPromedio: number;
  };
}