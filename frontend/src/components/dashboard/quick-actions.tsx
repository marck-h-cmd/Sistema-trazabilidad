'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PackageOpen, 
  Factory, 
  Warehouse, 
  Truck, 
  GitBranch, 
  AlertTriangle,
  Scan,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'Nueva Recepción',
    icon: PackageOpen,
    href: '/recepcion/nueva',
    color: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40',
  },
  {
    label: 'Nueva Producción',
    icon: Factory,
    href: '/produccion/nueva',
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40',
  },
  {
    label: 'Mover Lote',
    icon: Warehouse,
    href: '/almacen/inventario',
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40',
  },
  {
    label: 'Nueva Expedición',
    icon: Truck,
    href: '/expedicion/nueva',
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40',
  },
  {
    label: 'Trazabilidad',
    icon: GitBranch,
    href: '/trazabilidad',
    color: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40',
  },
  {
    label: 'Nueva Alerta',
    icon: AlertTriangle,
    href: '/alertas/nueva',
    color: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40',
  },
];

export function QuickActions() {
  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Scan className="h-4 w-4 text-primary" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:scale-105',
                  action.color
                )}
              >
                <div className="rounded-full bg-white/80 p-2.5 dark:bg-gray-800/80">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-center">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}