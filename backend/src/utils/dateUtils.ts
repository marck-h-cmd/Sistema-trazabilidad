import { format, parseISO, isValid, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Fecha inválida';
  return format(d, formatStr, { locale: es });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Fecha inválida';
  return format(d, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
}

export function formatDateYYYYMMDD(date: Date): string {
  return format(date, 'yyyyMMdd');
}

export function formatDateYYMMDD(date: Date): string {
  return format(date, 'yyMMdd');
}

export function daysUntilExpiry(expiryDate: Date | string): number {
  const d = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  if (!isValid(d)) return 0;
  return differenceInDays(d, new Date());
}

export function isExpired(expiryDate: Date | string): boolean {
  return daysUntilExpiry(expiryDate) < 0;
}

export function isExpiringSoon(expiryDate: Date | string, days: number = 7): boolean {
  const remaining = daysUntilExpiry(expiryDate);
  return remaining >= 0 && remaining <= days;
}

export function calculateExpiryDateFromNow(shelfLifeDays: number): Date {
  return addDays(new Date(), shelfLifeDays);
}

export function getDateRange(days: number): { start: Date; end: Date } {
  return {
    start: startOfDay(addDays(new Date(), -days)),
    end: endOfDay(new Date()),
  };
}

export function parseOptionalDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  return isValid(d) ? d : null;
}