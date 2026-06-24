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
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { BarcodeScanner } from '@/components/scanner/barcode-scanner';
import {
  Truck,
  Plus,
  Trash2,
  Save,
  Loader2,
  Package,
  ScanLine,
  AlertTriangle,
  CheckCircle2,
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
  readonly onSuccess?: () => void;
}

export function ShipmentForm({ onSuccess }: ShipmentFormProps) {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [scannerIndex, setScannerIndex] = useState<number | null>(null);
  const [scannerMessage, setScannerMessage] = useState('Captura un lote para completar el envío.');

  const { data: customers } = useQuery({
    queryKey: ['customers', 'list'],
    queryFn: () => customersApi.getAll({ limit: 100, activo: true }),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      items: [{ loteId: '', cantidad: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items') || [];
  const selectedClient = watch('clienteId');
  const totalUnits = items.reduce((sum, item) => sum + (Number(item?.cantidad) || 0), 0);
  const completedRows = items.filter((item) => item?.loteId?.trim() && Number(item?.cantidad) > 0).length;
  const pendingRows = items.filter((item) => !item?.loteId?.trim() || Number(item?.cantidad) <= 0).length;

  let statusConfig: { label: string; hint: string; variant: 'secondary' | 'warning' | 'success' } = {
    label: 'Listo para enviar',
    hint: 'Todos los lotes tienen código y cantidad.',
    variant: 'success',
  };

  if (!items.length || completedRows === 0) {
    statusConfig = {
      label: 'Pendiente',
      hint: 'Agrega un lote para comenzar.',
      variant: 'secondary',
    };
  } else if (pendingRows > 0) {
    statusConfig = {
      label: 'Revisa datos',
      hint: `Faltan ${pendingRows} fila${pendingRows > 1 ? 's' : ''} por completar.`,
      variant: 'warning',
    };
  }

  const warnings = [
    !selectedClient && 'Selecciona un cliente para continuar.',
    pendingRows > 0 && `Completa ${pendingRows} lote${pendingRows > 1 ? 's' : ''} con código y cantidad.`,
    totalUnits <= 0 && 'Agrega al menos una cantidad mayor a cero.',
  ].filter(Boolean) as string[];

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

  const openScanner = (index: number) => {
    setScannerIndex(index);
    setShowScanner(true);
    setScannerMessage('Abriendo cámara para capturar el lote...');
  };

  const handleBarcodeScan = (code: string) => {
    if (scannerIndex === null) return;

    setValue(`items.${scannerIndex}.loteId`, code, { shouldValidate: true, shouldDirty: true });
    setShowScanner(false);
    setScannerIndex(null);
    setScannerMessage('Lote capturado correctamente.');
    toast({
      title: 'Lote capturado',
      description: `Se asignó el código ${code}`,
      variant: 'success',
    });
  };

  const customerOptions = customers?.data?.data?.map((c: any) => ({
    value: c.id,
    label: `${c.nombre} (${c.codigo})`,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig.variant} className="px-3 py-1 text-sm">
              {statusConfig.label}
            </Badge>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-gray-100">Estado del envío</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">{statusConfig.hint}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground dark:text-gray-400">
            <span className="rounded-full bg-muted px-3 py-1">{items.length} lote{items.length === 1 ? '' : 's'}</span>
            <span className="rounded-full bg-muted px-3 py-1">{totalUnits.toFixed(2)} unidades</span>
          </div>
        </div>
      </div>

      {showScanner && (
        <Card className="overflow-hidden border-2 border-primary/30 dark:border-primary/50">
          <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-4 py-3 text-sm dark:border-primary/20 dark:bg-primary/10">
            <div>
              <p className="font-semibold text-foreground dark:text-gray-100">Escáner activo</p>
              <p className="text-muted-foreground dark:text-gray-400">{scannerMessage}</p>
            </div>
            <Badge variant="info">Capturando lote</Badge>
          </div>
          <CardContent className="p-0">
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onClose={() => {
                setShowScanner(false);
                setScannerIndex(null);
                setScannerMessage('Captura un lote para completar el envío.');
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-6">
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
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Lotes a Enviar
              </CardTitle>
              <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => append({ loteId: '', cantidad: 0 })}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Lote
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-border/70 p-3 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground dark:text-gray-100">Lote {index + 1}</span>
                    {(!items[index]?.loteId?.trim() || Number(items[index]?.cantidad) <= 0) && (
                      <Badge variant="warning" className="text-[11px]">Pendiente</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="dark:text-gray-300">Código Lote *</Label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          placeholder="Escanear o escribir código"
                          className="font-mono"
                          {...register(`items.${index}.loteId`)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-11 shrink-0 dark:border-gray-700"
                          onClick={() => openScanner(index)}
                        >
                          <ScanLine className="mr-2 h-4 w-4" />
                          Escanear
                        </Button>
                      </div>
                    </div>
                    <div className="w-full space-y-2 sm:w-28">
                      <Label className="dark:text-gray-300">Cantidad *</Label>
                      <Input type="number" step="0.01" placeholder="0" {...register(`items.${index}.cantidad`)} />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-11 w-full text-destructive sm:w-11"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Resumen del carrito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-lg bg-muted/60 p-3 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Lotes</p>
                  <p className="text-2xl font-semibold text-foreground dark:text-gray-100">{items.length}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Unidades</p>
                  <p className="text-2xl font-semibold text-foreground dark:text-gray-100">{totalUnits.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/70 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground dark:text-gray-100">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Revisar antes de confirmar
                </div>
                {warnings.length > 0 ? (
                  <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                    {warnings.map((warning) => (
                      <li key={warning} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-warning" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-success dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Todo listo para crear la expedición.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full min-h-12 gap-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Creando expedición...' : 'Crear Expedición'}
          </Button>
        </div>
      </div>
    </form>
  );
}