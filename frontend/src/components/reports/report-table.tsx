'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { LotStatusBadge } from '@/components/lots/lot-status-badge';
import { 
  Package, 
  Clock, 
  Truck,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatNumber } from '@/lib/formatters';

interface ReportTableProps {
  data: any;
  reportType: string;
  className?: string;
}

const REPORT_ICONS: Record<string, any> = {
  STOCK: Package,
  CADUCIDADES: Clock,
  EXPEDICIONES: Truck,
};

const REPORT_TITLES: Record<string, string> = {
  STOCK: 'Reporte de Stock',
  CADUCIDADES: 'Reporte de Caducidades',
  EXPEDICIONES: 'Reporte de Expediciones',
};

export function ReportTable({ data, reportType, className }: ReportTableProps) {
  const Icon = REPORT_ICONS[reportType] || FileText;
  const title = REPORT_TITLES[reportType] || 'Reporte';

  const renderStockTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="dark:text-gray-400">Código</TableHead>
          <TableHead className="dark:text-gray-400">Producto</TableHead>
          <TableHead className="dark:text-gray-400">Categoría</TableHead>
          <TableHead className="dark:text-gray-400 text-right">Cantidad</TableHead>
          <TableHead className="dark:text-gray-400">Ubicación</TableHead>
          <TableHead className="dark:text-gray-400">Estado</TableHead>
          <TableHead className="dark:text-gray-400">Caducidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.isArray(data) ? data.flatMap((item: any) =>
          item.lotes?.map((lote: any) => (
            <TableRow key={lote.codigo} className="dark:border-gray-700 dark:hover:bg-gray-800/50">
              <TableCell className="font-mono text-sm font-semibold dark:text-gray-200">{lote.codigo}</TableCell>
              <TableCell className="dark:text-gray-300">{item.producto}</TableCell>
              <TableCell className="dark:text-gray-300">{item.categoria}</TableCell>
              <TableCell className="text-right dark:text-gray-300">{formatNumber(lote.cantidad)} {lote.unidad}</TableCell>
              <TableCell className="dark:text-gray-300">{lote.ubicacion || 'Sin ubicación'}</TableCell>
              <TableCell>
                <LotStatusBadge status={lote.estado} size="sm" />
              </TableCell>
              <TableCell className="dark:text-gray-300">
                <span className={cn(
                  lote.diasRestantes < 0 ? 'text-red-600 dark:text-red-400' :
                  lote.diasRestantes <= 7 ? 'text-amber-600 dark:text-amber-400' :
                  'dark:text-gray-300'
                )}>
                  {lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : 'N/A'}
                  {lote.diasRestantes !== undefined && (
                    <span className="ml-1 text-xs">
                      ({lote.diasRestantes < 0 ? 'Vencido' : `${lote.diasRestantes}d`})
                    </span>
                  )}
                </span>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8 dark:text-gray-500">
              No hay datos disponibles
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderExpiryTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="dark:text-gray-400">Código</TableHead>
          <TableHead className="dark:text-gray-400">Producto</TableHead>
          <TableHead className="dark:text-gray-400 text-right">Cantidad</TableHead>
          <TableHead className="dark:text-gray-400">Caducidad</TableHead>
          <TableHead className="dark:text-gray-400 text-right">Días</TableHead>
          <TableHead className="dark:text-gray-400">Ubicación</TableHead>
          <TableHead className="dark:text-gray-400">Alerta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.lotes?.map((lote: any) => (
          <TableRow key={lote.codigo} className="dark:border-gray-700 dark:hover:bg-gray-800/50">
            <TableCell className="font-mono text-sm font-semibold dark:text-gray-200">{lote.codigo}</TableCell>
            <TableCell className="dark:text-gray-300">{lote.producto}</TableCell>
            <TableCell className="text-right dark:text-gray-300">{formatNumber(lote.cantidad)}</TableCell>
            <TableCell className="dark:text-gray-300">{formatDate(lote.fechaCaducidad)}</TableCell>
            <TableCell className={cn(
              'text-right font-semibold',
              lote.diasRestantes < 0 ? 'text-red-600 dark:text-red-400' :
              lote.diasRestantes <= 7 ? 'text-amber-600 dark:text-amber-400' :
              'text-green-600 dark:text-green-400'
            )}>
              {lote.diasRestantes < 0 ? `Vencido` : lote.diasRestantes}
            </TableCell>
            <TableCell className="dark:text-gray-300">{lote.ubicacion || 'Sin ubicación'}</TableCell>
            <TableCell>
              <Badge variant={
                lote.alerta === 'rojo' ? 'destructive' :
                lote.alerta === 'amarillo' ? 'warning' : 'success'
              } className="text-xs">
                {lote.alerta === 'rojo' ? 'Crítico' : lote.alerta === 'amarillo' ? 'Atención' : 'OK'}
              </Badge>
            </TableCell>
          </TableRow>
        )) || (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8 dark:text-gray-500">
              No hay datos disponibles
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderShipmentTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="dark:text-gray-400">Código</TableHead>
          <TableHead className="dark:text-gray-400">Cliente</TableHead>
          <TableHead className="dark:text-gray-400">Fecha Envío</TableHead>
          <TableHead className="dark:text-gray-400">Estado</TableHead>
          <TableHead className="dark:text-gray-400 text-right">Items</TableHead>
          <TableHead className="dark:text-gray-400 text-right">Cantidad Total</TableHead>
          <TableHead className="dark:text-gray-400">Transportista</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.expediciones?.map((exp: any) => (
          <TableRow key={exp.codigo} className="dark:border-gray-700 dark:hover:bg-gray-800/50">
            <TableCell className="font-mono text-sm font-semibold dark:text-gray-200">{exp.codigo}</TableCell>
            <TableCell className="dark:text-gray-300">{exp.cliente}</TableCell>
            <TableCell className="dark:text-gray-300">{exp.fechaEnvio ? formatDate(exp.fechaEnvio) : 'Pendiente'}</TableCell>
            <TableCell><StatusBadge status={exp.estado} /></TableCell>
            <TableCell className="text-right dark:text-gray-300">{exp.cantidadItems}</TableCell>
            <TableCell className="text-right font-semibold dark:text-gray-200">{formatNumber(exp.cantidadTotal)}</TableCell>
            <TableCell className="dark:text-gray-300">{exp.transportista || 'N/A'}</TableCell>
          </TableRow>
        )) || (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8 dark:text-gray-500">
              No hay datos disponibles
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderResumen = () => {
    if (!data?.resumen) return null;
    return (
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(data.resumen).map(([key, value]: [string, any]) => (
          <div key={key} className="rounded-lg bg-muted/50 p-3 text-center dark:bg-gray-800">
            <p className="text-xs text-muted-foreground dark:text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-lg font-bold dark:text-gray-100">
              {typeof value === 'number' ? formatNumber(value) : String(value)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn('dark:border-gray-800 dark:bg-gray-900', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-lg border dark:border-gray-700">
          {reportType === 'STOCK' && renderStockTable()}
          {reportType === 'CADUCIDADES' && renderExpiryTable()}
          {reportType === 'EXPEDICIONES' && renderShipmentTable()}
        </div>
        {renderResumen()}
      </CardContent>
    </Card>
  );
}