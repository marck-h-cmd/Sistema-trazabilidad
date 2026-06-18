'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { barcodesApi } from '@/lib/api/barcodes.api';
import { QRDisplay } from './qr-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { 
  QrCode, 
  Loader2, 
  Download,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

const qrSchema = z.object({
  code: z.string().min(1, 'Ingrese un código de lote'),
  size: z.coerce.number().min(100).max(1000).default(300),
});

type QRFormData = z.infer<typeof qrSchema>;

export function QRGenerator() {
  const [generatedQR, setGeneratedQR] = useState<{ image: string; dataUrl: string; url: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QRFormData>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      size: 300,
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: QRFormData) => barcodesApi.generateQR(data),
    onSuccess: (response) => {
      setGeneratedQR(response.data.data || null);
      toast({
        title: 'QR generado',
        description: 'Código QR generado exitosamente',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al generar QR',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: QRFormData) => {
    generateMutation.mutate(data);
  };

  const downloadQR = () => {
    if (!generatedQR?.dataUrl) return;
    const link = document.createElement('a');
    link.href = generatedQR.dataUrl;
    link.download = `qr-${watch('code') || 'output'}.png`;
    link.click();
  };

  const openURL = () => {
    if (generatedQR?.url) {
      window.open(generatedQR.url, '_blank');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Formulario */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
            <QrCode className="h-5 w-5 text-primary" />
            Generar Código QR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-code" className="dark:text-gray-300">Código de Lote *</Label>
              <Input
                id="qr-code"
                placeholder="Ej: L260625L301"
                className="font-mono"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
              <p className="text-xs text-muted-foreground dark:text-gray-500">
                Este código se usará en la URL del portal de trazabilidad
              </p>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Tamaño (px)</Label>
              <Input
                type="number"
                min={100}
                max={1000}
                step={50}
                {...register('size', { valueAsNumber: true })}
              />
            </div>

            {watch('code') && (
              <div className="rounded-lg bg-muted p-3 dark:bg-gray-800">
                <p className="text-xs text-muted-foreground dark:text-gray-400">URL que contendrá el QR:</p>
                <p className="font-mono text-xs text-foreground dark:text-gray-200 break-all">
                  {process.env.NEXT_PUBLIC_QR_BASE_URL || 'https://trazabilidad.com/t'}/{watch('code')}
                </p>
              </div>
            )}

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
              Generar QR
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg dark:text-gray-100">Vista Previa</CardTitle>
          {generatedQR && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openURL} className="gap-2 dark:border-gray-700">
                <ExternalLink className="h-4 w-4" />
                Abrir
              </Button>
              <Button variant="outline" size="sm" onClick={downloadQR} className="gap-2 dark:border-gray-700">
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {generatedQR ? (
            <QRDisplay
              dataUrl={generatedQR.dataUrl}
              code={watch('code') || ''}
              url={generatedQR.url}
              className="mx-auto"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <QrCode className="mb-3 h-12 w-12 text-muted-foreground dark:text-gray-600" />
              <p className="text-sm text-muted-foreground dark:text-gray-500">
                Genere un código QR para ver la vista previa
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}