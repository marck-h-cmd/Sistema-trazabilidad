'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ExpiryAlerts } from '@/components/dashboard/expiry-alerts';
import { StockChart } from '@/components/dashboard/stock-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { AlertsSummary } from '@/components/dashboard/alerts-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentReceptions } from '@/components/dashboard/recent-receptions';
import { RecentProductions } from '@/components/dashboard/recent-productions';
import { RecentShipments } from '@/components/dashboard/recent-shipments';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    refetch: refetchKPIs,
  } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardApi.getKPIs(),
    refetchInterval: 30000,
  });

  if (kpisError) {
    return (
      <EmptyState
        icon={<LayoutDashboard className="h-10 w-10" />}
        title="Error al cargar el dashboard"
        description="No se pudieron cargar los datos. Intente nuevamente."
        action={{ label: 'Reintentar', onClick: () => refetchKPIs() }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={today}
      >
        <Button variant="outline" size="sm" onClick={() => refetchKPIs()} className="dark:border-gray-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </PageHeader>

      {/* KPIs Principales */}
      <StatsCards data={kpis?.data} isLoading={kpisLoading} />

      {/* Contenido principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda - Gráfico y actividad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de stock */}
          {kpisLoading ? (
            <Skeleton className="h-[320px] rounded-xl" />
          ) : (
            <StockChart data={kpis?.data?.stockPorCategoria} />
          )}

          {/* Actividad reciente */}
          <ActivityFeed />

          {/* Últimas operaciones */}
          <div className="grid gap-6 lg:grid-cols-3">
            <RecentReceptions />
            <RecentProductions />
            <RecentShipments />
          </div>
        </div>

        {/* Columna derecha - Alertas y acciones */}
        <div className="space-y-6">
          {/* Caducidades */}
          <ExpiryAlerts
            lotesPorVencer={kpis?.data?.lotesPorVencer || 0}
            lotesVencidos={kpis?.data?.lotesVencidos || 0}
            isLoading={kpisLoading}
          />

          {/* Alertas activas */}
          <AlertsSummary
            alertasActivas={kpis?.data?.alertasActivas || 0}
            isLoading={kpisLoading}
          />

          {/* Acciones rápidas */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}