import Link from 'next/link';
import { Wheat } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
          <Wheat className="h-4 w-4 text-primary" />
          <span>© {currentYear} Panadería Artesanal S.L. - Sistema de Trazabilidad Alimentaria v1.0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300"
          >
            Inicio
          </Link>
          <Link
            href="/trazabilidad"
            className="text-xs text-muted-foreground hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300"
          >
            Trazabilidad
          </Link>
          <span className="text-xs text-muted-foreground dark:text-gray-600">
            Cumple con Reglamento Europeo 178/2002
          </span>
        </div>
      </div>
    </footer>
  );
}