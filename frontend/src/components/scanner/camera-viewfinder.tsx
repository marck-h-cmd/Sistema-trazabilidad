'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CameraViewfinderProps {
  isActive: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function CameraViewfinder({ isActive, isLoading, children, className }: CameraViewfinderProps) {
  return (
    <div className={cn(
      'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black',
      !isActive && 'bg-gray-900',
      className
    )}>
      {/* Fondo cuando no está activo */}
      {!isActive && !isLoading && (
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">Cámara inactiva</p>
          <p className="text-xs">Presione "Escanear" para activar</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Iniciando cámara...</p>
        </div>
      )}

      {/* Contenido (cámara activa) */}
      {isActive && (
        <>
          {children}

          {/* Overlay de guía de escaneo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative h-32 w-64 sm:h-40 sm:w-80">
              {/* Esquinas */}
              <div className="absolute -left-1 -top-1 h-8 w-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <div className="absolute -right-1 -top-1 h-8 w-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

              {/* Línea de escaneo animada */}
              <div className="absolute left-0 right-0 h-0.5 bg-primary/80 animate-scanner-pulse" 
                style={{ top: '50%', transform: 'translateY(-50%)' }} 
              />
            </div>
          </div>

          {/* Texto guía */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-sm font-medium text-white/90 drop-shadow-lg">
              Centre el código en el recuadro
            </p>
          </div>
        </>
      )}
    </div>
  );
}