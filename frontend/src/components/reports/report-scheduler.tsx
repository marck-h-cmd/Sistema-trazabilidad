'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  Calendar,
  Mail,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

const scheduleSchema = z.object({
  nombre: z.string().min(1, 'Nombre obligatorio'),
  tipo: z.string().min(1, 'Tipo obligatorio'),
  frecuencia: z.string().min(1, 'Frecuencia obligatoria'),
  destinatarios: z.string().min(1, 'Al menos un email'),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const FREQUENCIES = [
  { value: 'DIARIO', label: 'Diario' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
];

const REPORT_TYPES = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'CADUCIDADES', label: 'Caducidades' },
  { value: 'EXPEDICIONES', label: 'Expediciones' },
  { value: 'MOVIMIENTOS', label: 'Movimientos' },
];

export function ReportScheduler() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => api.get('/reports/schedules').then(r => r.data.data),
  });

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: ScheduleFormData) =>
      api.post('/reports/schedules', {
        ...data,
        destinatarios: data.destinatarios.split(',').map((e: string) => e.trim()),
        parametros: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast({ title: 'Programación creada', variant: 'success' });
      reset();
      setOpen(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reports/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast({ title: 'Programación eliminada', variant: 'success' });
    },
  });

  const onSubmit = (data: ScheduleFormData) => createMutation.mutate(data);

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Calendar className="h-4 w-4 text-primary" />
          Reportes Programados
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md dark:border-gray-800 dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Programar Reporte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Nombre *</Label>
                <Input placeholder="Reporte semanal de stock" {...register('nombre')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Tipo *</Label>
                  <Select onValueChange={(v) => setValue('tipo', v)}>
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Frecuencia *</Label>
                  <Select onValueChange={(v) => setValue('frecuencia', v)}>
                    <SelectTrigger><SelectValue placeholder="Frecuencia" /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Destinatarios *</Label>
                <Input placeholder="email1@test.com, email2@test.com" {...register('destinatarios')} />
                <p className="text-xs text-muted-foreground dark:text-gray-500">Separar por comas</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted dark:bg-gray-800" />
            ))}
          </div>
        ) : schedules?.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
            <Clock className="mx-auto mb-2 h-8 w-8" />
            No hay reportes programados
          </div>
        ) : (
          <div className="space-y-2">
            {schedules?.map((schedule: any) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-200">{schedule.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs dark:border-gray-600">{schedule.tipo}</Badge>
                      <Badge variant="outline" className="text-xs dark:border-gray-600">{schedule.frecuencia}</Badge>
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        <Mail className="mr-1 inline h-3 w-3" />
                        {schedule.destinatarios?.length || 0} destinatarios
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground dark:text-gray-500">
                    Próximo: {formatDate(schedule.proximoEnvio)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}