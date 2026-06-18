import { Wheat } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20">
      {/* Header minimal */}
      <header className="flex h-16 items-center justify-center border-b bg-white/50 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Wheat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary">Trazabilidad Alimentaria</span>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer minimal */}
      <footer className="border-t bg-white/50 py-4 text-center backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-xs text-muted-foreground dark:text-gray-500">
          Cumple con Reglamento Europeo 178/2002 • APPCC • ISO 22000 • IFS • BRC
        </p>
      </footer>
    </div>
  );
}