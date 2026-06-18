'use client';

import * as React from 'react';
import { AlertStatus, AlertSeverity } from '@/types/alert.types';
import { StatusBadge } from '@/components/shared/status-badge';
interface AlertStatusBadgeProps {
  value?: AlertStatus | AlertSeverity | string;
  /** Alias para value */
  status?: AlertStatus | AlertSeverity | string;
  /** Tipo de badge a mostrar: 'status' (estado de resolución) o 'severity' (criticidad) */
  type?: 'status' | 'severity';
  /** Mostrar punto indicador animado */
  showDot?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Tamaño opcional del badge */
  size?: string;
}

/**
 * Componente AlertStatusBadge
 * Badge especializado para mostrar los estados y niveles de gravedad de alertas de calidad y trazabilidad.
 */
export function AlertStatusBadge({
  value,
  status,
  type = 'status',
  showDot = true,
  className,
}: AlertStatusBadgeProps) {
  const finalValue = value || status || '';

  // Mapeo local para adaptar la nomenclatura de alertas a la configuración de StatusBadge
  if (type === 'severity') {
    const severityMap: Record<string, string> = {
      CRITICO: 'ALTA',
      AVISO: 'MEDIA',
    };
    const mappedValue = severityMap[String(finalValue).toUpperCase()] || finalValue;

    return (
      <StatusBadge
        status={mappedValue}
        type="alert"
        showDot={showDot}
        className={className}
      />
    );
  }

  // Mapeos para el estado de la alerta (ABIERTA, INVESTIGANDO, RESUELTA, CERRADA)
  const statusMap: Record<string, { status: string; type: 'alert' | 'general' | 'reception' }> = {
    ABIERTA: { status: 'ACTIVA', type: 'alert' },
    INVESTIGANDO: { status: 'EN_PROCESO', type: 'reception' },
    RESUELTA: { status: 'RESOLVIDA', type: 'alert' },
    CERRADA: { status: 'INACTIVO', type: 'general' },
  };

  const config = statusMap[String(finalValue).toUpperCase()] || { status: String(finalValue), type: 'general' };

  return (
    <StatusBadge
      status={config.status}
      type={config.type}
      showDot={showDot}
      className={className}
    />
  );
}
