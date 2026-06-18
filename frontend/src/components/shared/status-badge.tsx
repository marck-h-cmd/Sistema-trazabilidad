'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'lot'
  | 'general'
  | 'user'
  | 'alert'
  | 'reception'
  | 'shipment';

interface StatusBadgeProps {
  /** Código de estado interno (ej: 'ACTIVO', 'BLOQUEADO', 'VENCIDO', 'active', 'pending') */
  status: string;
  /** Tipo de entidad para aplicar traducción y estilos específicos */
  type?: StatusType;
  /** Forzar un texto personalizado en lugar de la traducción por defecto */
  customLabel?: string;
  /** Mostrar un punto indicador (dot) al inicio del badge */
  showDot?: boolean;
  /** Clase CSS adicional para personalización */
  className?: string;
}

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
  customStyles?: string; // Para colores que no están en el Badge de shadcn (ej: púrpura para bloqueado)
}

// Configuración y mapeo de estados del lote (LotStatus)
const LOT_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVO: { label: 'Activo', variant: 'success' },
  RESERVADO: { label: 'Reservado', variant: 'info' },
  EN_PRODUCCION: { label: 'En Producción', variant: 'warning' },
  EN_TRANSITO: { label: 'En Tránsito', variant: 'info' },
  ENTREGADO: { label: 'Entregado', variant: 'success' },
  VENCIDO: { label: 'Vencido', variant: 'destructive' },
  BLOQUEADO: {
    label: 'Bloqueado',
    variant: 'outline',
    customStyles: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/50',
  },
  RETIRADO: {
    label: 'Retirado (Recall)',
    variant: 'destructive',
    customStyles: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/50',
  },
  CONSUMIDO: { label: 'Consumido', variant: 'secondary' },
};

// Configuración y mapeo de estados de usuarios (UserStatus / Roles)
const USER_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVO: { label: 'Activo', variant: 'success' },
  INACTIVO: { label: 'Inactivo', variant: 'secondary' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  ADMINISTRADOR: { label: 'Administrador', variant: 'default' },
  OPERARIO: { label: 'Operario', variant: 'info' },
  SUPERVISOR: { label: 'Supervisor', variant: 'warning' },
};

// Configuración y mapeo de estados de alertas (AlertStatus / Severity)
const ALERT_STATUS_MAP: Record<string, StatusConfig> = {
  ALTA: { label: 'Alta', variant: 'destructive' },
  MEDIA: { label: 'Media', variant: 'warning' },
  BAJA: { label: 'Baja', variant: 'info' },
  RESOLVIDA: { label: 'Resuelta', variant: 'success' },
  ACTIVA: { label: 'Activa', variant: 'destructive' },
};

// Configuración y mapeo de estados de recepción (ReceptionStatus)
const RECEPTION_STATUS_MAP: Record<string, StatusConfig> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  EN_PROCESO: { label: 'En Proceso', variant: 'info' },
  COMPLETADO: { label: 'Completado', variant: 'success' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive' },
};

// Configuración y mapeo de estados de envíos/expedición (ShipmentStatus)
const SHIPMENT_STATUS_MAP: Record<string, StatusConfig> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  PREPARADO: { label: 'Preparado', variant: 'info' },
  EN_TRANSITO: { label: 'En Tránsito', variant: 'info' },
  ENTREGADO: { label: 'Entregado', variant: 'success' },
  CANCELADO: { label: 'Cancelado', variant: 'destructive' },
};

// Configuración y mapeo general
const GENERAL_STATUS_MAP: Record<string, StatusConfig> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
  pending: { label: 'Pendiente', variant: 'warning' },
  completed: { label: 'Completado', variant: 'success' },
  success: { label: 'Éxito', variant: 'success' },
  warning: { label: 'Atención', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
  info: { label: 'Información', variant: 'info' },
};

/**
 * Componente StatusBadge
 * Muestra etiquetas de estado con un diseño visual pulido y consistente con las reglas
 * de color y accesibilidad del sistema.
 */
export function StatusBadge({
  status,
  type = 'general',
  customLabel,
  showDot = false,
  className,
}: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  // Seleccionar mapa según el tipo
  let statusMap = GENERAL_STATUS_MAP;
  if (type === 'lot') statusMap = LOT_STATUS_MAP;
  else if (type === 'user') statusMap = USER_STATUS_MAP;
  else if (type === 'alert') statusMap = ALERT_STATUS_MAP;
  else if (type === 'reception') statusMap = RECEPTION_STATUS_MAP;
  else if (type === 'shipment') statusMap = SHIPMENT_STATUS_MAP;

  // Buscar configuración
  const config = statusMap[normalizedStatus] ||
    statusMap[status] || // buscar tal cual (sensible a minúsculas)
    GENERAL_STATUS_MAP[status.toLowerCase()] || {
      label: status,
      variant: 'outline' as const,
    };

  const label = customLabel || config.label;

  // Determinar color de punto (dot)
  let dotColorClass = 'bg-gray-400';
  if (config.variant === 'success') dotColorClass = 'bg-success';
  else if (config.variant === 'warning') dotColorClass = 'bg-warning';
  else if (config.variant === 'destructive') dotColorClass = 'bg-destructive';
  else if (config.variant === 'info') dotColorClass = 'bg-info';
  else if (config.variant === 'default') dotColorClass = 'bg-primary';

  // Si tiene estilos personalizados, los inyectamos
  if (config.customStyles) {
    if (normalizedStatus === 'BLOQUEADO') dotColorClass = 'bg-purple-500';
    else if (normalizedStatus === 'RETIRADO') dotColorClass = 'bg-red-600';
  }

  return (
    <Badge
      variant={config.customStyles ? undefined : config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all duration-200 shadow-sm select-none',
        config.customStyles,
        className
      )}
    >
      {showDot && (
        <span className={cn('relative flex h-2 w-2 rounded-full', dotColorClass)}>
          {/* Pequeña animación de latido para estados críticos */}
          {(normalizedStatus === 'BLOQUEADO' ||
            normalizedStatus === 'RETIRADO' ||
            normalizedStatus === 'VENCIDO' ||
            normalizedStatus === 'ALTA' ||
            normalizedStatus === 'ACTIVA') && (
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotColorClass)}></span>
          )}
        </span>
      )}
      <span>{label}</span>
    </Badge>
  );
}
