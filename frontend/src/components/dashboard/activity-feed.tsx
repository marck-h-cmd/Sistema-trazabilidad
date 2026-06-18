'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Factory, 
  Truck, 
  Warehouse,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ACTIVITY_ICONS: Record<string, any> = {
  RECEPCION: Package,
  PRODUCCION: Factory,
  EXPEDICION: Truck,
  MOVIMIENTO: Warehouse,
  ALERTA: AlertTriangle,
};

const ACTIVITY_COLORS: Record<string, string> = {
  RECEPCION: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PRODUCCION: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  EXPEDICION: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MOVIMIENTO: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ALERTA: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function ActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api.get('/dashboard/activity', { params: { limit: 10 } }),
    refetchInterval: 15000,
  });

  const activities = data?.data?.data || [];

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Clock className="h-4 w-4 text-primary" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
            No hay actividad reciente
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity: any, index: number) => {
              const Icon = ACTIVITY_ICONS[activity.tipo] || Package;
              const colorClass = ACTIVITY_COLORS[activity.tipo] || ACTIVITY_COLORS.MOVIMIENTO;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 dark:hover:bg-gray-800"
                >
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-gray-200 truncate">{activity.descripcion}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {activity.codigo && (
                        <span className="font-mono text-xs text-muted-foreground dark:text-gray-500">
                          {activity.codigo}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        {activity.usuario || 'Sistema'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground dark:text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.fecha), { addSuffix: true, locale: es })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}