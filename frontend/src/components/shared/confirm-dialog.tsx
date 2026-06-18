'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  /** Indica si el diálogo está abierto (modo controlado) */
  open?: boolean;
  /** Callback ejecutado al cambiar el estado de apertura */
  onOpenChange?: (open: boolean) => void;
  /** Título principal de la alerta de confirmación */
  title: string;
  /** Descripción o advertencia detallada */
  description: string;
  /** Texto del botón para confirmar la acción */
  confirmText?: string;
  /** Alias para confirmText */
  confirmLabel?: string;
  /** Texto del botón para cancelar la acción */
  cancelText?: string;
  /** Callback ejecutado al hacer clic en confirmar */
  onConfirm: () => void | Promise<void>;
  /** Callback opcional ejecutado al cancelar */
  onCancel?: () => void;
  /** Variante del botón de confirmación según el tipo de acción */
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  /** Indica si se está ejecutando la acción (muestra spinner y bloquea inputs) */
  isLoading?: boolean;
  /** Elemento que dispara la apertura del diálogo si es no-controlado */
  trigger?: React.ReactNode;
}

/**
 * Componente ConfirmDialog
 * Modal premium de confirmación adaptado a las normas táctiles y de color del sistema.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLabel,
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
  trigger,
}: ConfirmDialogProps) {
  const finalConfirmText = confirmText || confirmLabel || 'Confirmar';
  const [localLoading, setLocalLoading] = React.useState(false);

  const activeLoading = isLoading || localLoading;

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in ConfirmDialog confirmation:', error);
    } finally {
      setLocalLoading(false);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="max-w-[95vw] sm:max-w-[480px] rounded-2xl animate-fade-in">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={activeLoading}
            className="w-full sm:w-auto h-11 sm:h-10 text-sm font-medium transition-all"
          >
            {cancelText}
          </AlertDialogCancel>
          <button
            onClick={handleConfirm}
            disabled={activeLoading}
            className={cn(
              buttonVariants({ variant }),
              'w-full sm:w-auto h-11 sm:h-10 text-sm font-medium gap-2 shadow-sm transition-all',
              activeLoading && 'opacity-80 pointer-events-none'
            )}
          >
            {activeLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {finalConfirmText}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
