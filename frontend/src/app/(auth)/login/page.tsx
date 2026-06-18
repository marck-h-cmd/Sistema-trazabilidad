'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { 
  Wheat, 
  Eye, 
  EyeOff, 
  Loader2,
  Shield,
  Factory,
} from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: 'Bienvenido',
        description: 'Inicio de sesión exitoso',
      });
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Credenciales inválidas';
      toast({
        title: 'Error de autenticación',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo y título */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Wheat className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">
          Trazabilidad Alimentaria
        </h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">
          Sistema de gestión de productos y lotes
        </p>
      </div>

      <Card className="border-0 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl dark:text-gray-100">Iniciar Sesión</CardTitle>
            <ThemeToggle />
          </div>
          <CardDescription className="dark:text-gray-400">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@panaderia.com"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                className={cn(
                  'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500',
                  errors.email && 'border-destructive dark:border-red-500'
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={cn(
                    'pr-10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500',
                    errors.password && 'border-destructive dark:border-red-500'
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
                <p className="text-xs text-destructive dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Link olvidé contraseña */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                ¿Olvidó su contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardFooter className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Panel de Administración • v1.0.0</span>
          </div>
        </CardFooter>
      </Card>

      {/* Credenciales demo */}
      <Card className="mt-6 border border-dashed dark:border-gray-700 dark:bg-gray-900/50">
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground dark:text-gray-500">
            CREDENCIALES DE PRUEBA
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground dark:text-gray-400">Admin:</span>
                <span className="font-mono font-medium dark:text-gray-300">admin@panaderia.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground dark:text-gray-400">Recepción:</span>
                <span className="font-mono font-medium dark:text-gray-300">recepcion@panaderia.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-muted-foreground dark:text-gray-400">Producción:</span>
                <span className="font-mono font-medium dark:text-gray-300">produccion@panaderia.com</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground dark:text-gray-400">Almacén:</span>
                <span className="font-mono font-medium dark:text-gray-300">almacen@panaderia.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span className="text-muted-foreground dark:text-gray-400">Despacho:</span>
                <span className="font-mono font-medium dark:text-gray-300">despacho@panaderia.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <span className="text-muted-foreground dark:text-gray-400">Contraseña:</span>
                <span className="font-mono font-medium dark:text-gray-300">password123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}