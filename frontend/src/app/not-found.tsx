import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wheat, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark:bg-gray-950">
      <Card className="w-full max-w-md border-0 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted dark:bg-gray-800">
            <Wheat className="h-8 w-8 text-muted-foreground dark:text-gray-500" />
          </div>
          <h1 className="text-6xl font-bold text-muted-foreground/30 dark:text-gray-700">404</h1>
          <h2 className="mt-2 text-xl font-bold dark:text-gray-100">Página no encontrada</h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
            La página que busca no existe o ha sido movida.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 dark:border-gray-700">
              <Link href="/trazabilidad">
                <Search className="h-4 w-4" />
                Buscar Lote
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}