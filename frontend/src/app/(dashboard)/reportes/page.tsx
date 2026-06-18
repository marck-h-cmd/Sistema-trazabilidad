'use client';

import { ReportBuilder } from '@/components/reports/report-builder';
import { ReportScheduler } from '@/components/reports/report-scheduler';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock,
} from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Genere y programe reportes del sistema"
      />

      <Tabs defaultValue="generator" className="w-full">
        <TabsList>
          <TabsTrigger value="generator" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="h-4 w-4" />
            Programados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="mt-4">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <ReportScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
}