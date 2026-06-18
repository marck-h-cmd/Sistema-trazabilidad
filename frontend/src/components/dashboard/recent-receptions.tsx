'use client';

import { useQuery } from '@tanstack/react-query';
import { receptionsApi } from '@/lib/api/receptions.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { 
  Package, 
  ArrowRight,
  User,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export function RecentReceptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-receptions'],
    queryFn: () => receptionsApi.getRecent(5),
    refetchInterval: 30000,
  });

  const receptions = data?.data?.data || [];

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Package className="h-4 w-4 text-green-500" />
          Últimas Recepciones
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs dark:hover:bg-gray-800" asChild>
          <Link href="/recepcion">
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
        ) : receptions.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground dark:text-gray-500">
            No hay recepciones recientes
          </div>
        ) : (
          <div className="space-y-3">
            {receptions.map((reception: any) => (
              <Link
                key={reception.id}
                href={`/recepcion/${reception.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50 dark:hover:bg-gray-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                  <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold dark:text-gray-200">
                      {reception.codigo}
                    </span>
                    <Badge variant="outline" className="text-[10px] dark:border-gray-600">
                      {reception.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                    {reception.proveedor?.nombre || 'Proveedor'}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground dark:text-gray-500">
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(reception.creadoEn), { addSuffix: true, locale: es })}
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