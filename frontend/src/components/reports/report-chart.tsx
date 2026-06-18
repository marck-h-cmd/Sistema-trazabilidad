'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  Package, 
  Clock, 
  Truck,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportChartProps {
  data: any;
  reportType: string;
  className?: string;
}

const COLORS = ['#F97316', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

const REPORT_ICONS: Record<string, any> = {
  STOCK: Package,
  CADUCIDADES: Clock,
  EXPEDICIONES: Truck,
};

export function ReportChart({ data, reportType, className }: ReportChartProps) {
  const Icon = REPORT_ICONS[reportType] || BarChart3;

  const renderStockChart = () => {
    const chartData = Array.isArray(data)
      ? data.map((item: any) => ({
          name: item.producto,
          cantidad: item.cantidadTotal,
          categoria: item.categoria,
        }))
      : [];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11, fill: '#6B7280' }}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }}
          />
          <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} fill="#F97316" name="Cantidad" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderExpiryChart = () => {
    if (!data?.resumen) return null;
    const pieData = [
      { name: 'Vencidos', value: data.resumen.vencidos || 0, color: '#EF4444' },
      { name: 'Próximos 7 días', value: data.resumen.proximos7Dias || 0, color: '#F59E0B' },
      { name: 'Próximos 15 días', value: data.resumen.proximos15Dias || 0, color: '#F97316' },
      { name: 'Próximos 30 días', value: data.resumen.proximos30Dias || 0, color: '#3B82F6' },
    ].filter(d => d.value > 0);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={140}
            innerRadius={60}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderShipmentChart = () => {
    if (!data?.resumen) return null;
    const pieData = [
      { name: 'Entregadas', value: data.resumen.totalEntregadas || 0, color: '#22C55E' },
      { name: 'En Tránsito', value: data.resumen.totalEnTransito || 0, color: '#3B82F6' },
      { name: 'Canceladas', value: data.resumen.totalCanceladas || 0, color: '#EF4444' },
    ].filter(d => d.value > 0);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={140}
            innerRadius={60}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const noData = reportType === 'STOCK'
    ? !Array.isArray(data) || data.length === 0
    : reportType === 'CADUCIDADES'
    ? !data?.resumen || Object.values(data.resumen).every((v: any) => v === 0)
    : !data?.resumen || Object.values(data.resumen).every((v: any) => v === 0);

  return (
    <Card className={cn('dark:border-gray-800 dark:bg-gray-900', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <Icon className="h-5 w-5 text-primary" />
          Gráfico del Reporte
        </CardTitle>
      </CardHeader>
      <CardContent>
        {noData ? (
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground dark:text-gray-500">
            No hay datos suficientes para mostrar el gráfico
          </div>
        ) : (
          <>
            {reportType === 'STOCK' && renderStockChart()}
            {reportType === 'CADUCIDADES' && renderExpiryChart()}
            {reportType === 'EXPEDICIONES' && renderShipmentChart()}
          </>
        )}
      </CardContent>
    </Card>
  );
}