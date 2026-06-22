'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { receptionsApi } from '@/lib/api/receptions.api';
import { suppliersApi } from '@/lib/api/suppliers.api';
import { productsApi } from '@/lib/api/products.api';
import { BarcodeScanner } from '@/components/scanner/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { toast } from '@/components/ui/toast';
import { 
  Package, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  Camera,
} from 'lucide-react';
import { useScannerStore } from '@/stores/scanner.store';
import { useRouter } from 'next/navigation';

const receptionSchema = z.object({
  proveedorId: z.string().min(1, 'Seleccione un proveedor'),
  metodoEntrada: z.string().default('MANUAL'),
  numeroAlbaran: z.string().optional(),
  numeroFactura: z.string().optional(),
  lotes: z.array(z.object({
    productoId: z.string().min(1, 'Seleccione un producto'),
    cantidad: z.coerce.number().min(0.01, 'Cantidad mínima 0.01'),
    unidadMedida: z.string().default('kg'),
    fechaCaducidad: z.string().optional(),
    ubicacionId: z.string().optional(),
    numeroLoteProveedor: z.string().optional(),
    temperaturaLlegada: z.coerce.number().optional(),
  })).min(1, 'Agregue al menos un producto'),
  observaciones: z.string().optional(),
});

type ReceptionFormData = z.infer<typeof receptionSchema>;

interface ReceptionFormProps {
  onSuccess?: () => void;
}

export function ReceptionForm({ onSuccess }: ReceptionFormProps) {
  const router = useRouter();
  const { mode } = useScannerStore();
  const [showScanner, setShowScanner] = useState(false);

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', 'list'],
    queryFn: () => suppliersApi.getAll({ limit: 100, activo: true }),
  });

  const { data: products } = useQuery({
    queryKey: ['products', 'mp'],
    queryFn: () => productsApi.getByCategory('MATERIA_PRIMA'),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReceptionFormData>({
    resolver: zodResolver(receptionSchema),
    defaultValues: {
      metodoEntrada: 'MANUAL',
      lotes: [{ productoId: '', cantidad: 0, unidadMedida: 'kg' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lotes' });

  const createMutation = useMutation({
    mutationFn: (data: ReceptionFormData) => receptionsApi.create(data),
    onSuccess: (response) => {
      toast({
        title: 'Recepción creada',
        description: `Recepción ${response.data.data?.codigo} registrada exitosamente`,
        variant: 'success',
      });
      onSuccess?.();
      router.push('/recepcion');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al crear recepción',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ReceptionFormData) => {
    createMutation.mutate(data);
  };

  const handleBarcodeScan = (code: string) => {
    setShowScanner(false);
    toast({
      title: 'Código escaneado',
      description: `Código: ${code}`,
    });
  };

  const supplierOptions = suppliers?.data?.data?.map((s: any) => ({
    value: s.id,
    label: `${s.nombre} (${s.codigo})`,
  })) || [];

  const productOptions = products?.data?.data?.map((p: any) => ({
    value: p.id,
    label: `${p.nombre} (${p.sku})`,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {showScanner && (
        <Card className="overflow-hidden border-2 border-primary/30 dark:border-primary/50">
          <CardContent className="p-0">
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onClose={() => setShowScanner(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Datos de la Recepción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proveedorId" className="dark:text-gray-300">Proveedor *</Label>
                  <Combobox
                    options={supplierOptions}
                    placeholder="Seleccionar proveedor"
                    searchPlaceholder="Buscar proveedor..."
                    emptyText="Proveedor no encontrado"
                    onChange={(value) => setValue('proveedorId', value)}
                  />
                  {errors.proveedorId && (
                    <p className="text-xs text-destructive">{errors.proveedorId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroAlbaran" className="dark:text-gray-300">Nº Albarán</Label>
                  <Input id="numeroAlbaran" placeholder="ALB-001" {...register('numeroAlbaran')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroFactura" className="dark:text-gray-300">Nº Factura</Label>
                  <Input id="numeroFactura" placeholder="FAC-001" {...register('numeroFactura')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Package className="h-5 w-5 text-primary" />
                Productos Recibidos
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productoId: '', cantidad: 0, unidadMedida: 'kg' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4 space-y-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold dark:text-gray-200">Producto {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive dark:hover:bg-red-900/20"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Producto *</Label>
                      <Combobox
                        options={productOptions}
                        placeholder="Seleccionar producto"
                        searchPlaceholder="Buscar producto..."
                        emptyText="Producto no encontrado"
                        onChange={(value) => setValue(`lotes.${index}.productoId`, value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Cantidad *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`lotes.${index}.cantidad`)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Unidad</Label>
                      <Select
                        value={watch(`lotes.${index}.unidadMedida`)}
                        onValueChange={(value) => setValue(`lotes.${index}.unidadMedida`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                          <SelectItem value="g">Gramos (g)</SelectItem>
                          <SelectItem value="L">Litros (L)</SelectItem>
                          <SelectItem value="ml">Mililitros (ml)</SelectItem>
                          <SelectItem value="unidades">Unidades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Fecha Caducidad</Label>
                      <Input type="date" {...register(`lotes.${index}.fechaCaducidad`)} />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Lote Proveedor</Label>
                      <Input placeholder="Lote del proveedor" {...register(`lotes.${index}.numeroLoteProveedor`)} />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Temperatura Llegada (°C)</Label>
                      <Input type="number" step="0.1" placeholder="0.0" {...register(`lotes.${index}.temperaturaLlegada`)} />
                    </div>
                  </div>
                </div>
              ))}

              {errors.lotes && (
                <p className="text-sm text-destructive">{errors.lotes.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => setShowScanner(!showScanner)}
              >
                <Camera className="h-4 w-4" />
                {showScanner ? 'Ocultar Escáner' : 'Escanear Código'}
              </Button>

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isSubmitting || createMutation.isPending}
              >
                {(isSubmitting || createMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Recepción
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observaciones adicionales..."
                rows={4}
                {...register('observaciones')}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}