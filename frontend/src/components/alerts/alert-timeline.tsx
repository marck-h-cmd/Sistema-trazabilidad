'use client';

import * as React from 'react';
import { Alert } from '@/types/alert.types';
import { Calendar, User, CheckCircle2, ClipboardList, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AlertTimelineProps {
  /** Alerta de la cual se va a renderizar la cronología de eventos */
  alert: Alert;
  /** Clase CSS adicional */
  className?: string;
}

interface TimelineEvent {
  title: string;
  description: React.ReactNode;
  date: string;
  icon: React.ReactNode;
  colorClass: string;
  isActive: boolean;
}

/**
 * Componente AlertTimeline
 * Muestra cronológicamente la historia de vida del incidente, desde su reporte inicial
 * hasta la investigación y resolución definitiva.
 */
export function AlertTimeline({ alert, className }: AlertTimelineProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), "dd MMM yyyy - HH:mm'h'", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const events = React.useMemo(() => {
    const timelineEvents: TimelineEvent[] = [];

    // 1. Reporte Inicial (Siempre existe)
    timelineEvents.push({
      title: 'Incidente Reportado',
      description: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Se generó la alerta por posible <span className="text-primary font-semibold">{alert.titulo.toLowerCase()}</span>.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
            <User className="h-3 w-3" />
            <span>Por: {alert.creador?.nombre || 'Operario'} {alert.creador?.apellido || ''}</span>
          </div>
        </div>
      ),
      date: formatDate(alert.fechaCreacion),
      icon: <AlertCircle className="h-4 w-4" />,
      colorClass: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-red-950/40 dark:text-red-400',
      isActive: true,
    });

    // 2. Proceso de Investigación (Si está en INVESTIGANDO, RESUELTA o CERRADA)
    const isInInvestigation = alert.estado === 'INVESTIGANDO' || alert.estado === 'RESUELTA' || alert.estado === 'CERRADA';
    timelineEvents.push({
      title: 'Investigación Iniciada',
      description: (
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Se analizaron las materias primas asociadas al lote {alert.lote?.codigo || alert.loteId} y se bloquearon preventivamente los lotes hijos en el almacén.
        </p>
      ),
      date: isInInvestigation ? formatDate(alert.actualizadoEn || alert.fechaCreacion) : 'Pendiente de inicio',
      icon: <ClipboardList className="h-4 w-4" />,
      colorClass: isInInvestigation
        ? 'bg-info/10 text-info border-info/20 dark:bg-blue-950/40 dark:text-blue-400'
        : 'bg-muted text-muted-foreground border-muted-foreground/10 dark:bg-gray-800 dark:text-gray-500',
      isActive: isInInvestigation,
    });

    // 3. Documentación o Albaranes adjuntos (Opcional si tiene documentos)
    if (alert.documentos && alert.documentos.length > 0) {
      timelineEvents.push({
        title: 'Documentación Adjunta',
        description: (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Se anexaron reportes de laboratorio o especificaciones técnicas del proveedor.
            </p>
            <div className="flex flex-col gap-1 pt-1">
              {alert.documentos.map((doc) => (
                <div key={doc.id} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{doc.nombre} ({(doc.tamano / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        ),
        date: formatDate(alert.actualizadoEn),
        icon: <FileText className="h-4 w-4" />,
        colorClass: 'bg-primary/10 text-primary border-primary/20 dark:bg-orange-950/40 dark:text-orange-400',
        isActive: true,
      });
    }

    // 4. Resolución (Si está RESUELTA o CERRADA)
    const isResolved = alert.estado === 'RESUELTA' || alert.estado === 'CERRADA';
    timelineEvents.push({
      title: 'Resolución de Alerta',
      description: (
        <div className="space-y-1.5">
          {isResolved ? (
            <>
              <p className="text-sm font-medium text-foreground">
                Resolución aprobada: <span className="text-success font-semibold">{alert.resolucion || 'Concluido sin observaciones'}</span>.
              </p>
              {alert.cantidadRetirada !== undefined && alert.cantidadRetirada !== null && (
                <div className="text-xs text-muted-foreground dark:text-gray-400 space-y-0.5">
                  <p>Cantidad de producto retirada: <span className="font-bold text-foreground">{alert.cantidadRetirada} unidades</span></p>
                  {alert.cantidadRecuperada !== undefined && alert.cantidadRecuperada !== null && (
                    <p>Cantidad recuperada de clientes: <span className="font-bold text-success">{alert.cantidadRecuperada} unidades</span> ({alert.porcentajeRecuperacion?.toFixed(1)}%)</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Pendiente de determinar plan de acción correctivo / devolución a proveedor.
            </p>
          )}
        </div>
      ),
      date: isResolved ? formatDate(alert.fechaResolucion) : 'Pendiente de resolución',
      icon: <CheckCircle2 className="h-4 w-4" />,
      colorClass: isResolved
        ? 'bg-success/10 text-success border-success/20 dark:bg-green-950/40 dark:text-green-400'
        : 'bg-muted text-muted-foreground border-muted-foreground/10 dark:bg-gray-800 dark:text-gray-500',
      isActive: isResolved,
    });

    return timelineEvents;
  }, [alert]);

  return (
    <div className={cn('relative pl-6 border-l border-muted-foreground/20 space-y-8 dark:border-gray-800', className)}>
      {events.map((event, index) => (
        <div key={index} className="relative group">
          {/* Nodo circular de la línea de tiempo */}
          <div
            className={cn(
              'absolute -left-[37px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border bg-background transition-transform duration-300 group-hover:scale-110 shadow-sm dark:bg-gray-950',
              event.colorClass
            )}
          >
            {event.icon}
          </div>

          {/* Información del evento */}
          <div className="space-y-1 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className={cn('text-sm font-bold tracking-tight', event.isActive ? 'text-foreground' : 'text-muted-foreground dark:text-gray-500')}>
                {event.title}
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
            </div>
            <div className="pt-1">{event.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
