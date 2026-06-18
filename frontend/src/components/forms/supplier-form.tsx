'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/lib/api/suppliers.api';
import { supplierSchema } from '@/lib/validators';
import type { SupplierFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import type { Supplier } from '@/types/supplier.types';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function SupplierForm({ open, onClose, supplier }: SupplierFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier ? {
      codigo: supplier.codigo,
      nombre: supplier.nombre,
      nif: supplier.nif,
      direccion: supplier.direccion,
      ciudad: supplier.ciudad,
      pais: supplier.pais,
      nombreContacto: supplier.nombreContacto,
      emailContacto: supplier.emailContacto,
      telefonoContacto: supplier.telefonoContacto ?? undefined,
      utilizaCodigoBarras: supplier.utilizaCodigoBarras,
    } : {
      codigo: '',
      nombre: '',
      nif: '',
      direccion: '',
      ciudad: '',
      pais: '',
      nombreContacto: '',
      emailContacto: '',
      telefonoContacto: '',
      utilizaCodigoBarras: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SupplierFormData) => suppliersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast({ title: 'Proveedor creado', variant: 'success' }); onClose(); },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: SupplierFormData) => suppliersApi.update(supplier!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast({ title: 'Proveedor actualizado', variant: 'success' }); onClose(); },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const onSubmit = (data: SupplierFormData) => isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg dark:border-gray-800 dark:bg-gray-900">
        <DialogHeader><DialogTitle className="dark:text-gray-100">{isEditing ? 'Editar' : 'Nuevo'} Proveedor</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label className="dark:text-gray-300">Código *</Label><Input {...register('codigo')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">NIF *</Label><Input {...register('nif')} /></div>
          </div>
          <div className="space-y-2"><Label className="dark:text-gray-300">Nombre *</Label><Input {...register('nombre')} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label className="dark:text-gray-300">Dirección *</Label><Input {...register('direccion')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Ciudad *</Label><Input {...register('ciudad')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">País *</Label><Input {...register('pais')} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label className="dark:text-gray-300">Contacto *</Label><Input {...register('nombreContacto')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Email *</Label><Input type="email" {...register('emailContacto')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Teléfono</Label><Input {...register('telefonoContacto')} /></div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
            <Label className="dark:text-gray-300">Utiliza Código de Barras</Label>
            <Switch checked={watch('utilizaCodigoBarras')} onCheckedChange={(v) => setValue('utilizaCodigoBarras', v)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{isEditing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}