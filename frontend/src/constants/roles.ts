export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  CALIDAD: 'CALIDAD',
  RECEPCION: 'RECEPCION',
  PRODUCCION: 'PRODUCCION',
  ALMACEN: 'ALMACEN',
  DESPACHO: 'DESPACHO',
  CLIENTE: 'CLIENTE',
  AUTORIDAD: 'AUTORIDAD',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  CALIDAD: 'Calidad',
  RECEPCION: 'Recepción',
  PRODUCCION: 'Producción',
  ALMACEN: 'Almacén',
  DESPACHO: 'Despacho',
  CLIENTE: 'Cliente',
  AUTORIDAD: 'Autoridad',
};

export const ROLE_COLORS: Record<string, string> = {
  ADMINISTRADOR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CALIDAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  RECEPCION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PRODUCCION: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ALMACEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DESPACHO: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  CLIENTE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  AUTORIDAD: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};