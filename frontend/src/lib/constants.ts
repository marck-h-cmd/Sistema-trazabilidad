export const APP_NAME = 'Trazabilidad Alimentaria';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Sistema de trazabilidad de productos alimenticios y lotes';

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = "dd/MM/yyyy 'a las' HH:mm";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const LOT_CODE_REGEX = /^L\d{6}[A-Z]\d{1}\d{2}$/;

export const EXPIRY_COLORS = {
  RED: { days: 0, color: 'text-red-600 bg-red-50 dark:bg-red-900/30', label: 'Vencido' },
  AMBER: { days: 7, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', label: 'Próximo a vencer' },
  YELLOW: { days: 15, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30', label: 'Atención' },
  GREEN: { days: 30, color: 'text-green-600 bg-green-50 dark:bg-green-900/30', label: 'OK' },
};

export const UNIDADES_MEDIDA = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'cajas', label: 'Cajas' },
  { value: 'pallets', label: 'Pallets' },
];

export const TIPOS_CLIENTE = [
  { value: 'BODEGA', label: 'Bodega' },
  { value: 'SUPERMERCADO', label: 'Supermercado' },
  { value: 'TIENDA', label: 'Tienda' },
  { value: 'RESTAURANTE', label: 'Restaurante' },
  { value: 'DISTRIBUIDOR', label: 'Distribuidor' },
];

export const CATEGORIAS_PRODUCTO = [
  { value: 'MATERIA_PRIMA', label: 'Materia Prima' },
  { value: 'PRODUCTO_TERMINADO', label: 'Producto Terminado' },
  { value: 'ENVASE', label: 'Envase' },
  { value: 'SEMIELABORADO', label: 'Semielaborado' },
];

export const TIPOS_ALERTA = [
  { value: 'CONTAMINACION', label: 'Contaminación' },
  { value: 'CUERPO_EXTRAÑO', label: 'Cuerpo Extraño' },
  { value: 'ETIQUETADO', label: 'Error de Etiquetado' },
  { value: 'CALIDAD', label: 'Calidad' },
  { value: 'INCUMPLIMIENTO_ESPECIFICACIONES', label: 'Incumplimiento Especificaciones' },
  { value: 'OTRO', label: 'Otro' },
];

export const SEVERIDAD_ALERTA = [
  { value: 'AVISO', label: 'Aviso' },
  { value: 'CRITICO', label: 'Crítico' },
];