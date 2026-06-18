'use client';

import * as React from 'react';
import Link from 'next/link';
import { Alert } from '@/types/alert.types';
import { AlertStatusBadge } from './alert-status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  /** Objeto de alerta conteniendo la información a renderizar */
  alert: Alert;
  /** Acción opcional ejecutada al hacer clic en resolver directamente */
  onResolveClick?: (alert: Alert) => void;
  /** Callback opcional ejecutado al hacer clic en la tarjeta */
  onClick?: () => void;
  /** Clase CSS adicional para el contenedor de la tarjeta */
  className?: string;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  CONTAMINACION: 'Contaminación Alimentaria',
  'CUERPO_EXTRAÑO': 'Cuerpo Extraño',
  ETIQUETADO: 'Error de Etiquetado',
  CALIDAD: 'Defecto de Calidad',
  INCUMPLIMIENTO_ESPECIFICACIONES: 'Incumplimiento de Ficha Técnica',
  OTRO: 'Otro Incidente',
};

/**
 * Componente AlertCard
 * Tarjeta premium para alertas sanitarias y de calidad con bordes semánticos coloreados y
 * diseño optimizado para dispositivos móviles y tablets.
 */
export function AlertCard({ alert, onResolveClick, onClick, className }: AlertCardProps) {
  const isCritical = alert.severidad === 'CRITICO';
  const typeLabel = ALERT_TYPE_LABELS[alert.tipo] || alert.tipo;

  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(alert.fechaCreacion), "dd 'de' MMMM, yyyy - HH:mm", {
        locale: es,
      });
    } catch {
      return alert.fechaCreacion;
    }
  }, [alert.fechaCreacion]);

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group overflow-hidden border transition-all duration-300 hover:shadow-md active:scale-[0.99] dark:bg-gray-900/40 dark:border-gray-800',
        onClick && 'cursor-pointer',
        isCritical
          ? 'border-l-4 border-l-destructive border-destructive/20 hover:border-destructive/40 bg-red-50/10 dark:bg-red-950/5'
          : 'border-l-4 border-l-warning border-warning/20 hover:border-warning/40 bg-amber-50/10 dark:bg-amber-950/5',
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Cabecera: Icono, Título y Badges */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  isCritical
                    ? 'bg-destructive/10 text-destructive dark:bg-red-950/30'
                    : 'bg-warning/10 text-warning dark:bg-amber-950/30'
                )}
              >
                {isCritical ? (
                  <ShieldAlert className="h-5 w-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {alert.titulo}
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5 dark:text-gray-400">
                  {alert.codigo} • <span className="font-semibold text-primary">{typeLabel}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-1.5 items-end sm:items-center shrink-0">
              <AlertStatusBadge value={alert.severidad} type="severity" />
              <AlertStatusBadge value={alert.estado} type="status" />
            </div>
          </div>

          {/* Cuerpo: Descripción de la alerta */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed dark:text-gray-400">
            {alert.descripcion}
          </p>

          {/* Detalles del lote e impacto */}
          <div className="rounded-xl bg-muted/50 p-3 flex flex-wrap items-center justify-between gap-3 text-xs dark:bg-gray-800/30">
            <div className="space-y-1">
              <span className="text-muted-foreground block dark:text-gray-400">Lote Afectado:</span>
              <span className="font-mono font-bold text-foreground bg-white/80 dark:bg-gray-950/60 px-1.5 py-0.5 rounded border border-muted-foreground/10">
                {alert.lote?.codigo || alert.loteId}
              </span>
            </div>
            <div className="space-y-1 text-right sm:text-left">
              <span className="text-muted-foreground block dark:text-gray-400">Producto:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px] block">
                {alert.lote?.producto?.nombre || 'Producto desconocido'}
              </span>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-muted-foreground block dark:text-gray-400">Impacto Estimado:</span>
              <span className="font-semibold text-destructive dark:text-red-400">
                {alert.lotesAfectados?.length || 0} lotes • {alert.clientesAfectados?.length || 0} clientes
              </span>
            </div>
          </div>

          <hr className="border-muted-foreground/10 dark:border-gray-800" />

          {/* Pie de Tarjeta: Metadatos y Acciones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
              {alert.creador && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Reportado por: {alert.creador.nombre} {alert.creador.apellido}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {alert.estado !== 'RESUELTA' && alert.estado !== 'CERRADA' && onResolveClick && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onResolveClick(alert);
                  }}
                  className="text-xs font-semibold text-success hover:underline px-2.5 py-1.5 rounded-lg hover:bg-success/10 transition-colors"
                >
                  Resolver Alerta
                </button>
              )}
              <Link
                href={`/alertas/${alert.id}`}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary px-3 text-xs font-semibold hover:bg-primary/20 active:scale-95 transition-all"
              >
                Analizar Impacto
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
