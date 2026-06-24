'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Truck,
  Calendar,
  Hash,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface BackwardTraceProps {
  readonly data: any[];
  readonly className?: string;
}

export function BackwardTrace({ data, className }: BackwardTraceProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay materias primas registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <Package className="h-5 w-5 text-green-500" />
          Materias Primas Utilizadas
          <Badge variant="outline" className="ml-auto dark:border-gray-600">
            {data.length} {data.length === 1 ? 'materia prima' : 'materias primas'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={`${item.loteMateriaPrima?.codigo || 'lote'}-${index}`}>
            {index > 0 && <Separator className="my-4 dark:bg-gray-700" />}
            <div className="space-y-3">
              {/* Materia Prima */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
                  <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold dark:text-gray-200">
                    {item.materiaPrima?.nombre || 'Materia Prima'}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    SKU: {item.materiaPrima?.sku || 'N/A'}
                  </p>
                </div>
                <Badge variant="success" className="self-start text-xs">
                  {item.cantidadUtilizada || 0} {item.unidadMedida || ''}
                </Badge>
              </div>

              {/* Lote de MP */}
              <div className="ml-13 grid gap-2 pl-4">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <span className="text-muted-foreground dark:text-gray-400">Lote:</span>
                  <span className="font-mono font-semibold dark:text-gray-200">
                    {item.loteMateriaPrima?.codigo || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                  <span className="text-muted-foreground dark:text-gray-400">Recepcionado:</span>
                  <span className="dark:text-gray-300">{formatDate(item.fechaRecepcion) || 'N/A'}</span>
                </div>
              </div>

              {/* Proveedor */}
              <div className="ml-13 flex items-start gap-2 rounded-lg bg-muted/50 p-3 dark:bg-gray-800">
                <Truck className="mt-0.5 h-4 w-4 text-muted-foreground dark:text-gray-500" />
                <div>
                  <p className="text-sm font-medium dark:text-gray-200">
                    {item.proveedor?.nombre || 'Proveedor'}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Código: {item.proveedor?.codigo || 'N/A'}
                  </p>
                  {item.numeroLoteProveedor && (
                    <p className="text-xs text-muted-foreground dark:text-gray-500">
                      Lote proveedor: {item.numeroLoteProveedor}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}