'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import { productSchema } from '@/lib/validators';
import type { ProductFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CATEGORIAS_PRODUCTO, UNIDADES_MEDIDA } from '@/lib/constants';
import { Save, Loader2 } from 'lucide-react';
import type { Product } from '@/types/product.types';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          nombre: product.nombre,
          descripcion: product.descripcion || '',
          categoria: product.categoria,
          unidadMedida: product.unidadMedida,
          vidaUtilDias: product.vidaUtilDias,
          requiereCadenaFrio: product.requiereCadenaFrio,
          temperaturaMinima: product.temperaturaMinima || undefined,
          temperaturaMaxima: product.temperaturaMaxima || undefined,
        }
      : {
          requiereCadenaFrio: false,
          categoria: 'PRODUCTO_TERMINADO',
          unidadMedida: 'kg',
        },
  });

  const requiereFrio = watch('requiereCadenaFrio');

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Producto creado', variant: 'success' });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => productsApi.update(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Producto actualizado', variant: 'success' });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dark:border-gray-800 dark:bg-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">SKU *</Label>
              <Input placeholder="PT-001" {...register('sku')} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Categoría *</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUCTO.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Nombre *</Label>
            <Input placeholder="Nombre del producto" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Descripción</Label>
            <Input placeholder="Descripción opcional" {...register('descripcion')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Unidad *</Label>
              <Controller
                control={control}
                name="unidadMedida"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_MEDIDA.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Vida Útil (días) *</Label>
              <Input
                type="number"
                placeholder="30"
                {...register('vidaUtilDias', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
            <Label className="dark:text-gray-300">Requiere Cadena de Frío</Label>
            <Switch
              checked={requiereFrio}
              onCheckedChange={(v) => setValue('requiereCadenaFrio', v)}
            />
          </div>

          {requiereFrio && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Temp. Mínima (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register('temperaturaMinima', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Temp. Máxima (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="4"
                  {...register('temperaturaMaxima', { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
