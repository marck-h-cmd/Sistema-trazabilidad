'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api/alerts.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { TIPOS_ALERTA, SEVERIDAD_ALERTA } from '@/lib/constants';
import { 
  AlertTriangle, 
  Save,
  Loader2,
  Scan,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const alertSchema = z.object({
  loteId: z.string().min(1, 'Ingrese un código de lote'),
  tipo: z.string().min(1, 'Seleccione un tipo'),
  severidad: z.string().min(1, 'Seleccione la severidad'),
  titulo: z.string().min(1, 'El título es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface AlertFormProps {
  onSuccess?: () => void;
}

export function AlertForm({ onSuccess }: AlertFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: AlertFormData) => alertsApi.create(data),
    onSuccess: (response) => {
      toast({
        title: 'Alerta creada',
        description: `Alerta ${response.data.data?.codigo} registrada`,
        variant: 'success',
      });
      onSuccess?.();
      router.push('/alertas');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al crear alerta',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AlertFormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Nueva Alerta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Lote Afectado *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Código de lote (ej: L260625L301)"
                className="font-mono flex-1"
                {...register('loteId')}
              />
              <Button type="button" variant="outline" size="icon">
                <Scan className="h-4 w-4" />
              </Button>
            </div>
            {errors.loteId && <p className="text-xs text-destructive">{errors.loteId.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Tipo *</Label>
              <Select value={watch('tipo')} onValueChange={(v) => setValue('tipo', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ALERTA.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Severidad *</Label>
              <Select value={watch('severidad')} onValueChange={(v) => setValue('severidad', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar severidad" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERIDAD_ALERTA.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Título *</Label>
            <Input placeholder="Título descriptivo de la alerta" {...register('titulo')} />
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Descripción *</Label>
            <Textarea
              placeholder="Describa el problema detectado..."
              rows={4}
              {...register('descripcion')}
            />
          </div>
          <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Alerta
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}