'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi } from '@/lib/api/warehouses.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';

const locationSchema = z.object({
  zona: z.string().min(1, 'Zona obligatoria'),
  pasillo: z.string().min(1, 'Pasillo obligatorio'),
  estanteria: z.string().min(1, 'Estantería obligatoria'),
  nivel: z.string().min(1, 'Nivel obligatorio'),
  codigoBarras: z.string().optional(),
  capacidadMaxima: z.coerce.number().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  open: boolean;
  onClose: () => void;
  warehouseId: string;
}

export function LocationForm({ open, onClose, warehouseId }: LocationFormProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: LocationFormData) => warehousesApi.createLocation(warehouseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', warehouseId] });
      toast({ title: 'Ubicación creada', variant: 'success' });
      onClose();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const onSubmit = (data: LocationFormData) => createMutation.mutate(data);

  const previewCode = `ZONA-${watch('zona') || '?'}-PASILLO-${watch('pasillo') || '?'}-ESTANTERIA-${watch('estanteria') || '?'}-NIVEL-${watch('nivel') || '?'}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:border-gray-800 dark:bg-gray-900">
        <DialogHeader><DialogTitle className="dark:text-gray-100">Nueva Ubicación</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label className="dark:text-gray-300">Zona *</Label><Input placeholder="A" maxLength={1} {...register('zona')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Pasillo *</Label><Input placeholder="01" maxLength={2} {...register('pasillo')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Estantería *</Label><Input placeholder="01" maxLength={2} {...register('estanteria')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Nivel *</Label><Input placeholder="01" maxLength={2} {...register('nivel')} /></div>
          </div>
          <div className="rounded-lg bg-muted p-3 dark:bg-gray-800">
            <p className="text-xs text-muted-foreground dark:text-gray-400">Código generado:</p>
            <p className="font-mono text-sm font-bold dark:text-gray-200">{previewCode}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label className="dark:text-gray-300">Código Barras</Label><Input placeholder="UBI-A010101" {...register('codigoBarras')} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Capacidad Máx.</Label><Input type="number" placeholder="1000" {...register('capacidadMaxima')} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}