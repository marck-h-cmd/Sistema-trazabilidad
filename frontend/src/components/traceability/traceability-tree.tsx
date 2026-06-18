'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LotStatusBadge } from '@/components/lots/lot-status-badge';
import { 
  Package, 
  Factory, 
  Truck, 
  Store, 
  ChevronDown, 
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Wheat,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface TraceabilityTreeProps {
  backwardData: any[];
  forwardData: any[];
  lote: any;
  className?: string;
}

interface TreeNodeProps {
  icon: any;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
  badgeColor?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  onClick?: () => void;
}

function TreeNode({ 
  icon: Icon, 
  label, 
  subtitle, 
  badge, 
  badgeVariant = 'outline',
  badgeColor,
  children,
  defaultExpanded = true,
  onClick,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = !!children;

  return (
    <div className="relative">
      <div 
        className={cn(
          'flex items-center gap-3 rounded-lg p-3 transition-all duration-200',
          hasChildren && 'cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-800/50',
          !hasChildren && 'cursor-default'
        )}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onClick?.();
        }}
      >
        {hasChildren && (
          <button className="flex h-5 w-5 items-center justify-center rounded-full bg-muted dark:bg-gray-700">
            {expanded ? (
              <ChevronDown className="h-3 w-3 dark:text-gray-300" />
            ) : (
              <ChevronRight className="h-3 w-3 dark:text-gray-300" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
          badgeColor || 'bg-primary/10 dark:bg-primary/20'
        )}>
          <Icon className="h-5 w-5 text-primary dark:text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate dark:text-gray-200">{label}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        
        {badge && (
          <Badge variant={badgeVariant} className="text-xs flex-shrink-0">
            {badge}
          </Badge>
        )}
      </div>

      {expanded && children && (
        <div className="ml-8 border-l-2 border-dashed border-muted pl-6 dark:border-gray-700">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
}

export function TraceabilityTree({ backwardData, forwardData, lote, className }: TraceabilityTreeProps) {
  return (
    <Card className={cn('dark:border-gray-800 dark:bg-gray-900', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="6" r="2" />
            <path d="M6 8v8" />
            <path d="M18 8c0 4-6 6-12 6" />
          </svg>
          Árbol de Trazabilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Trazabilidad hacia atrás */}
        {backwardData.length > 0 && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-500">
                Trazabilidad hacia atrás ({backwardData.length})
              </p>
            </div>
            {backwardData.map((item, index) => (
              <TreeNode
                key={`backward-${index}`}
                icon={Package}
                label={item.materiaPrima?.nombre || 'Materia Prima'}
                subtitle={`Lote: ${item.loteMateriaPrima?.codigo || 'N/A'} • ${item.cantidadUtilizada || 0} ${item.unidadMedida || ''}`}
                badge={item.proveedor?.nombre || 'Proveedor'}
                badgeVariant="outline"
                badgeColor="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                defaultExpanded={false}
              />
            ))}
            <div className="flex justify-center py-2">
              <ArrowDown className="h-6 w-6 text-muted-foreground dark:text-gray-600" />
            </div>
          </>
        )}

        {/* Lote Principal */}
        <TreeNode
          icon={Factory}
          label={`Lote: ${lote.codigo}`}
          subtitle={`${lote.producto?.nombre || 'Producto'} • ${lote.cantidad || 0} ${lote.unidadMedida || ''}`}
          badge={lote.estado}
          badgeVariant={
            lote.estado === 'ACTIVO' ? 'success' :
            lote.estado === 'VENCIDO' ? 'destructive' :
            lote.estado === 'BLOQUEADO' ? 'destructive' :
            'outline'
          }
          badgeColor={
            lote.estado === 'ACTIVO' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            lote.estado === 'VENCIDO' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            lote.estado === 'BLOQUEADO' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
            'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          }
          defaultExpanded={true}
        />

        {/* Trazabilidad hacia adelante */}
        {forwardData.length > 0 && (
          <>
            <div className="flex justify-center py-2">
              <ArrowDown className="h-6 w-6 text-muted-foreground dark:text-gray-600" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-500">
                Trazabilidad hacia adelante ({forwardData.length})
              </p>
            </div>
            {forwardData.map((item, index) => (
              <TreeNode
                key={`forward-${index}`}
                icon={Store}
                label={item.cliente?.nombre || 'Cliente'}
                subtitle={`Exp: ${item.expedicion?.codigo || 'N/A'} • ${item.cantidadEnviada || 0} ${item.unidadMedida || ''}`}
                badge={item.expedicion?.estado || 'N/A'}
                badgeVariant={
                  item.expedicion?.estado === 'ENTREGADO' ? 'success' :
                  item.expedicion?.estado === 'EN_TRANSITO' ? 'info' :
                  'outline'
                }
                badgeColor={
                  item.expedicion?.estado === 'ENTREGADO' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  item.expedicion?.estado === 'EN_TRANSITO' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }
                defaultExpanded={false}
              />
            ))}
          </>
        )}

        {backwardData.length === 0 && forwardData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FlaskConical className="mb-3 h-10 w-10 text-muted-foreground dark:text-gray-600" />
            <p className="text-sm text-muted-foreground dark:text-gray-500">
              No hay datos de trazabilidad disponibles para este lote
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}