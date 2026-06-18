'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { authApi } from '@/lib/api/auth.api';
import { usersApi } from '@/lib/api/users.api';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validators';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { 
  User, 
  Key, 
  Settings,
  Save,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Scan,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatters';

export default function PerfilPage() {
  const { user, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [scannerConfig, setScannerConfig] = useState(
    user?.configuracionEscaneo || {
      recepcion: 'opcional',
      produccion: 'opcional',
      almacen: 'opcional',
      expedicion: 'opcional',
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast({ title: 'Contraseña actualizada', variant: 'success' });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al cambiar contraseña',
        variant: 'destructive',
      });
    },
  });

  const updateScannerMutation = useMutation({
    mutationFn: (config: any) => usersApi.updateScannerConfig(user?.id || '', config),
    onSuccess: () => {
      toast({ title: 'Configuración guardada', variant: 'success' });
      refreshUser();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.error?.message, variant: 'destructive' });
    },
  });

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handleScannerChange = (key: string, value: string) => {
    const newConfig = { ...scannerConfig, [key]: value };
    setScannerConfig(newConfig);
  };

  const saveScannerConfig = () => {
    updateScannerMutation.mutate(scannerConfig);
  };

  if (!user) return null;

  const initials = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  const roleLabel = ROLE_LABELS[user.rol] || user.rol;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        description="Gestione su información personal y configuración"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info personal */}
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="text-center">
            <div className="mx-auto relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary dark:bg-primary/20">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <CardTitle className="mt-4 text-xl dark:text-gray-100">{user.nombre} {user.apellido}</CardTitle>
            <CardDescription className="dark:text-gray-400">{user.email}</CardDescription>
            <Badge className={cn('mt-2', ROLE_COLORS[user.rol] || '')}>
              {roleLabel}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator className="dark:bg-gray-700" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground dark:text-gray-400">Estado</span>
              <Badge variant="success" className="text-xs">Activo</Badge>
            </div>
            {user.telefono && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-gray-400">Teléfono</span>
                <span className="dark:text-gray-300">{user.telefono}</span>
              </div>
            )}
            {user.ultimoInicioSesion && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-gray-400">Último acceso</span>
                <span className="dark:text-gray-300">{formatDateTime(user.ultimoInicioSesion)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="password">
            <TabsList>
              <TabsTrigger value="password" className="gap-2">
                <Key className="h-4 w-4" />
                Contraseña
              </TabsTrigger>
              <TabsTrigger value="scanner" className="gap-2">
                <Scan className="h-4 w-4" />
                Escáner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="mt-4">
              <Card className="dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                    <Key className="h-5 w-5 text-primary" />
                    Cambiar Contraseña
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Contraseña Actual</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10 dark:border-gray-700 dark:bg-gray-800"
                          {...register('currentPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Nueva Contraseña</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10 dark:border-gray-700 dark:bg-gray-800"
                          {...register('newPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Confirmar Nueva Contraseña</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="dark:border-gray-700 dark:bg-gray-800"
                        {...register('confirmPassword')}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="gap-2" disabled={isSubmitting || changePasswordMutation.isPending}>
                      {(isSubmitting || changePasswordMutation.isPending) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Actualizar Contraseña
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scanner" className="mt-4">
              <Card className="dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                    <Scan className="h-5 w-5 text-primary" />
                    Configuración de Escaneo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(scannerConfig).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
                        <div>
                          <p className="text-sm font-medium capitalize dark:text-gray-200">{key}</p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {value === 'obligatorio' ? 'Solo modo escaneo' :
                             value === 'opcional' ? 'Escaneo y manual' :
                             'Solo modo manual'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {['obligatorio', 'opcional', 'desactivado'].map((option) => (
                            <Button
                              key={option}
                              variant={value === option ? 'default' : 'outline'}
                              size="xs"
                              onClick={() => handleScannerChange(key, option)}
                              className={cn(
                                'text-xs',
                                value !== option && 'dark:border-gray-600'
                              )}
                            >
                              {option === 'obligatorio' ? 'Obligatorio' :
                               option === 'opcional' ? 'Opcional' : 'Manual'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={saveScannerConfig}
                    disabled={updateScannerMutation.isPending}
                  >
                    {updateScannerMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Guardar Configuración
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}