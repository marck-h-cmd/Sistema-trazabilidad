'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/lib/api/labels.api';
import { productsApi } from '@/lib/api/products.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { Combobox } from '@/components/ui/combobox';
import { 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  LayoutTemplate,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AVAILABLE_FIELDS = [
  { value: 'nombre_producto', label: 'Nombre del Producto' },
  { value: 'codigo_lote', label: 'Código de Lote' },
  { value: 'fecha_produccion', label: 'Fecha de Producción' },
  { value: 'fecha_caducidad', label: 'Fecha de Caducidad' },
  { value: 'codigo_barras', label: 'Código de Barras' },
  { value: 'codigo_qr', label: 'Código QR' },
  { value: 'peso', label: 'Peso' },
  { value: 'ingredientes', label: 'Ingredientes' },
  { value: 'alergenos', label: 'Alérgenos' },
  { value: 'informacion_nutricional', label: 'Info. Nutricional' },
  { value: 'sello_calidad', label: 'Sello de Calidad' },
];

export function LabelTemplateDesigner() {
  const queryClient = useQueryClient();
  const [selectedFields, setSelectedFields] = useState<string[]>(['nombre_producto', 'codigo_lote']);
  const [templateName, setTemplateName] = useState('');
  const [productoId, setProductoId] = useState('');
  const [labelType, setLabelType] = useState<'CODE_128' | 'QR' | 'AMBOS'>('CODE_128');
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(30);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['label-templates'],
    queryFn: () => labelsApi.getTemplates(),
  });

  const { data: products } = useQuery({
    queryKey: ['products-pt'],
    queryFn: () => productsApi.getByCategory('PRODUCTO_TERMINADO'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => labelsApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-templates'] });
      toast({ title: 'Plantilla creada', variant: 'success' });
      resetForm();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.error?.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labelsApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-templates'] });
      toast({ title: 'Plantilla eliminada', variant: 'success' });
    },
  });

  const resetForm = () => {
    setTemplateName('');
    setProductoId('');
    setSelectedFields(['nombre_producto', 'codigo_lote']);
    setLabelType('CODE_128');
    setWidth(50);
    setHeight(30);
  };

  const handleCreate = () => {
    if (!templateName || !productoId || selectedFields.length === 0) {
      toast({ title: 'Complete todos los campos', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      nombre: templateName,
      productoId,
      tipo: labelType,
      anchoMm: width,
      altoMm: height,
      camposIncluidos: selectedFields,
    });
  };

  const toggleField = (fieldValue: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldValue)
        ? prev.filter((f) => f !== fieldValue)
        : [...prev, fieldValue]
    );
  };

  const productOptions = products?.data?.data?.map((p: any) => ({
    value: p.id,
    label: `${p.nombre} (${p.sku})`,
  })) || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Diseñador */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Nueva Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Nombre *</Label>
            <Input
              placeholder="Ej: Etiqueta Pan Integral"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Producto *</Label>
            <Combobox
              options={productOptions}
              value={productoId}
              onChange={setProductoId}
              placeholder="Seleccionar producto"
              searchPlaceholder="Buscar producto..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Tipo</Label>
              <Select value={labelType} onValueChange={(v) => setLabelType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE_128">Code 128</SelectItem>
                  <SelectItem value="QR">QR</SelectItem>
                  <SelectItem value="AMBOS">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Ancho (mm)</Label>
                <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Alto (mm)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Campos incluidos</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FIELDS.map((field) => (
                <Badge
                  key={field.value}
                  variant={selectedFields.includes(field.value) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedFields.includes(field.value)
                      ? 'bg-primary text-white hover:bg-primary/80'
                      : 'dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary'
                  )}
                  onClick={() => toggleField(field.value)}
                >
                  {selectedFields.includes(field.value) && <Check className="mr-1 h-3 w-3" />}
                  {field.label}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Plantilla
          </Button>
        </CardContent>
      </Card>

      {/* Lista de plantillas */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg dark:text-gray-100">
            Plantillas Existentes ({templates?.data?.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted dark:bg-gray-800" />
              ))}
            </div>
          ) : templates?.data?.data?.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground dark:text-gray-500">
              No hay plantillas creadas
            </div>
          ) : (
            <div className="space-y-2">
              {templates?.data?.data?.map((template: any) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
                >
                  <div>
                    <p className="text-sm font-medium dark:text-gray-200">{template.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs dark:border-gray-600">
                        {template.tipo}
                      </Badge>
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        {template.anchoMm}x{template.altoMm}mm
                      </span>
                      <span className="text-xs text-muted-foreground dark:text-gray-500">
                        {template.camposIncluidos?.length || 0} campos
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}