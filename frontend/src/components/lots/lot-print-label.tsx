'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { labelsApi } from '@/lib/api/labels.api';
import { LabelPreview } from '@/components/barcode/label-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { 
  Printer, 
  Loader2,
  QrCode,
  Barcode,
} from 'lucide-react';
import type { Lot } from '@/types/lot.types';

interface LotPrintLabelProps {
  lot: Lot;
  onPrint?: () => void;
  className?: string;
}

export function LotPrintLabel({ lot, onPrint, className }: LotPrintLabelProps) {
  const [quantity, setQuantity] = useState(1);
  const [labelType, setLabelType] = useState<'CODE_128' | 'QR' | 'AMBOS'>('AMBOS');

  const printMutation = useMutation({
    mutationFn: (data: any) => labelsApi.print(data),
    onSuccess: (response) => {
      toast({
        title: 'Etiquetas generadas',
        description: `${response.data.data?.labelsGenerated || 0} etiquetas generadas`,
        variant: 'success',
      });
      onPrint?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Error al imprimir etiquetas',
        variant: 'destructive',
      });
    },
  });

  const handlePrint = () => {
    printMutation.mutate({
      lotId: lot.id,
      quantity,
      labelType,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <Printer className="h-5 w-5 text-primary" />
          Imprimir Etiquetas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Tipo de Etiqueta</Label>
            <Select value={labelType} onValueChange={(v) => setLabelType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CODE_128">
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4" />
                    Code 128 (Interno)
                  </div>
                </SelectItem>
                <SelectItem value="QR">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR (Consumidor)
                  </div>
                </SelectItem>
                <SelectItem value="AMBOS">
                  <div className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Ambos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Cantidad</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <LabelPreview
          productName={lot.producto?.nombre || 'Producto'}
          lotCode={lot.codigo}
          productionDate={lot.fechaProduccion || undefined}
          expiryDate={lot.fechaCaducidad || undefined}
          weight={`${lot.cantidad} ${lot.unidadMedida}`}
          labelType={labelType}
        />

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handlePrint}
          disabled={printMutation.isPending}
        >
          {printMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          Imprimir {quantity} {quantity === 1 ? 'etiqueta' : 'etiquetas'}
        </Button>
      </CardContent>
    </Card>
  );
}