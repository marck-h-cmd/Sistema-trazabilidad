'use client';

import Link from 'next/link';
import { 
  Package, 
  PackageOpen, 
  Factory, 
  Truck, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  data?: {
    totalLotesActivos?: number;
    recepcionesHoy?: number;
    produccionesHoy?: number;
    expedicionesHoy?: number;
    alertasActivas?: number;
    lotesPorVencer?: number;
    lotesVencidos?: number;
  };
  isLoading?: boolean;
}

const stats = [
  {
    key: 'totalLotesActivos',
    label: 'Lotes Activos',
    icon: Package,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
    href: '/almacen/inventario',
  },
  {
    key: 'recepcionesHoy',
    label: 'Recepciones Hoy',
    icon: PackageOpen,
    color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
    href: '/recepcion',
  },
  {
    key: 'produccionesHoy',
    label: 'Producciones Hoy',
    icon: Factory,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400',
    href: '/produccion',
  },
  {
    key: 'expedicionesHoy',
    label: 'Expediciones Hoy',
    icon: Truck,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400',
    href: '/expedicion',
  },
  {
    key: 'alertasActivas',
    label: 'Alertas Activas',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
    href: '/alertas',
  },
  {
    key: 'lotesPorVencer',
    label: 'Por Vencer (7d)',
    icon: Clock,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
    href: '/almacen/inventario?filtro=expiring',
  },
];

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const value = (data as any)[stat.key] ?? 0;
        const Icon = stat.icon;

        return (
          <Link key={stat.key} href={stat.href}>
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn('rounded-xl p-2.5', stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-bold tracking-tight dark:text-gray-100">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-gray-400">{stat.label}</p>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/0 transition-colors group-hover:bg-primary/50" />
            </Card>
          </Link>
        );
      })}
    </div>
  );
}