'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { 
  Wheat, 
  ArrowLeft, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirme la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast({ title: 'Error', description: 'Token no válido', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      setIsSuccess(true);
      toast({
        title: 'Contraseña actualizada',
        description: 'Su contraseña ha sido restablecida exitosamente',
      });
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al restablecer contraseña',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Key className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-gray-200">Enlace inválido</h3>
            <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
              El enlace para restablecer la contraseña no es válido o ha expirado.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/forgot-password">Solicitar nuevo enlace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Wheat className="h-8 w-8 text-white" />
        </div>
      </div>

      <Card className="border-0 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl dark:text-gray-100">Restablecer Contraseña</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Ingrese su nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold dark:text-gray-200">¡Contraseña actualizada!</h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
                Su contraseña ha sido restablecida. Será redirigido al inicio de sesión.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={cn(
                      'pr-10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200',
                      errors.password && 'border-destructive'
                    )}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-300">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn(
                    'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200',
                    errors.confirmPassword && 'border-destructive'
                  )}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {!isSuccess && (
          <CardFooter className="flex justify-center border-t pt-4 dark:border-gray-700">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}