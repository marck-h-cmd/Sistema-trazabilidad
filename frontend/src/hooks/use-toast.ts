'use client';

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    switch (variant) {
      case 'destructive':
        sonnerToast.error(title, { description });
        break;
      case 'success':
        sonnerToast.success(title, { description });
        break;
      case 'warning':
        sonnerToast.warning(title, { description });
        break;
      default:
        sonnerToast(title, { description });
    }
  };

  return { toast };
}