'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Factory, 
  Warehouse, 
  Truck, 
  Store,
  ArrowRight,
  MapPin,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface TraceabilityMapProps {
  timeline: any[];
  className?: string;
}

const STEP_ICONS: Record<string, any> = {
  RECEPCION: Package,
  PRODUCCION: Factory,
  MOVIMIENTO: Warehouse,
  EXPEDICION: Truck,
  ALERTA: Package,
};

const STEP_COLORS: Record<string, string> = {
  RECEPCION: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  PRODUCCION: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  MOVIMIENTO: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  EXPEDICION: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  ALERTA: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const STEP_LABELS: Record<string, string> = {
  RECEPCION: 'Recepción',
  PRODUCCION: 'Producción',
  MOVIMIENTO: 'Movimiento',
  EXPEDICION: 'Expedición',
  ALERTA: 'Alerta',
};

export function TraceabilityMap({ timeline, className }: TraceabilityMapProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay movimientos registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('dark:border-gray-800 dark:bg-gray-900', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <MapPin className="h-5 w-5 text-primary" />
          Recorrido del Lote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-muted dark:bg-gray-700" />

          <div className="space-y-0">
            {timeline.map((step, index) => {
              const Icon = STEP_ICONS[step.tipo] || Package;
              const colorClass = STEP_COLORS[step.tipo] || STEP_COLORS.RECEPCION;
              const label = STEP_LABELS[step.tipo] || step.tipo;
              const isFirst = index === 0;
              const isLast = index === timeline.length - 1;

              return (
                <div key={index} className="relative flex gap-4 pb-6">
                  {/* Círculo del paso */}
                  <div className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 flex-shrink-0',
                    colorClass
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs font-semibold', colorClass)}>
                        {label}
                      </Badge>
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        {formatDate(step.fecha, 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm dark:text-gray-200">{step.descripcion}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">
                      {step.usuario || 'Sistema'}
                    </p>

                    {/* Detalles adicionales */}
                    {step.detalles && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {step.detalles.cantidad && (
                          <Badge variant="outline" className="text-xs dark:border-gray-600">
                            {step.detalles.cantidad} {step.detalles.unidad || ''}
                          </Badge>
                        )}
                        {step.detalles.origen && (
                          <Badge variant="outline" className="text-xs dark:border-gray-600">
                            <ArrowRight className="mr-1 h-3 w-3" />
                            {step.detalles.origen}
                          </Badge>
                        )}
                        {step.detalles.destino && (
                          <Badge variant="outline" className="text-xs dark:border-gray-600">
                            <MapPin className="mr-1 h-3 w-3" />
                            {step.detalles.destino}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground dark:text-gray-400">
              {timeline.length} {timeline.length === 1 ? 'evento' : 'eventos'} en total
            </span>
            <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {formatDate(timeline[0]?.fecha, 'dd/MM/yyyy')} → {formatDate(timeline[timeline.length - 1]?.fecha, 'dd/MM/yyyy')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}