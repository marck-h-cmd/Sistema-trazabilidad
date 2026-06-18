'use client';

import { cn } from '@/lib/utils';

interface QRDisplayProps {
  dataUrl: string;
  code: string;
  url: string;
  className?: string;
  showInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
};

export function QRDisplay({ dataUrl, code, url, className, showInfo = true, size = 'md' }: QRDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn(
        'rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
        sizeClasses[size]
      )}>
        <img
          src={dataUrl}
          alt={`Código QR: ${code}`}
          className="h-full w-full object-contain"
        />
      </div>
      {showInfo && (
        <div className="text-center space-y-1">
          <p className="font-mono text-sm font-bold tracking-wider text-foreground dark:text-gray-200">
            {code}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline break-all"
          >
            {url}
          </a>
          <p className="text-xs text-muted-foreground dark:text-gray-500">
            Escanee con la cámara de su celular
          </p>
        </div>
      )}
    </div>
  );
}