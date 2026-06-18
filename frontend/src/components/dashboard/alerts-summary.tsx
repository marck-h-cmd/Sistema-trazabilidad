'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api/alerts.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AlertsSummaryProps {
  alertasActivas: number;
  isLoading?: boolean;
}

export function AlertsSummary({ alertasActivas, isLoading }: AlertsSummaryProps) {
  const { data: activeAlerts } = useQuery({
    queryKey: ['active-alerts-list'],
    queryFn: () => alertsApi.getActive(),
    refetchInterval: 60000,
    enabled: alertasActivas > 0,
  });

  const alerts = activeAlerts?.data?.data || [];

  if (isLoading) {
    return <Skeleton className="h-[280px] rounded-xl" />;
  }

  return (
    <Card className={cn(
      'dark:border-gray-800 dark:bg-gray-900',
      alertasActivas > 0 && 'border-l-4 border-l-red-500 dark:border-l-red-600'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
            <AlertTriangle className={cn(
              'h-5 w-5',
              alertasActivas > 0 ? 'text-red-500' : 'text-green-500'
            )} />
            Alertas
          </CardTitle>
          <span className={cn(
            'text-2xl font-bold',
            alertasActivas > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          )}>
            {alertasActivas}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertasActivas === 0 ? (
          <div className="rounded-lg bg-muted/50 p-4 text-center dark:bg-gray-800">
            <ShieldAlert className="mx-auto mb-2 h-6 w-6 text-green-500" />
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Sin alertas activas
            </p>
            <p className="text-xs text-muted-foreground dark:text-gray-500">
              El sistema opera normalmente
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {alerts.slice(0, 3).map((alert: any) => (
                <Link
                  key={alert.id}
                  href={`/alertas/${alert.id}`}
                  className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50 dark:hover:bg-gray-800"
                >
                  <AlertTriangle className={cn(
                    'mt-0.5 h-4 w-4 flex-shrink-0',
                    alert.severidad === 'CRITICO' ? 'text-red-500' : 'text-amber-500'
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium dark:text-gray-200 truncate">{alert.titulo}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={alert.severidad === 'CRITICO' ? 'destructive' : 'warning'} className="text-[10px]">
                        {alert.severidad}
                      </Badge>
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        {formatDistanceToNow(new Date(alert.fechaCreacion), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <Button variant="outline" size="sm" className="w-full dark:border-gray-700 dark:hover:bg-gray-800" asChild>
          <Link href="/alertas">
            {alertasActivas > 0 ? 'Gestionar alertas' : 'Ver historial'}
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}