'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users.api';
import { userSchema } from '@/lib/validators';
import type { UserFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import type { User } from '@/types/user.types';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const ROLES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'CALIDAD', label: 'Calidad' },
  { value: 'RECEPCION', label: 'Recepción' },
  { value: 'PRODUCCION', label: 'Producción' },
  { value: 'ALMACEN', label: 'Almacén' },
  { value: 'DESPACHO', label: 'Despacho' },
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'AUTORIDAD', label: 'Autoridad' },
];

export function UserForm({ open, onClose, user }: UserFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      telefono: user.telefono || '',
    } : {},
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuario creado', variant: 'success' });
      onClose();
    },
    onError: (error: any) => toast({ title: 'Error', description: error.response?.data?.error?.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuario actualizado', variant: 'success' });
      onClose();
    },
    onError: (error: any) => toast({ title: 'Error', description: error.response?.data?.error?.message, variant: 'destructive' }),
  });

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:border-gray-800 dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Nombre *</Label>
              <Input placeholder="Nombre" {...register('nombre')} />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Apellido *</Label>
              <Input placeholder="Apellido" {...register('apellido')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Email *</Label>
            <Input type="email" placeholder="usuario@panaderia.com" {...register('email')} />
          </div>
          {!isEditing && (
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Contraseña *</Label>
              <Input type="password" placeholder="••••••" {...register('password')} />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Rol *</Label>
              <Select defaultValue={user?.rol} onValueChange={(v) => setValue('rol', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Teléfono</Label>
              <Input placeholder="+34..." {...register('telefono')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-700">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}