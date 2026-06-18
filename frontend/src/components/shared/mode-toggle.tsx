'use client';

import * as React from 'react';
import { QrCode, Keyboard, Sparkles } from 'lucide-react';
import { useScannerStore } from '@/stores/scanner.store';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  className?: string;
}

/**
 * Componente ModeToggle
 * Permite alternar el modo global de captura de datos: Escáner QR/Código de Barras vs Manual.
 * Conectado directamente a useScannerStore.
 */
export function ModeToggle({ className }: ModeToggleProps) {
  const { mode, toggleMode } = useScannerStore();

  const isScanMode = mode === 'scan';
  const nextModeText = isScanMode ? 'Manual' : 'Escáner';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isScanMode ? 'default' : 'outline'}
            size="icon"
            onClick={toggleMode}
            className={cn(
              'relative h-10 w-10 rounded-full transition-all duration-300 border-muted-foreground/20 active:scale-95 shadow-sm',
              isScanMode
                ? 'bg-primary text-primary-foreground hover:bg-primary/95 ring-2 ring-primary/20 shadow-md scale-105'
                : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground dark:bg-gray-950 dark:border-gray-800',
              className
            )}
            aria-label={`Cambiar a modo ${nextModeText}`}
          >
            {isScanMode ? (
              <>
                <QrCode className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
              </>
            ) : (
              <Keyboard className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="p-3 max-w-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Modo de Entrada: {isScanMode ? 'Escáner Activo' : 'Manual'}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-normal dark:text-gray-400">
            {isScanMode
              ? 'El sistema espera lecturas de cámara o lector de mano.'
              : 'Escribe los códigos de lote manualmente usando el teclado.'}
          </p>
          <p className="text-[10px] text-primary/80 font-medium pt-1">
            Click para cambiar a Modo {nextModeText}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
