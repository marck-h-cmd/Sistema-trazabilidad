'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { traceabilityApi } from '@/lib/api/traceability.api';
import { PageHeader } from '@/components/shared/page-header';
import { BarcodeScanner } from '@/components/scanner/barcode-scanner';
import { ScannerResult } from '@/components/scanner/scanner-result';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { useScannerStore } from '@/stores/scanner.store';
import { productsApi } from '@/lib/api/products.api';
import { 
  GitBranch, 
  Search, 
  Camera,
  Keyboard,
  QrCode,
  ArrowRight,
  Loader2,
  Package,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const searchSchema = z.object({
  codigo: z.string().min(1, 'Ingrese un código de lote'),
});

type SearchForm = z.infer<typeof searchSchema>;

export default function TrazabilidadPage() {
  const router = useRouter();
  const { mode, toggleMode } = useScannerStore();
  const [showScanner, setShowScanner] = useState(false);
  const [searchType, setSearchType] = useState<'codigo' | 'filtros'>('codigo');
  const [productoId, setProductoId] = useState('');
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();

  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ limit: 100, activo: true }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
  });

  const [lastSearches] = useState<string[]>([
    'L260625L301',
    'L260625L201',
    'L260624L101',
  ]);

  const onSubmit = (data: SearchForm) => {
    router.push(`/trazabilidad/${data.codigo}`);
  };

  const handleBarcodeScan = (code: string) => {
    setValue('codigo', code);
    setShowScanner(false);
    toast({
      title: 'Código detectado',
      description: `Lote: ${code}`,
    });
    router.push(`/trazabilidad/${code}`);
  };

  const handleFilterSearch = () => {
    const params = new URLSearchParams();
    if (productoId) params.set('productoId', productoId);
    if (fechaDesde) params.set('fechaDesde', fechaDesde.toISOString());
    if (fechaHasta) params.set('fechaHasta', fechaHasta.toISOString());
    router.push(`/trazabilidad?${params.toString()}`);
  };

  const productOptions = products?.data?.data?.map((p: any) => ({
    value: p.id,
    label: `${p.nombre} (${p.sku})`,
  })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trazabilidad"
        description="Consulte el historial completo de cualquier lote"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="gap-2 dark:border-gray-700"
          >
            {mode === 'scan' ? (
              <>
                <Camera className="h-4 w-4 text-green-500" />
                Modo Escaneo
              </>
            ) : (
              <>
                <Keyboard className="h-4 w-4 text-blue-500" />
                Modo Manual
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de búsqueda */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="codigo" className="gap-2">
                <Search className="h-4 w-4" />
                Por Código
              </TabsTrigger>
              <TabsTrigger value="filtros" className="gap-2">
                <GitBranch className="h-4 w-4" />
                Por Filtros
              </TabsTrigger>
            </TabsList>

            <TabsContent value="codigo" className="mt-4">
              <Card className="dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                    <QrCode className="h-5 w-5 text-primary" />
                    Buscar Lote por Código
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Escáner */}
                  {showScanner && (
                    <div className="mb-4 overflow-hidden rounded-xl border-2 border-primary/30 dark:border-primary/50">
                      <BarcodeScanner
                        onScan={handleBarcodeScan}
                        onClose={() => setShowScanner(false)}
                      />
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Código de Lote</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Ej: L260625L301"
                            className="pl-9 font-mono text-lg"
                            autoFocus
                            {...register('codigo')}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="dark:border-gray-700"
                          onClick={() => setShowScanner(!showScanner)}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.codigo && (
                        <p className="text-xs text-destructive">{errors.codigo.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full gap-2" size="lg">
                      <Search className="h-4 w-4" />
                      Buscar Trazabilidad
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filtros" className="mt-4">
              <Card className="dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Buscar por Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Producto</Label>
                    <Combobox
                      options={productOptions}
                      value={productoId}
                      onChange={setProductoId}
                      placeholder="Todos los productos"
                      searchPlaceholder="Buscar producto..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Desde</Label>
                      <DatePicker date={fechaDesde} onChange={setFechaDesde} placeholder="Fecha inicio" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Hasta</Label>
                      <DatePicker date={fechaHasta} onChange={setFechaHasta} placeholder="Fecha fin" />
                    </div>
                  </div>
                  <Button className="w-full gap-2" size="lg" onClick={handleFilterSearch}>
                    <Search className="h-4 w-4" />
                    Buscar
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Últimas búsquedas */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
                <History className="h-4 w-4 text-muted-foreground" />
                Búsquedas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastSearches.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground dark:text-gray-500">
                  No hay búsquedas recientes
                </p>
              ) : (
                <div className="space-y-1">
                  {lastSearches.map((code) => (
                    <Link
                      key={code}
                      href={`/trazabilidad/${code}`}
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 dark:hover:bg-gray-800"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                        <QrCode className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-mono text-sm font-semibold dark:text-gray-200">{code}</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-gray-200">Formato de código</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground dark:text-gray-400">
                    L + YYMMDD + Línea + Correlativo
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-primary">
                    Ej: L260625L301
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}