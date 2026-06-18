'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  Truck, 
  Store, 
  Warehouse, 
  Factory,
  Settings,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const configModules = [
  {
    title: 'Usuarios',
    description: 'Gestione los usuarios del sistema, roles y permisos',
    icon: Users,
    href: '/configuracion/usuarios',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    title: 'Productos',
    description: 'Catálogo de productos, materias primas y configuración de lotes',
    icon: Package,
    href: '/configuracion/productos',
    color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    title: 'Proveedores',
    description: 'Gestión de proveedores y sus datos de contacto',
    icon: Truck,
    href: '/configuracion/proveedores',
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    title: 'Clientes',
    description: 'Administre los clientes y direcciones de envío',
    icon: Store,
    href: '/configuracion/clientes',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    title: 'Almacenes',
    description: 'Configure almacenes, zonas y ubicaciones',
    icon: Warehouse,
    href: '/configuracion/almacenes',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    title: 'Líneas de Producción',
    description: 'Administre las líneas de producción y códigos de barras fijos',
    icon: Factory,
    href: '/configuracion/lineas-produccion',
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
];

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administre los catálogos y parámetros del sistema"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {configModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={cn('rounded-xl p-2.5', module.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardTitle className="mt-3 text-base dark:text-gray-100">{module.title}</CardTitle>
                  <CardDescription className="dark:text-gray-400">{module.description}</CardDescription>
                </CardHeader>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/0 transition-colors group-hover:bg-primary/50" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}