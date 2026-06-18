'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Combobox } from '@/components/ui/combobox';
import { productsApi } from '@/lib/api/products.api';
import { 
  Factory, 
  Plus, 
  Pencil,
  Trash2,
  Barcode,
  Save,
  Loader2,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LineasProduccionConfigPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lineToDelete, setLineToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({ codigo: '', nombre: '', descripcion: '', codigoBarras: '', productoId: '' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['production-lines-config'],
    queryFn: () => api.get('/lineas-produccion').then(r => r.data.data),
  });

  const { data: products } = useQuery({
    queryKey: ['products-pt-list'],
    queryFn: () => productsApi.getByCategory('PRODUCTO_TERMINADO'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      selectedLine
        ? api.put(`/lineas-produccion/${selectedLine.id}`, data)
        : api.post('/lineas-produccion', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-lines-config'] });
      toast({ title: selectedLine ? 'Línea actualizada' : 'Línea creada', variant: 'success' });
      setShowForm(false);
      resetForm();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/lineas-produccion/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['production-lines-config'] }); toast({ title: 'Línea eliminada', variant: 'success' }); },
  });

  const lines = data || [];

  const resetForm = () => {
    setFormData({ codigo: '', nombre: '', descripcion: '', codigoBarras: '', productoId: '' });
    setSelectedLine(null);
  };

  const handleEdit = (line: any) => {
    setSelectedLine(line);
    setFormData({
      codigo: line.codigo,
      nombre: line.nombre,
      descripcion: line.descripcion || '',
      codigoBarras: line.codigoBarras || '',
      productoId: line.productos?.[0]?.productoId || '',
    });
    setShowForm(true);
  };

  const productOptions = products?.data?.data?.map((p: any) => ({ value: p.id, label: `${p.nombre} (${p.sku})` })) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Líneas de Producción" description="Administre las líneas y códigos de barras fijos">
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Nueva Línea</Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : isError ? (
        <EmptyState icon={<Factory className="h-10 w-10" />} title="Error" action={{ label: 'Reintentar', onClick: () => refetch() }} />
      ) : lines.length === 0 ? (
        <EmptyState icon={<Factory className="h-10 w-10" />} title="Sin líneas" action={{ label: 'Nueva', onClick: () => { resetForm(); setShowForm(true); } }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map((line: any) => (
            <Card key={line.id} className="dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-primary">{line.codigo}</span>
                    {line.codigoBarras && <Barcode className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <CardTitle className="text-base mt-1 dark:text-gray-100">{line.nombre}</CardTitle>
                  {line.descripcion && <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{line.descripcion}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(line)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => { setLineToDelete(line); setShowDeleteConfirm(true); }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {line.productos?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {line.productos.map((lp: any) => (
                      <Badge key={lp.id} variant="secondary" className="text-xs dark:bg-gray-800">{lp.producto?.nombre || 'Producto'}</Badge>
                    ))}
                  </div>
                )}
                {line.codigoBarras && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground dark:text-gray-500">Cód. Barras: {line.codigoBarras}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader><DialogTitle className="dark:text-gray-100">{selectedLine ? 'Editar' : 'Nueva'} Línea</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="dark:text-gray-300">Código *</Label><Input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} placeholder="L1" /></div>
              <div className="space-y-2"><Label className="dark:text-gray-300">Cód. Barras</Label><Input value={formData.codigoBarras} onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })} placeholder="LINEA-L1-001" /></div>
            </div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Nombre *</Label><Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Descripción</Label><Input value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} /></div>
            <div className="space-y-2"><Label className="dark:text-gray-300">Producto por defecto</Label><Combobox options={productOptions} value={formData.productoId} onChange={(v) => setFormData({ ...formData, productoId: v })} placeholder="Seleccionar producto" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {selectedLine ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} title="Eliminar" description={`¿Eliminar línea ${lineToDelete?.codigo}?`} confirmLabel="Eliminar" variant="destructive" onConfirm={() => lineToDelete && deleteMutation.mutate(lineToDelete.id)} isLoading={deleteMutation.isPending} />
    </div>
  );
}