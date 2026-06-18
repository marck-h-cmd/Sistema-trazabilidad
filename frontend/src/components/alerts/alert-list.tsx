'use client';

import * as React from 'react';
import { Alert, AlertStatus, AlertSeverity, AlertType } from '@/types/alert.types';
import { AlertCard } from './alert-card';
import { SearchInput } from '@/components/shared/search-input';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { AlertOctagon, SlidersHorizontal, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AlertListProps {
  /** Lista de alertas a visualizar */
  alerts: Alert[];
  /** Indica si se está cargando la lista de alertas */
  isLoading?: boolean;
  /** Callback opcional al hacer clic en resolver una alerta */
  onResolveAlert?: (alert: Alert) => void;
  /** Clase CSS adicional para el contenedor principal */
  className?: string;
}

/**
 * Componente AlertList
 * Listado premium de alertas sanitarias y de calidad con barra de búsqueda,
 * filtros avanzados responsivos y estados de carga e interactividad adaptados.
 */
export function AlertList({
  alerts,
  isLoading = false,
  onResolveAlert,
  className,
}: AlertListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [selectedType, setSelectedType] = React.useState<string>('ALL');
  const [showFilters, setShowFilters] = React.useState(false);

  // Filtrar alertas según la selección del usuario
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      // Búsqueda por texto (código, título, descripción, código de lote)
      const matchesSearch =
        searchQuery === '' ||
        alert.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alert.lote?.codigo || alert.loteId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (alert.lote?.producto?.nombre || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Filtrado por severidad
      const matchesSeverity =
        selectedSeverity === 'ALL' || alert.severidad === selectedSeverity;

      // Filtrado por estado
      const matchesStatus =
        selectedStatus === 'ALL' || alert.estado === selectedStatus;

      // Filtrado por tipo de incidente
      const matchesType =
        selectedType === 'ALL' || alert.tipo === selectedType;

      return matchesSearch && matchesSeverity && matchesStatus && matchesType;
    });
  }, [alerts, searchQuery, selectedSeverity, selectedStatus, selectedType]);

  const activeAlertsCount = React.useMemo(() => {
    return alerts.filter((a) => a.estado === 'ABIERTA' || a.estado === 'INVESTIGANDO').length;
  }, [alerts]);

  const criticalAlertsCount = React.useMemo(() => {
    return alerts.filter((a) => a.severidad === 'CRITICO' && (a.estado === 'ABIERTA' || a.estado === 'INVESTIGANDO')).length;
  }, [alerts]);

  if (isLoading) {
    return <LoadingState variant="skeleton" skeletonType="list" count={4} text="Cargando alertas..." />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Resumen de alertas (Tarjetas de KPI rápidas) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-4 bg-white shadow-sm flex items-center gap-4 dark:bg-gray-900/40 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive dark:bg-red-950/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 font-medium">Incidentes Críticos Activos</p>
            <h4 className="text-xl font-bold text-foreground mt-0.5">{criticalAlertsCount}</h4>
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-white shadow-sm flex items-center gap-4 dark:bg-gray-900/40 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning dark:bg-amber-950/20">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 font-medium">Total Alertas en Investigación</p>
            <h4 className="text-xl font-bold text-foreground mt-0.5">{activeAlertsCount}</h4>
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-white shadow-sm flex items-center gap-4 dark:bg-gray-900/40 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success dark:bg-green-950/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-400 font-medium">Alertas Resueltas</p>
            <h4 className="text-xl font-bold text-foreground mt-0.5">
              {alerts.filter((a) => a.estado === 'RESUELTA' || a.estado === 'CERRADA').length}
            </h4>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtrado */}
      <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-4 dark:bg-gray-900/40 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SearchInput
            placeholder="Buscar por código, lote, producto..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto h-10 gap-2 border-muted-foreground/20 rounded-xl"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {(selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL') && (
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            )}
          </Button>
        </div>

        {/* Filtros avanzados expandibles */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-muted-foreground/10 sm:grid-cols-3 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                Criticidad
              </label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las severidades</SelectItem>
                  <SelectItem value="CRITICO">Crítico (Bloqueo/Retirada)</SelectItem>
                  <SelectItem value="AVISO">Aviso (Calidad)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                Estado
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="ABIERTA">Abierta</SelectItem>
                  <SelectItem value="INVESTIGANDO">En Investigación</SelectItem>
                  <SelectItem value="RESUELTA">Resuelta</SelectItem>
                  <SelectItem value="CERRADA">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                Tipo de Incidente
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los tipos</SelectItem>
                  <SelectItem value="CONTAMINACION">Contaminación</SelectItem>
                  <SelectItem value="CUERPO_EXTRAÑO">Cuerpo Extraño</SelectItem>
                  <SelectItem value="ETIQUETADO">Error de Etiquetado</SelectItem>
                  <SelectItem value="CALIDAD">Calidad</SelectItem>
                  <SelectItem value="INCUMPLIMIENTO_ESPECIFICACIONES">Incumplimiento de Especificaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Listado de Tarjetas */}
      {filteredAlerts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolveClick={onResolveAlert}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<AlertOctagon className="h-10 w-10 text-muted-foreground" />}
          title="No se encontraron alertas"
          description={
            searchQuery || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL'
              ? 'Intenta cambiar los parámetros de búsqueda o restablecer los filtros.'
              : 'No hay alertas de calidad registradas en el sistema actualmente.'
          }
          action={
            searchQuery || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL'
              ? {
                  label: 'Limpiar filtros',
                  onClick: () => {
                    setSearchQuery('');
                    setSelectedSeverity('ALL');
                    setSelectedStatus('ALL');
                    setSelectedType('ALL');
                  },
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
