'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import type { Warehouse } from '@/types/warehouse.types';

const warehouseSchema = z.object({
  codigo: z.string().min(1, 'Código obligatorio'),
  nombre: z.string().min(1, 'Nombre obligatorio'),
  direccion: z.string().min(1, 'Dirección obligatoria'),
  tipo: z.string().default('PRINCIPAL'),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse | null;
}

export function WarehouseForm({ open, onClose, warehouse }: WarehouseFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!warehouse;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouse || { tipo: 'PRINCIPAL' },
  });

  const createMutation = useMutation({
    mutationFn: (data: WarehouseFormData) => warehousesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouses'] }); toast({ title: 'Almacén creado', variant: 'success' }); onClose(); },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: WarehouseFormData) => warehousesApi.update(warehouse!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouses'] }); toast({ title: 'Almacén actualizado', variant: 'success' }); onClose(); },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const onSubmit = (data: WarehouseFormData) => isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:border-gray-800 dark:bg-gray-900">
        <DialogHeader><DialogTitle className="dark:text-gray-100">{isEditing ? 'Editar' : 'Nuevo'} Almacén</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label className="dark:text-gray-300">Código *</Label><Input {...register('codigo')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Tipo</Label>
              <Select defaultValue={warehouse?.tipo || 'PRINCIPAL'} onValueChange={(v) => setValue('tipo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRINCIPAL">Principal</SelectItem>
                  <SelectItem value="SECUNDARIO">Secundario</SelectItem>
                  <SelectItem value="EXTERNO">Externo</SelectItem>
                  <SelectItem value="TEMPORAL">Temporal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label className="dark:text-gray-300">Nombre *</Label><Input {...register('nombre')} /></div>
          <div className="space-y-2"><Label className="dark:text-gray-300">Dirección *</Label><Input {...register('direccion')} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{isEditing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}