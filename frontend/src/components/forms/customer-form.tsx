'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers.api';
import { customerSchema } from '@/lib/validators';
import type { CustomerFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TIPOS_CLIENTE } from '@/lib/constants';
import { Save, Loader2 } from 'lucide-react';
import type { Customer } from '@/types/customer.types';

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerForm({ open, onClose, customer }: CustomerFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!customer;

  const { register, control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      codigo: customer.codigo,
      tipo: customer.tipo,
      nombre: customer.nombre,
      nif: customer.nif,
      direccion: customer.direccion,
      ciudad: customer.ciudad,
      pais: customer.pais,
      nombreContacto: customer.nombreContacto,
      emailContacto: customer.emailContacto,
      telefonoContacto: customer.telefonoContacto ?? undefined,
      direccionEnvio: customer.direccionEnvio ?? undefined,
    } : {
      codigo: '',
      tipo: '',
      nombre: '',
      nif: '',
      direccion: '',
      ciudad: '',
      pais: '',
      nombreContacto: '',
      emailContacto: '',
      telefonoContacto: '',
      direccionEnvio: '',
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        codigo: customer.codigo,
        tipo: customer.tipo,
        nombre: customer.nombre,
        nif: customer.nif,
        direccion: customer.direccion,
        ciudad: customer.ciudad,
        pais: customer.pais,
        nombreContacto: customer.nombreContacto,
        emailContacto: customer.emailContacto,
        telefonoContacto: customer.telefonoContacto ?? '',
        direccionEnvio: customer.direccionEnvio ?? '',
      });
    } else {
      reset({
        codigo: '',
        tipo: '',
        nombre: '',
        nif: '',
        direccion: '',
        ciudad: '',
        pais: '',
        nombreContacto: '',
        emailContacto: '',
        telefonoContacto: '',
        direccionEnvio: '',
      });
    }
  }, [customer, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => customersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast({ title: 'Cliente creado', variant: 'success' }); onClose(); },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CustomerFormData) => customersApi.update(customer!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast({ title: 'Cliente actualizado', variant: 'success' }); onClose(); },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const onSubmit = (data: CustomerFormData) => isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg dark:border-gray-800 dark:bg-gray-900">
        <DialogHeader><DialogTitle className="dark:text-gray-100">{isEditing ? 'Editar' : 'Nuevo'} Cliente</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label className="dark:text-gray-300">Código *</Label><Input {...register('codigo')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Tipo *</Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>{TIPOS_CLIENTE.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2"><Label className="dark:text-gray-300">Nombre *</Label><Input {...register('nombre')} /></div>
          <div className="space-y-2"><Label className="dark:text-gray-300">NIF *</Label><Input {...register('nif')} /></div>
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
          <div className="space-y-2"><Label className="dark:text-gray-300">Dirección Envío</Label><Input {...register('direccionEnvio')} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{isEditing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}