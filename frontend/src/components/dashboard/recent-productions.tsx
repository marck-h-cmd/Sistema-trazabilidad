'use client';

import { useQuery } from '@tanstack/react-query';
import { productionsApi } from '@/lib/api/productions.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Factory, 
  ArrowRight,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export function RecentProductions() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-productions'],
    queryFn: () => productionsApi.getRecent(5),
    refetchInterval: 30000,
  });

  const productions = data?.data?.data || [];

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Factory className="h-4 w-4 text-orange-500" />
          Últimas Producciones
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs dark:hover:bg-gray-800" asChild>
          <Link href="/produccion">
            Ver todas
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : productions.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground dark:text-gray-500">
            No hay producciones recientes
          </div>
        ) : (
          <div className="space-y-3">
            {productions.map((production: any) => (
              <Link
                key={production.id}
                href={`/produccion/${production.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50 dark:hover:bg-gray-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
                  <Factory className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold dark:text-gray-200">
                      {production.lote?.codigo || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                    {production.lote?.producto?.nombre || 'Producto'} • {production.lineaProduccion?.codigo || 'N/A'}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground dark:text-gray-500">
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(production.creadoEn), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}