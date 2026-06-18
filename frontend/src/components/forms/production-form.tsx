'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { productionsApi } from '@/lib/api/productions.api';
import { productsApi } from '@/lib/api/products.api';
import { inventoryApi } from '@/lib/api/inventory.api';
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
  Factory, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  Camera,
  Beaker,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const productionSchema = z.object({
  lineaProduccionId: z.string().min(1, 'Seleccione una línea'),
  productoId: z.string().min(1, 'Seleccione un producto a producir'),
  materiasPrimas: z.array(z.object({
    loteId: z.string().min(1, 'Seleccione un lote'),
    cantidad: z.coerce.number().min(0.01, 'Cantidad mínima 0.01'),
  })).min(1, 'Agregue al menos una materia prima'),
  temperaturaHorno: z.coerce.number().optional(),
  tiempoCoccion: z.coerce.number().int().optional(),
  humedad: z.coerce.number().optional(),
  tamanoLote: z.coerce.number().optional(),
  observaciones: z.string().optional(),
  tipoEtiqueta: z.string().default('AMBOS'),
  cantidadEtiquetas: z.coerce.number().int().default(0),
});

type ProductionFormData = z.infer<typeof productionSchema>;

interface ProductionFormProps {
  onSuccess?: () => void;
}

export function ProductionForm({ onSuccess }: ProductionFormProps) {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);

  const { data: lines } = useQuery({
    queryKey: ['production-lines'],
    queryFn: () => api.get('/lineas-produccion').then(r => r.data.data),
  });

  const { data: products } = useQuery({
    queryKey: ['products-pt'],
    queryFn: () => productsApi.getByCategory('PRODUCTO_TERMINADO'),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductionFormData>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      materiasPrimas: [{ loteId: '', cantidad: 0 }],
      tipoEtiqueta: 'AMBOS',
      cantidadEtiquetas: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'materiasPrimas' });

  const createMutation = useMutation({
    mutationFn: (data: ProductionFormData) => productionsApi.create(data),
    onSuccess: () => {
      toast({ title: 'Producción creada', variant: 'success' });
      onSuccess?.();
      router.push('/produccion');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al crear producción',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProductionFormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Factory className="h-5 w-5 text-primary" />
                Datos de Producción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Línea de Producción *</Label>
                  <Select onValueChange={(v) => setValue('lineaProduccionId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar línea" />
                    </SelectTrigger>
                    <SelectContent>
                      {lines?.map((l: any) => (
                        <SelectItem key={l.id} value={l.id}>{l.codigo} - {l.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Producto a Producir *</Label>
                  <Combobox
                    options={products?.data?.data?.map((p: any) => ({
                      value: p.id,
                      label: `${p.nombre} (${p.sku})`,
                    })) || []}
                    placeholder="Seleccionar producto"
                    onChange={(v) => setValue('productoId', v)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Temp. Horno (°C)</Label>
                  <Input type="number" step="0.1" placeholder="180" {...register('temperaturaHorno')} />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Tiempo (min)</Label>
                  <Input type="number" placeholder="45" {...register('tiempoCoccion')} />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Humedad (%)</Label>
                  <Input type="number" step="0.1" placeholder="65" {...register('humedad')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                <Beaker className="h-5 w-5 text-primary" />
                Materias Primas
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ loteId: '', cantidad: 0 })}>
                <Plus className="mr-2 h-4 w-4" /> Agregar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3 rounded-lg border p-3 dark:border-gray-700">
                  <div className="flex-1 space-y-2">
                    <Label className="dark:text-gray-300">Lote MP *</Label>
                    <Input placeholder="Código de lote o escanear" {...register(`materiasPrimas.${index}.loteId`)} />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="dark:text-gray-300">Cantidad *</Label>
                    <Input type="number" step="0.01" placeholder="0" {...register(`materiasPrimas.${index}.cantidad`)} />
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
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select defaultValue="AMBOS" onValueChange={(v) => setValue('tipoEtiqueta', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE_128">Code 128 (Pallets)</SelectItem>
                  <SelectItem value="QR">QR (Bolsas)</SelectItem>
                  <SelectItem value="AMBOS">Ambos</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Cantidad etiquetas" {...register('cantidadEtiquetas')} />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Producción
          </Button>
        </div>
      </div>
    </form>
  );
}

import api from '@/lib/axios';