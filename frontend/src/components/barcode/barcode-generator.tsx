'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { barcodesApi } from '@/lib/api/barcodes.api';
import { BarcodeDisplay } from './barcode-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { 
  Barcode, 
  Loader2, 
  Download,
  RefreshCw,
} from 'lucide-react';

const barcodeSchema = z.object({
  code: z.string().min(1, 'Ingrese un código'),
  type: z.string().default('code128'),
  scale: z.coerce.number().min(1).max(5).default(2),
  height: z.coerce.number().min(20).max(200).default(40),
  includeText: z.boolean().default(true),
});

type BarcodeFormData = z.infer<typeof barcodeSchema>;

const BARCODE_TYPES = [
  { value: 'code128', label: 'Code 128' },
  { value: 'ean13', label: 'EAN-13' },
  { value: 'ean8', label: 'EAN-8' },
  { value: 'upc', label: 'UPC-A' },
];

export function BarcodeGenerator() {
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BarcodeFormData>({
    resolver: zodResolver(barcodeSchema),
    defaultValues: {
      type: 'code128',
      scale: 2,
      height: 40,
      includeText: true,
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: BarcodeFormData) => barcodesApi.generate(data),
    onSuccess: (response) => {
      setGeneratedBarcode(response.data.data?.image || null);
      toast({
        title: 'Código generado',
        description: 'Código de barras generado exitosamente',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al generar código',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: BarcodeFormData) => {
    generateMutation.mutate(data);
  };

  const downloadBarcode = () => {
    if (!generatedBarcode) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedBarcode}`;
    link.download = `barcode-${watch('code') || 'output'}.png`;
    link.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Formulario */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
            <Barcode className="h-5 w-5 text-primary" />
            Generar Código de Barras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-gray-300">Código *</Label>
              <Input
                id="code"
                placeholder="Ej: L260625L301"
                className="font-mono"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Formato</Label>
                <Select defaultValue="code128" onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BARCODE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Escala (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...register('scale', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Altura (px)</Label>
                <Input
                  type="number"
                  min={20}
                  max={200}
                  {...register('height', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...register('includeText')}
                  />
                  <span className="text-sm dark:text-gray-300">Incluir texto</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg dark:text-gray-100">Vista Previa</CardTitle>
          {generatedBarcode && (
            <Button variant="outline" size="sm" onClick={downloadBarcode} className="gap-2 dark:border-gray-700">
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {generatedBarcode ? (
            <BarcodeDisplay
              image={generatedBarcode}
              code={watch('code') || ''}
              className="mx-auto"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Barcode className="mb-3 h-12 w-12 text-muted-foreground dark:text-gray-600" />
              <p className="text-sm text-muted-foreground dark:text-gray-500">
                Genere un código de barras para ver la vista previa
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}