'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LotStatusBadge } from './lot-status-badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  Hash,
  Barcode,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatNumber } from '@/lib/formatters';
import type { Lot } from '@/types/lot.types';

interface LotDetailProps {
  lot: Lot;
  className?: string;
}

export function LotDetail({ lot, className }: LotDetailProps) {
  const daysUntilExpiry = lot.fechaCaducidad
    ? Math.ceil((new Date(lot.fechaCaducidad).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const statusInfo = {
    ACTIVO: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    VENCIDO: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    BLOQUEADO: { icon: AlertTriangle, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    RETIRADO: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    CONSUMIDO: { icon: CheckCircle2, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20' },
    ENTREGADO: { icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    RESERVADO: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    EN_PRODUCCION: { icon: Package, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    EN_TRANSITO: { icon: Clock, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  };

  const currentStatus = statusInfo[lot.estado] || statusInfo.ACTIVO;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Encabezado */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', currentStatus.bg)}>
                <StatusIcon className={cn('h-7 w-7', currentStatus.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-wider dark:text-gray-100">
                    {lot.codigo}
                  </span>
                  <LotStatusBadge status={lot.estado} size="md" />
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {lot.producto?.nombre || 'Producto'} • SKU: {lot.producto?.sku || 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold dark:text-gray-100">{formatNumber(lot.cantidad)}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                de {formatNumber(lot.cantidadInicial)} {lot.unidadMedida}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalles */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Fechas */}
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
              <Calendar className="h-4 w-4 text-primary" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lot.fechaProduccion && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Producción</span>
                <span className="text-sm font-medium dark:text-gray-200">{formatDate(lot.fechaProduccion)}</span>
              </div>
            )}
            {lot.fechaRecepcion && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Recepción</span>
                <span className="text-sm font-medium dark:text-gray-200">{formatDateTime(lot.fechaRecepcion)}</span>
              </div>
            )}
            {lot.fechaEnvasado && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Envasado</span>
                <span className="text-sm font-medium dark:text-gray-200">{formatDate(lot.fechaEnvasado)}</span>
              </div>
            )}
            {lot.fechaCaducidad && (
              <>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground dark:text-gray-400">Caducidad</span>
                  <span className={cn(
                    'text-sm font-semibold',
                    daysUntilExpiry !== null && daysUntilExpiry < 0
                      ? 'text-red-600 dark:text-red-400'
                      : daysUntilExpiry !== null && daysUntilExpiry <= 7
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'dark:text-gray-200'
                  )}>
                    {formatDate(lot.fechaCaducidad)}
                    {daysUntilExpiry !== null && (
                      <span className="ml-2 text-xs">
                        ({daysUntilExpiry < 0
                          ? `Vencido hace ${Math.abs(daysUntilExpiry)}d`
                          : `${daysUntilExpiry}d restantes`})
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
              <Package className="h-4 w-4 text-primary" />
              Información
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lot.ubicacion && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Ubicación</span>
                <span className="text-sm font-mono font-medium dark:text-gray-200">
                  {lot.ubicacion.codigoCompleto}
                </span>
              </div>
            )}
            {lot.almacen && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Almacén</span>
                <span className="text-sm font-medium dark:text-gray-200">{lot.almacen.nombre}</span>
              </div>
            )}
            {lot.numeroLoteProveedor && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Lote Proveedor</span>
                <span className="text-sm font-mono font-medium dark:text-gray-200">{lot.numeroLoteProveedor}</span>
              </div>
            )}
            {lot.lotePadreId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Lote Padre</span>
                <span className="text-sm font-mono font-medium text-primary">{lot.lotePadre?.codigo || lot.lotePadreId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Observaciones */}
      {lot.observaciones && (
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {lot.observaciones}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}