'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { shipmentsApi } from '@/lib/api/shipments.api';
import { customersApi } from '@/lib/api/customers.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { toast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const shipmentSchema = z.object({
  clienteId: z.string().min(1, 'Seleccione un cliente'),
  items: z.array(z.object({
    loteId: z.string().min(1, 'Ingrese un código de lote'),
    cantidad: z.coerce.number().min(0.01, 'Cantidad mínima 0.01'),
    precioUnitario: z.coerce.number().optional(),
  })).min(1, 'Agregue al menos un lote'),
  empresaTransporte: z.string().optional(),
  matriculaVehiculo: z.string().optional(),
  nombreConductor: z.string().optional(),
  fechaPrevistaEntrega: z.string().optional(),
  observaciones: z.string().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface ShipmentFormProps {
  onSuccess?: () => void;
}

export function ShipmentForm({ onSuccess }: ShipmentFormProps) {
  const router = useRouter();

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll({ limit: 100, activo: true }),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      items: [{ loteId: '', cantidad: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data: ShipmentFormData) => shipmentsApi.create(data),
    onSuccess: (response) => {
      toast({
        title: 'Expedición creada',
        description: `Expedición ${response.data.data?.codigo} registrada`,
        variant: 'success',
      });
      onSuccess?.();
      router.push('/expedicion');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al crear expedición',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ShipmentFormData) => {
    createMutation.mutate(data);
  };

  const customerOptions = customers?.data?.data?.map((c: any) => ({
    value: c.id,
    label: `${c.nombre} (${c.codigo})`,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Truck className="h-5 w-5 text-primary" />
                Datos de Expedición
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Cliente *</Label>
                <Combobox
                  options={customerOptions}
                  placeholder="Seleccionar cliente"
                  searchPlaceholder="Buscar cliente..."
                  onChange={(v) => setValue('clienteId', v)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Transportista</Label>
                  <Input placeholder="Empresa transporte" {...register('empresaTransporte')} />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Matrícula</Label>
                  <Input placeholder="0000-XXX" {...register('matriculaVehiculo')} />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Conductor</Label>
                  <Input placeholder="Nombre conductor" {...register('nombreConductor')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Lotes a Enviar
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ loteId: '', cantidad: 0 })}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Lote
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3 rounded-lg border p-3 dark:border-gray-700">
                  <div className="flex-1 space-y-2">
                    <Label className="dark:text-gray-300">Código Lote *</Label>
                    <Input placeholder="Escanear o escribir código" className="font-mono" {...register(`items.${index}.loteId`)} />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="dark:text-gray-300">Cantidad *</Label>
                    <Input type="number" step="0.01" placeholder="0" {...register(`items.${index}.cantidad`)} />
                  </div>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" className="text-destructive mb-0.5" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear Expedición
          </Button>
        </div>
      </div>
    </form>
  );
}