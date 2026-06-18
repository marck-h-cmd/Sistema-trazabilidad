import { Wheat } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Wheat className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -inset-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <p className="text-sm text-muted-foreground dark:text-gray-400">Cargando sistema...</p>
      </div>
    </div>
  );
}