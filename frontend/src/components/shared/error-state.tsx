'use client';

import * as React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** Título principal del error */
  title?: string;
  /** Mensaje o descripción descriptiva del problema */
  message: string;
  /** Callback opcional para reintentar la acción fallida */
  onRetry?: () => void;
  /** Texto personalizado para el botón de reintento */
  retryText?: string;
  /** Clase CSS adicional para personalizar el contenedor principal */
  className?: string;
  /** Icono personalizado a mostrar en lugar del icono de alerta por defecto */
  icon?: React.ReactNode;
}

/**
 * Componente ErrorState
 * Muestra una tarjeta informativa y accesible cuando se produce un error en el sistema,
 * de acuerdo con los estándares visuales de alto contraste.
 */
export function ErrorState({
  title = 'Ha ocurrido un error',
  message,
  onRetry,
  retryText = 'Reintentar',
  className,
  icon,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center border border-red-200/50 bg-red-50/30 rounded-2xl max-w-md mx-auto my-8 animate-fade-in dark:border-red-900/30 dark:bg-red-950/10',
        className
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-red-900/20 dark:text-red-400">
        {icon || <AlertCircle className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed dark:text-gray-400">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="lg"
          className="mt-6 gap-2 w-full sm:w-auto h-11 border-destructive/30 text-destructive hover:bg-destructive/10 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <RotateCcw className="h-4 w-4" />
          {retryText}
        </Button>
      )}
    </div>
  );
}
