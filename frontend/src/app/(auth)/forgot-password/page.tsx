'use client';

import { useState } from 'react';
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
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSent(true);
      toast({
        title: 'Correo enviado',
        description: 'Revise su bandeja de entrada para restablecer su contraseña',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al enviar el correo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Wheat className="h-8 w-8 text-white" />
        </div>
      </div>

      <Card className="border-0 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl dark:text-gray-100">Recuperar Contraseña</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Ingrese su email y le enviaremos un enlace para restablecer su contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold dark:text-gray-200">¡Correo enviado!</h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
                Revise su bandeja de entrada y siga las instrucciones para restablecer su contraseña.
              </p>
              <p className="mt-1 text-xs text-muted-foreground dark:text-gray-500">
                Si no encuentra el correo, revise su carpeta de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@panaderia.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                    className={cn(
                      'pl-9 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200',
                      errors.email && 'border-destructive'
                    )}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4 dark:border-gray-700">
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}