'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockLevelIndicatorProps {
  /** Cantidad o peso ocupado actualmente */
  current?: number;
  /** Capacidad máxima permitida (si es null o 0 se considera capacidad ilimitada) */
  max?: number | null;
  /** Mostrar detalles textuales (ej: "75% (150/200)") */
  showText?: boolean;
  /** Mostrar un badge de estado (ej: "Óptimo", "Advertencia", "Lleno") */
  showBadge?: boolean;
  /** Unidad de medida a mostrar en el texto (ej: "Kg", "Uds") */
  unit?: string;
  /** Clase CSS adicional */
  className?: string;

  // Product stock compatibility props
  productoId?: string;
  stock?: number;
  stockMinimo?: number;
  stockMaximo?: number;
}

/**
 * Componente StockLevelIndicator
 * Indicador visual del nivel de ocupación de ubicaciones o almacenes
 * con colores de advertencia semánticos y animaciones de progreso fluidas.
 */
export function StockLevelIndicator({
  current,
  max,
  showText = true,
  showBadge = true,
  unit = 'Uds',
  className,

  productoId,
  stock,
  stockMinimo,
  stockMaximo,
}: StockLevelIndicatorProps) {
  const finalCurrent = current !== undefined ? current : (stock !== undefined ? stock : 0);
  const finalMax = max !== undefined ? (max || 0) : (stockMaximo !== undefined ? (stockMaximo || 0) : 0);

  const percentage = React.useMemo(() => {
    if (!finalMax || finalMax <= 0) return 0;
    return Math.min(Math.max((finalCurrent / finalMax) * 100, 0), 100);
  }, [finalCurrent, finalMax]);

  const levelColor = React.useMemo(() => {
    if (stock !== undefined && stockMinimo !== undefined && stock < stockMinimo) return 'text-destructive';
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  }, [percentage, stock, stockMinimo]);

  const progressColorClass = React.useMemo(() => {
    if (stock !== undefined && stockMinimo !== undefined && stock < stockMinimo) return 'bg-destructive';
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  }, [percentage, stock, stockMinimo]);

  const badgeConfig = React.useMemo(() => {
    if (stock !== undefined && stockMinimo !== undefined && stock < stockMinimo) {
      return { label: 'Stock Bajo', variant: 'destructive' as const };
    }
    if (!finalMax || finalMax <= 0) {
      return { label: 'Ilimitado', variant: 'info' as const };
    }
    if (percentage >= 90) {
      return { label: 'Crítico / Lleno', variant: 'destructive' as const };
    }
    if (percentage >= 75) {
      return { label: 'Ocupación Alta', variant: 'warning' as const };
    }
    return { label: 'Espacio Disponible', variant: 'success' as const };
  }, [percentage, finalMax, stock, stockMinimo]);

  return (
    <div className={cn('space-y-2 w-full', className)}>
      <div className="flex items-center justify-between text-xs font-semibold">
        {showText && (
          <div className="text-muted-foreground dark:text-gray-400">
            <span>Ocupación: </span>
            <span className={cn('font-bold', levelColor)}>
              {finalMax && finalMax > 0 ? `${percentage.toFixed(0)}%` : `${finalCurrent.toLocaleString()} ${unit}`}
            </span>
            {finalMax && finalMax > 0 && (
              <span className="text-muted-foreground/85 font-normal">
                {' '}
                ({finalCurrent.toLocaleString()} / {finalMax.toLocaleString()} {unit})
              </span>
            )}
          </div>
        )}
        {showBadge && (
          <Badge
            variant={badgeConfig.variant}
            className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider"
          >
            {badgeConfig.label}
          </Badge>
        )}
      </div>

      {finalMax && finalMax > 0 && (
        <Progress
          value={percentage}
          indicatorClassName={progressColorClass}
          className="h-2 rounded-full"
        />
      )}
    </div>
  );
}
