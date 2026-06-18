'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Package, 
  Truck, 
  Ban,
  ShieldAlert,
} from 'lucide-react';

interface LotStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: any;
  colorClass: string;
}> = {
  ACTIVO: {
    label: 'Activo',
    icon: CheckCircle2,
    colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  RESERVADO: {
    label: 'Reservado',
    icon: Clock,
    colorClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  EN_PRODUCCION: {
    label: 'En Producción',
    icon: Package,
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  EN_TRANSITO: {
    label: 'En Tránsito',
    icon: Truck,
    colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
  },
  ENTREGADO: {
    label: 'Entregado',
    icon: CheckCircle2,
    colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  VENCIDO: {
    label: 'Vencido',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    icon: Ban,
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  },
  RETIRADO: {
    label: 'Retirado',
    icon: ShieldAlert,
    colorClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  CONSUMIDO: {
    label: 'Consumido',
    icon: Package,
    colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  },
};

export function LotStatusBadge({ status, size = 'md', showIcon = true, className }: LotStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Desconocido',
    icon: Package,
    colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-1.5 py-0 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-sm gap-2',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold border',
        config.colorClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSize[size]} />}
      {config.label}
    </Badge>
  );
}