'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Package } from 'lucide-react';

interface StockChartProps {
  data?: { categoria: string; cantidad: number }[];
  isLoading?: boolean;
}

const COLORS: Record<string, string> = {
  MATERIA_PRIMA: '#3B82F6',
  PRODUCTO_TERMINADO: '#22C55E',
  ENVASE: '#F59E0B',
  SEMIELABORADO: '#8B5CF6',
};

const CATEGORY_LABELS: Record<string, string> = {
  MATERIA_PRIMA: 'Materia Prima',
  PRODUCTO_TERMINADO: 'Prod. Terminado',
  ENVASE: 'Envases',
  SEMIELABORADO: 'Semielaborado',
};

export function StockChart({ data, isLoading }: StockChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[320px] rounded-xl" />;
  }

  const chartData = data?.map((item) => ({
    ...item,
    label: CATEGORY_LABELS[item.categoria] || item.categoria,
  })) || [];

  const totalStock = chartData.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
            <Package className="h-4 w-4 text-primary" />
            Stock por Categoría
          </CardTitle>
          <span className="text-sm text-muted-foreground dark:text-gray-400">
            Total: {totalStock.toLocaleString('es-ES')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground dark:text-gray-500">
            No hay datos de stock disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [value.toLocaleString('es-ES'), 'Cantidad']}
              />
              <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.categoria] || '#6B7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}