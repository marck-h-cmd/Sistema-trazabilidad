import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Fecha inválida';
  return format(d, formatStr, { locale: es });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Fecha inválida';
  return format(d, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLotCode(code: string): string {
  return code.toUpperCase().trim();
}