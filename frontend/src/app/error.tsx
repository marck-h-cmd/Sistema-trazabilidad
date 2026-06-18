'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wheat, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en la aplicación:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark:bg-gray-950">
      <Card className="w-full max-w-md border-0 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Wheat className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold dark:text-gray-100">Algo salió mal</h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
            Ha ocurrido un error inesperado en el sistema.
          </p>
          {error.digest && (
            <p className="mt-1 font-mono text-xs text-muted-foreground dark:text-gray-500">
              ID: {error.digest}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button onClick={() => reset()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}