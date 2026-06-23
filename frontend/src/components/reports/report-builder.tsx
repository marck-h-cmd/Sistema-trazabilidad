'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports.api';
import { productsApi } from '@/lib/api/products.api';
import { suppliersApi } from '@/lib/api/suppliers.api';
import { customersApi } from '@/lib/api/customers.api';
import { ReportTable } from './report-table';
import { ReportChart } from './report-chart';
import { ReportExport } from './report-export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from '@/components/ui/toast';
import { 
  BarChart3, 
  FileText, 
  Search,
  RefreshCw,
  Table2,
  Loader2,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  { value: 'STOCK', label: 'Stock Actual', icon: 'Package' },
  { value: 'CADUCIDADES', label: 'Caducidades', icon: 'Clock' },
  { value: 'EXPEDICIONES', label: 'Expediciones', icon: 'Truck' },
  { value: 'MOVIMIENTOS', label: 'Movimientos', icon: 'Warehouse' },
  { value: 'RECEPCIONES', label: 'Recepciones', icon: 'PackageOpen' },
];

export function ReportBuilder() {
  const [reportType, setReportType] = useState('STOCK');
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [productoId, setProductoId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [formato, setFormato] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const { data: products } = useQuery({
    queryKey: ['products', 'list'],
    queryFn: () => productsApi.getAll({ limit: 100 }),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers', 'list'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  });

  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['report', reportType, fechaInicio, fechaFin, productoId, clienteId],
    queryFn: () => {
      const params: any = {
        formato: 'json',
        fechaInicio: fechaInicio?.toISOString(),
        fechaFin: fechaFin?.toISOString(),
        productoId: productoId || undefined,
        clienteId: clienteId || undefined,
      };

      switch (reportType) {
        case 'STOCK':
          return reportsApi.getStockReport(params);
        case 'CADUCIDADES':
          return reportsApi.getExpiryReport(params);
        case 'EXPEDICIONES':
          return reportsApi.getShipmentReport(params);
        default:
          return reportsApi.getStockReport(params);
      }
    },
  });

  const handleGenerate = () => {
    refetch();
    toast({
      title: 'Reporte generado',
      description: 'Los datos se han actualizado',
    });
  };

  const productOptions = products?.data?.data?.map((p: any) => ({
    value: p.id,
    label: `${p.nombre} (${p.sku})`,
  })) || [];

  const customerOptions = customers?.data?.data?.map((c: any) => ({
    value: c.id,
    label: `${c.nombre} (${c.codigo})`,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
            <Filter className="h-5 w-5 text-primary" />
            Configurar Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Desde</Label>
              <DatePicker date={fechaInicio} onChange={setFechaInicio} placeholder="Fecha inicio" />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Hasta</Label>
              <DatePicker date={fechaFin} onChange={setFechaFin} placeholder="Fecha fin" />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Producto</Label>
              <Combobox
                options={productOptions}
                value={productoId}
                onChange={setProductoId}
                placeholder="Todos"
                searchPlaceholder="Buscar producto..."
                emptyText="Sin resultados"
              />
            </div>

            {(reportType === 'EXPEDICIONES') && (
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Cliente</Label>
                <Combobox
                  options={customerOptions}
                  value={clienteId}
                  onChange={setClienteId}
                  placeholder="Todos"
                  searchPlaceholder="Buscar cliente..."
                  emptyText="Sin resultados"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={handleGenerate} className="gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Generar
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading} className="dark:border-gray-700">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2 dark:border-gray-700"
              >
                <Table2 className="h-4 w-4" />
                Tabla
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
                className="gap-2 dark:border-gray-700"
              >
                <BarChart3 className="h-4 w-4" />
                Gráfico
              </Button>
              <ReportExport
                reportType={reportType}
                filters={{
                  fechaInicio: fechaInicio?.toISOString(),
                  fechaFin: fechaFin?.toISOString(),
                  productoId,
                  clienteId,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {isLoading ? (
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <EmptyState
          icon={<BarChart3 className="h-10 w-10" />}
          title="Error al generar reporte"
          description="No se pudieron obtener los datos"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : reportData?.data ? (
        <>
          {viewMode === 'table' ? (
            <ReportTable data={reportData.data.data || reportData.data} reportType={reportType} />
          ) : (
            <ReportChart data={reportData.data.data || reportData.data} reportType={reportType} />
          )}
        </>
      ) : null}
    </div>
  );
}