import { EventEmitter } from 'events';
import { logger } from '@utils/logger';

class AppEventEmitter extends EventEmitter {
  private static instance: AppEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(50);
  }

  public static getInstance(): AppEventEmitter {
    if (!AppEventEmitter.instance) {
      AppEventEmitter.instance = new AppEventEmitter();
    }
    return AppEventEmitter.instance;
  }

  public emitEvent(event: string, data: any): void {
    logger.debug(`Evento emitido: ${event}`, { data: typeof data === 'object' ? JSON.stringify(data).substring(0, 200) : data });
    this.emit(event, data);
  }
}

export const appEvents = AppEventEmitter.getInstance();

export const EVENT_TYPES = {
  // Lotes
  LOT_CREATED: 'lot:created',
  LOT_UPDATED: 'lot:updated',
  LOT_STATUS_CHANGED: 'lot:status-changed',
  LOT_EXPIRED: 'lot:expired',
  LOT_BLOCKED: 'lot:blocked',
  LOT_UNBLOCKED: 'lot:unblocked',
  LOT_MOVED: 'lot:moved',
  LOT_CONSUMED: 'lot:consumed',

  // Recepción
  RECEPTION_CREATED: 'reception:created',
  RECEPTION_COMPLETED: 'reception:completed',
  RECEPTION_BARCODE_SCANNED: 'reception:barcode-scanned',

  // Producción
  PRODUCTION_STARTED: 'production:started',
  PRODUCTION_COMPLETED: 'production:completed',
  PRODUCTION_LABELS_PRINTED: 'production:labels-printed',

  // Almacén
  INVENTORY_MOVEMENT: 'inventory:movement',
  STOCK_LOW: 'stock:low',
  STOCK_OUT: 'stock:out',
  FIFO_VIOLATION: 'fifo:violation',

  // Expedición
  SHIPMENT_CREATED: 'shipment:created',
  SHIPMENT_DISPATCHED: 'shipment:dispatched',
  SHIPMENT_DELIVERED: 'shipment:delivered',
  SHIPMENT_CANCELLED: 'shipment:cancelled',
  SHIPMENT_BLOCKED_LOT: 'shipment:blocked-lot',

  // Alertas
  ALERT_CREATED: 'alert:created',
  ALERT_ACTIVATED: 'alert:activated',
  ALERT_RESOLVED: 'alert:resolved',
  ALERT_CLOSED: 'alert:closed',
  CRISIS_DECLARED: 'crisis:declared',

  // Trazabilidad
  TRACEABILITY_QUERY: 'traceability:query',
  PUBLIC_TRACEABILITY_QUERY: 'traceability:public-query',

  // Auditoría
  AUDIT_ACTION: 'audit:action',
  SIMULATION_STARTED: 'simulation:started',
  SIMULATION_COMPLETED: 'simulation:completed',

  // Sistema
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  EMAIL_SENT: 'email:sent',
  PDF_GENERATED: 'pdf:generated',
} as const;