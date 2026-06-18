'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wheat, 
  CheckCircle2, 
  Calendar, 
  Package, 
  AlertCircle,
  Clock,
  Shield,
  Leaf,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PublicTraceabilityViewProps {
  data: {
    producto?: {
      nombre?: string;
      descripcion?: string;
      categoria?: string;
    };
    lote?: {
      codigo?: string;
      fechaProduccion?: string;
      fechaCaducidad?: string;
      fechaEnvasado?: string;
    };
    ingredientes?: string[];
    alergenos?: string[];
    informacionNutricional?: Record<string, string> | null;
    sellosCalidad?: string[];
  };
  className?: string;
}

export function PublicTraceabilityView({ data, className }: PublicTraceabilityViewProps) {
  if (!data) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header del producto */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
          <Wheat className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">
          {data.producto?.nombre || 'Producto'}
        </h1>
        {data.producto?.descripcion && (
          <p className="mt-2 text-muted-foreground dark:text-gray-400 max-w-md mx-auto">
            {data.producto.descripcion}
          </p>
        )}
      </div>

      {/* Información del lote */}
      <Card className="border-0 shadow-xl dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-4 text-center dark:bg-gray-800">
              <Calendar className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground dark:text-gray-500">Producción</p>
              <p className="mt-1 font-semibold text-sm dark:text-gray-200">
                {data.lote?.fechaProduccion
                  ? format(new Date(data.lote.fechaProduccion), 'dd/MM/yyyy')
                  : 'N/D'}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center dark:bg-gray-800">
              <Clock className="mx-auto mb-2 h-5 w-5 text-amber-500" />
              <p className="text-xs text-muted-foreground dark:text-gray-500">Caducidad</p>
              <p className="mt-1 font-semibold text-sm text-amber-600 dark:text-amber-400">
                {data.lote?.fechaCaducidad
                  ? format(new Date(data.lote.fechaCaducidad), 'dd/MM/yyyy')
                  : 'N/D'}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center dark:bg-gray-800">
              <Package className="mx-auto mb-2 h-5 w-5 text-blue-500" />
              <p className="text-xs text-muted-foreground dark:text-gray-500">Envasado</p>
              <p className="mt-1 font-semibold text-sm dark:text-gray-200">
                {data.lote?.fechaEnvasado
                  ? format(new Date(data.lote.fechaEnvasado), 'dd/MM/yyyy')
                  : 'N/D'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredientes */}
      {data.ingredientes && data.ingredientes.length > 0 && (
        <Card className="border-0 shadow-xl dark:bg-gray-900">
          <CardContent className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold dark:text-gray-200">
              <Package className="h-4 w-4 text-primary" />
              Ingredientes
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.ingredientes.map((ing: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs dark:bg-gray-800 dark:text-gray-300">
                  {ing}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alérgenos */}
      {data.alergenos && data.alergenos.length > 0 && (
        <Card className="border-0 shadow-xl border-l-4 border-l-red-500 dark:bg-gray-900">
          <CardContent className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              Alérgenos
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.alergenos.map((alergeno: string, i: number) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {alergeno}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Nutricional */}
      {data.informacionNutricional && Object.keys(data.informacionNutricional).length > 0 && (
        <Card className="border-0 shadow-xl dark:bg-gray-900">
          <CardContent className="p-6">
            <h3 className="mb-3 text-sm font-semibold dark:text-gray-200">
              Información Nutricional (por 100g)
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(data.informacionNutricional).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-muted/50 px-3 py-2 dark:bg-gray-800">
                  <p className="text-xs text-muted-foreground dark:text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="font-semibold text-sm dark:text-gray-200">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sellos de Calidad */}
      {data.sellosCalidad && data.sellosCalidad.length > 0 && (
        <Card className="border-0 shadow-xl dark:bg-gray-900">
          <CardContent className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold dark:text-gray-200">
              <Award className="h-4 w-4 text-primary" />
              Sellos de Calidad
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.sellosCalidad.map((sello: string, i: number) => (
                <Badge key={i} className="bg-green-100 text-green-800 text-xs dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {sello}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center pb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 dark:bg-gray-800">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground dark:text-gray-400">
            Trazabilidad verificada • {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}
          </span>
        </div>
      </div>
    </div>
  );
}