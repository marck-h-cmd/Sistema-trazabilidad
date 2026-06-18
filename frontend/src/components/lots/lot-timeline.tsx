'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Factory, 
  Warehouse, 
  Truck, 
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatters';

interface LotTimelineProps {
  timeline: any[];
  className?: string;
}

const EVENT_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  RECEPCION: {
    icon: Package,
    label: 'Recepción',
    color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  PRODUCCION: {
    icon: Factory,
    label: 'Producción',
    color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
  MOVIMIENTO: {
    icon: Warehouse,
    label: 'Movimiento',
    color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  EXPEDICION: {
    icon: Truck,
    label: 'Expedición',
    color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  },
  ALERTA: {
    icon: AlertTriangle,
    label: 'Alerta',
    color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
};

export function LotTimeline({ timeline, className }: LotTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sin eventos registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('dark:border-gray-800 dark:bg-gray-900', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Clock className="h-4 w-4 text-primary" />
          Línea de Tiempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-muted dark:bg-gray-700" />

          <div className="space-y-0">
            {timeline.map((event, index) => {
              const config = EVENT_CONFIG[event.tipo] || EVENT_CONFIG.MOVIMIENTO;
              const Icon = config.icon;
              const isLast = index === timeline.length - 1;

              return (
                <div key={index} className={cn('relative flex gap-4', !isLast && 'pb-5')}>
                  <div className={cn(
                    'relative z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 flex-shrink-0',
                    config.color
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs', config.color)}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        {formatDateTime(event.fecha)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm dark:text-gray-200">
                      {event.descripcion || 'Sin descripción'}
                    </p>
                    {event.usuario && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-500">
                        <User className="h-3 w-3" />
                        {event.usuario}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}