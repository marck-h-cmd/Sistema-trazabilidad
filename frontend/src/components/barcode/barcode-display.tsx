'use client';

import { cn } from '@/lib/utils';

interface BarcodeDisplayProps {
  image: string;
  code: string;
  format?: string;
  className?: string;
  showCode?: boolean;
}

export function BarcodeDisplay({ image, code, format = 'Code 128', showCode = true, className }: BarcodeDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="rounded-xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <img
          src={`data:image/png;base64,${image}`}
          alt={`Código de barras: ${code}`}
          className="h-auto max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      {showCode && (
        <div className="text-center">
          <p className="font-mono text-sm font-bold tracking-wider text-foreground dark:text-gray-200">
            {code}
          </p>
          <p className="text-xs text-muted-foreground dark:text-gray-500">
            {format}
          </p>
        </div>
      )}
    </div>
  );
}