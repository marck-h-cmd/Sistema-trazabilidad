import {
  LayoutDashboard,
  Package,
  Factory,
  Warehouse,
  Truck,
  GitBranch,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  UserCircle,
} from 'lucide-react';

export const MAIN_NAVIGATION = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'RECEPCION', 'PRODUCCION', 'ALMACEN', 'DESPACHO'],
  },
  {
    name: 'Recepción',
    href: '/recepcion',
    icon: Package,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'RECEPCION'],
  },
  {
    name: 'Producción',
    href: '/produccion',
    icon: Factory,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'PRODUCCION'],
  },
  {
    name: 'Almacén',
    href: '/almacen',
    icon: Warehouse,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'ALMACEN'],
  },
  {
    name: 'Expedición',
    href: '/expedicion',
    icon: Truck,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'DESPACHO'],
  },
  {
    name: 'Trazabilidad',
    href: '/trazabilidad',
    icon: GitBranch,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'RECEPCION', 'PRODUCCION', 'ALMACEN', 'DESPACHO', 'CLIENTE', 'AUTORIDAD'],
  },
  {
    name: 'Alertas',
    href: '/alertas',
    icon: AlertTriangle,
    roles: ['ADMINISTRADOR', 'CALIDAD'],
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
    roles: ['ADMINISTRADOR', 'CALIDAD', 'RECEPCION', 'PRODUCCION', 'ALMACEN', 'DESPACHO'],
  },
];

export const CONFIG_NAVIGATION = [
  {
    name: 'Usuarios',
    href: '/configuracion/usuarios',
    icon: Users,
    roles: ['ADMINISTRADOR'],
  },
  {
    name: 'Productos',
    href: '/configuracion/productos',
    icon: Package,
    roles: ['ADMINISTRADOR', 'CALIDAD'],
  },
  {
    name: 'Proveedores',
    href: '/configuracion/proveedores',
    icon: Truck,
    roles: ['ADMINISTRADOR'],
  },
  {
    name: 'Clientes',
    href: '/configuracion/clientes',
    icon: Users,
    roles: ['ADMINISTRADOR'],
  },
  {
    name: 'Almacenes',
    href: '/configuracion/almacenes',
    icon: Warehouse,
    roles: ['ADMINISTRADOR'],
  },
  {
    name: 'Líneas Prod.',
    href: '/configuracion/lineas-produccion',
    icon: Factory,
    roles: ['ADMINISTRADOR', 'CALIDAD'],
  },
];