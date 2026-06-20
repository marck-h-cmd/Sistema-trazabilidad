'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  Download,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabelPreviewProps {
  productName: string;
  lotCode: string;
  productionDate?: string;
  expiryDate?: string;
  weight?: string;
  barcodeImage?: string;
  qrImage?: string;
  ingredients?: string;
  alergenos?: string;
  labelType?: 'CODE_128' | 'QR' | 'AMBOS';
  className?: string;
  onPrint?: () => void;
}

export function LabelPreview({
  productName,
  lotCode,
  productionDate,
  expiryDate,
  weight,
  barcodeImage,
  qrImage,
  ingredients,
  alergenos,
  labelType = 'CODE_128',
  className,
  onPrint,
}: LabelPreviewProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold dark:text-gray-200">Vista previa de etiqueta</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400">
            {labelType === 'CODE_128' ? 'Code 128 (Interno)' : labelType === 'QR' ? 'QR (Consumidor)' : 'Ambos'}
          </Badge>
          {onPrint && (
            <Button size="sm" variant="outline" className="gap-2 dark:border-gray-700" onClick={onPrint}>
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Code 128 Label */}
        {(labelType === 'CODE_128' || labelType === 'AMBOS') && (
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm dark:text-gray-300">Etiqueta Code 128 (Uso Interno)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600 bg-white">
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-black">{productName}</p>
                  <p className="font-mono text-lg font-bold text-black">{lotCode}</p>
                  {productionDate && (
                    <p className="text-xs text-gray-600">Prod: {productionDate}</p>
                  )}
                  {expiryDate && (
                    <p className="text-xs text-gray-600">Cad: {expiryDate}</p>
                  )}
                  {weight && (
                    <p className="text-xs text-gray-600">Peso: {weight}</p>
                  )}
                  {barcodeImage ? (
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={`data:image/png;base64,${barcodeImage}`}
                        alt="Barcode"
                        className="mx-auto h-12"
                      />
                      <a
                        href={`data:image/png;base64,${barcodeImage}`}
                        download={`barcode-${lotCode}.png`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Descargar Barras
                      </a>
                    </div>
                  ) : (
                    <div className="mx-auto h-12 w-40 bg-gray-200 rounded flex items-center justify-center">
                      <p className="text-xs text-gray-500">Code 128</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Label */}
        {(labelType === 'QR' || labelType === 'AMBOS') && (
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm dark:text-gray-300">Etiqueta QR (Consumidor Final)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600 bg-white">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-bold text-black">{productName}</p>
                    <p className="font-mono text-xs text-gray-600">Lote: {lotCode}</p>
                    {productionDate && (
                      <p className="text-xs text-gray-600">Prod: {productionDate}</p>
                    )}
                    {expiryDate && (
                      <p className="text-xs text-gray-600">Cad: {expiryDate}</p>
                    )}
                    {weight && (
                      <p className="text-xs text-gray-600">{weight}</p>
                    )}
                    {ingredients && (
                      <p className="text-xs text-gray-500">Ing: {ingredients}</p>
                    )}
                    {alergenos && (
                      <p className="text-xs font-bold text-red-600">Alérgenos: {alergenos}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {qrImage ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={qrImage}
                          alt="QR"
                          className="h-20 w-20"
                        />
                        <a
                          href={qrImage}
                          download={`qrcode-${lotCode}.png`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar QR
                        </a>
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                        <p className="text-xs text-gray-500">QR</p>
                      </div>
                    )}
                    <p className="mt-1 text-center text-xs text-gray-500">Escanear</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}