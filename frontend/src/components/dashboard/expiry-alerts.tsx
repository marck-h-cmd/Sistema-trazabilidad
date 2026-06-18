'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpiryAlertsProps {
  lotesPorVencer: number;
  lotesVencidos: number;
  isLoading?: boolean;
}

export function ExpiryAlerts({ lotesPorVencer, lotesVencidos, isLoading }: ExpiryAlertsProps) {
  if (isLoading) {
    return <Skeleton className="h-[280px] rounded-xl" />;
  }

  const total = lotesPorVencer + lotesVencidos;
  const dangerPercent = total > 0 ? Math.round((lotesVencidos / total) * 100) : 0;
  const warningPercent = total > 0 ? Math.round((lotesPorVencer / total) * 100) : 0;

  return (
    <Card className="border-l-4 border-l-amber-500 dark:border-l-amber-600 dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
            <Clock className="h-5 w-5 text-amber-500" />
            Caducidades
          </CardTitle>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{total}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vencidos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="dark:text-gray-300">Vencidos</span>
            </div>
            <span className="font-bold text-red-600 dark:text-red-400">{lotesVencidos}</span>
          </div>
          <Progress 
            value={dangerPercent} 
            className="h-2 bg-red-100 dark:bg-red-900/30" 
            indicatorClassName="bg-red-500" 
          />
        </div>

        {/* Por vencer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="dark:text-gray-300">Próximos 7 días</span>
            </div>
            <span className="font-bold text-amber-600 dark:text-amber-400">{lotesPorVencer}</span>
          </div>
          <Progress 
            value={warningPercent} 
            className="h-2 bg-amber-100 dark:bg-amber-900/30" 
            indicatorClassName="bg-amber-500" 
          />
        </div>

        {/* Resumen */}
        <div className="rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
          {total === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Todos los lotes están al día</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>{total} {total === 1 ? 'lote requiere' : 'lotes requieren'} atención</span>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full dark:border-gray-700 dark:hover:bg-gray-800" asChild>
          <Link href="/almacen/inventario?filtro=expiring">
            Ver detalles
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}