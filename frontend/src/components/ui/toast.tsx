"use client"

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-xl dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-gray-700",
          description: "group-[.toast]:text-muted-foreground dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground dark:group-[.toast]:bg-primary dark:group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-300",
          error:
            "group-[.toaster]:border-destructive/50 dark:group-[.toaster]:border-red-800",
          success:
            "group-[.toaster]:border-success/50 dark:group-[.toaster]:border-green-800",
        },
      }}
      {...props}
    />
  )
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

const customToast = (options: string | ToastOptions, details?: any) => {
  if (typeof options === 'string') {
    return sonnerToast(options, details);
  }

  const { title, description, variant = 'default' } = options;
  switch (variant) {
    case 'destructive':
      return sonnerToast.error(title, { description, ...details });
    case 'success':
      return sonnerToast.success(title, { description, ...details });
    case 'warning':
      return sonnerToast.warning(title, { description, ...details });
    default:
      return sonnerToast(title, { description, ...details });
  }
};

// Copy all properties from sonner's toast to our custom function
Object.assign(customToast, sonnerToast);

export const toast = customToast as unknown as typeof sonnerToast & {
  (options: ToastOptions): string | number;
};