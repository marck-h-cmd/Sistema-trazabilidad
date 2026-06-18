'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbNavProps {
  className?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  recepcion: 'Recepción',
  nueva: 'Nueva',
  produccion: 'Producción',
  almacen: 'Almacén',
  inventario: 'Inventario',
  movimientos: 'Movimientos',
  ubicaciones: 'Ubicaciones',
  expedicion: 'Expedición',
  trazabilidad: 'Trazabilidad',
  alertas: 'Alertas',
  reportes: 'Reportes',
  configuracion: 'Configuración',
  usuarios: 'Usuarios',
  productos: 'Productos',
  proveedores: 'Proveedores',
  clientes: 'Clientes',
  almacenes: 'Almacenes',
  'lineas-produccion': 'Líneas de Producción',
  perfil: 'Perfil',
};

export function BreadcrumbNav({ className }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // No mostrar en dashboard principal
  if (segments.length <= 1 && segments[0] === 'dashboard') {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200">
              <Home className="h-3.5 w-3.5" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');

          return (
            <BreadcrumbItem key={path}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage className="font-medium text-foreground dark:text-gray-200">
                  {label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={path} className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200">
                    {label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}