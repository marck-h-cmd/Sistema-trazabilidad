'use client';

import * as React from 'react';
import { Loader2, Wheat } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  /** Variantes de carga:
   * - 'spinner': Indicador circular de carga estándar
   * - 'skeleton': Celdas animadas que imitan contenido real
   * - 'overlay': Bloquea la pantalla con fondo difuminado y spinner central
   */
  variant?: 'spinner' | 'skeleton' | 'overlay';
  /** Tipo de esqueleto a mostrar (solo aplica si variant === 'skeleton') */
  skeletonType?: 'card' | 'table' | 'list';
  /** Texto explicativo opcional (ej: "Cargando almacenes...") */
  text?: string;
  /** Número de items a renderizar si se usa skeleton (por defecto 3) */
  count?: number;
  /** Clase CSS adicional para el contenedor principal */
  className?: string;
}

/**
 * Componente LoadingState
 * Proporciona estados de carga refinados con animaciones fluidas y consistentes.
 */
export function LoadingState({
  variant = 'spinner',
  skeletonType = 'list',
  text,
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in dark:bg-black/40">
        <div className="relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/50 shadow-xl border dark:bg-gray-900/50 dark:border-gray-800">
          <div className="relative flex items-center justify-center">
            {/* Logotipo de trigo pulsando en el centro de un spinner */}
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <Wheat className="absolute h-5 w-5 text-primary animate-pulse" />
          </div>
          {text ? (
            <p className="text-sm font-medium text-foreground tracking-tight">
              {text}
            </p>
          ) : (
            <p className="text-sm font-medium text-foreground tracking-tight">
              Cargando sistema...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 w-full animate-fade-in', className)}>
        {text && (
          <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            {text}
          </p>
        )}
        {skeletonType === 'card' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 space-y-4 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {skeletonType === 'table' && (
          <div className="rounded-2xl border overflow-hidden dark:border-gray-800">
            {/* Cabecera falsa */}
            <div className="bg-muted/50 px-6 py-4 flex items-center justify-between dark:bg-gray-900/40">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
            {/* Filas */}
            <div className="divide-y dark:divide-gray-800">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              ))}
            </div>
          </div>
        )}

        {skeletonType === 'list' && (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border dark:border-gray-800"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Spinner por defecto
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center gap-3',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <Wheat className="absolute h-3.5 w-3.5 text-primary animate-pulse" />
      </div>
      {text && (
        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
}
