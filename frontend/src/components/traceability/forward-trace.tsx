'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { 
  Store, 
  Truck, 
  Calendar,
  Hash,
  MapPin,
  User,
  Phone,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface ForwardTraceProps {
  data: any[];
  className?: string;
}

export function ForwardTrace({ data, className }: ForwardTraceProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Store className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No se ha distribuido a ningún cliente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <Store className="h-5 w-5 text-blue-500" />
          Clientes que Recibieron el Lote
          <Badge variant="outline" className="ml-auto dark:border-gray-600">
            {data.length} {data.length === 1 ? 'cliente' : 'clientes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            {index > 0 && <Separator className="my-4 dark:bg-gray-700" />}
            <div className="space-y-3">
              {/* Cliente */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold dark:text-gray-200">
                    {item.cliente?.nombre || 'Cliente'}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    {item.cliente?.tipo || 'N/A'} • Código: {item.cliente?.codigo || 'N/A'}
                  </p>
                </div>
                <Badge variant="success" className="text-xs">
                  {item.cantidadEnviada || 0} {item.unidadMedida || ''}
                </Badge>
              </div>

              {/* Expedición */}
              <div className="ml-13 grid gap-2 pl-4">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <span className="text-muted-foreground dark:text-gray-400">Expedición:</span>
                  <span className="font-mono font-semibold dark:text-gray-200">
                    {item.expedicion?.codigo || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <span className="text-muted-foreground dark:text-gray-400">Fecha envío:</span>
                  <span className="dark:text-gray-300">
                    {item.expedicion?.fechaEnvio ? formatDate(item.expedicion.fechaEnvio) : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge status={item.expedicion?.estado || 'N/A'} />
                </div>
              </div>

              {/* Fecha prevista */}
              {item.fechaPrevistaEntrega && (
                <div className="ml-13 flex items-center gap-2 rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
                  <Truck className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <div>
                    <p className="text-sm dark:text-gray-200">
                      Entrega prevista: {formatDate(item.fechaPrevistaEntrega)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}