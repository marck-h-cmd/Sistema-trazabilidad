'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LotStatusBadge } from './lot-status-badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Clock,
  Hash,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatNumber } from '@/lib/formatters';
import { useRouter } from 'next/navigation';
import type { Lot } from '@/types/lot.types';

interface LotCardProps {
  lot: Lot;
  onClick?: () => void;
  className?: string;
  showActions?: boolean;
}

export function LotCard({ lot, onClick, className, showActions = true }: LotCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/trazabilidad/${lot.codigo}`);
    }
  };

  const daysUntilExpiry = lot.fechaCaducidad
    ? Math.ceil((new Date(lot.fechaCaducidad).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-lg font-bold tracking-wider text-primary dark:text-primary">
                {lot.codigo}
              </span>
              <LotStatusBadge status={lot.estado} size="sm" />
            </div>
            <p className="text-sm font-medium dark:text-gray-200 truncate">
              {lot.producto?.nombre || 'Producto'}
            </p>
            <p className="text-xs text-muted-foreground dark:text-gray-500">
              SKU: {lot.producto?.sku || 'N/A'}
            </p>
          </div>

          {/* Cantidad */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold dark:text-gray-100">
              {formatNumber(lot.cantidad)}
            </p>
            <p className="text-xs text-muted-foreground dark:text-gray-500">
              {lot.unidadMedida}
            </p>
          </div>
        </div>

        {/* Detalles */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {lot.fechaProduccion && (
            <div className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Prod: {formatDate(lot.fechaProduccion)}</span>
            </div>
          )}
          {lot.fechaCaducidad && (
            <div className={cn(
              'flex items-center gap-1.5',
              daysUntilExpiry !== null && daysUntilExpiry < 0 ? 'text-red-600 dark:text-red-400' :
              daysUntilExpiry !== null && daysUntilExpiry <= 7 ? 'text-amber-600 dark:text-amber-400' :
              'text-muted-foreground dark:text-gray-400'
            )}>
              <Clock className="h-3.5 w-3.5" />
              <span>
                {daysUntilExpiry !== null && daysUntilExpiry < 0
                  ? `Vencido hace ${Math.abs(daysUntilExpiry)}d`
                  : daysUntilExpiry !== null
                  ? `Vence en ${daysUntilExpiry}d`
                  : formatDate(lot.fechaCaducidad)}
              </span>
            </div>
          )}
          {lot.ubicacion?.codigoCompleto && (
            <div className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{lot.ubicacion.codigoCompleto}</span>
            </div>
          )}
          {lot.numeroLoteProveedor && (
            <div className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400">
              <Hash className="h-3.5 w-3.5" />
              <span className="truncate">{lot.numeroLoteProveedor}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="mt-3 flex items-center justify-between border-t pt-3 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/trazabilidad/${lot.codigo}`);
              }}
            >
              <QrCode className="h-3.5 w-3.5" />
              Trazabilidad
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}