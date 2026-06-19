'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports.api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileType,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface ReportExportProps {
  reportType: string;
  filters: Record<string, any>;
}

export function ReportExport({ reportType, filters }: ReportExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = useMutation({
    mutationFn: async (formato: 'pdf' | 'excel' | 'csv') => {
      setIsExporting(true);
      const params = { ...filters, formato };

      let response;
      switch (reportType) {
        case 'STOCK':
          response = await reportsApi.getStockReport(params);
          break;
        case 'CADUCIDADES':
          response = await reportsApi.getExpiryReport(params);
          break;
        case 'EXPEDICIONES':
          response = await reportsApi.getShipmentReport(params);
          break;
        default:
          response = await reportsApi.getStockReport(params);
      }
      return { response, formato };
    },
    onSuccess: ({ response, formato }) => {
      const blob = response.data instanceof Blob 
        ? response.data 
        : new Blob([response.data], {
            type: formato === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : formato === 'csv'
              ? 'text/csv'
              : 'application/pdf',
          });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.${formato}`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Reporte exportado',
        description: `Archivo ${formato.toUpperCase()} descargado exitosamente`,
        variant: 'success',
      });
    },
    onError: async (error: any) => {
      let message = 'Error al generar el archivo';
      
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          message = json.error?.message || json.message || message;
        } catch (_) {
          // Keep generic error if parsing fails
        }
      } else if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: 'Error al exportar',
        description: message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsExporting(false);
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 dark:border-gray-700" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 dark:border-gray-700 dark:bg-gray-900">
        <DropdownMenuLabel className="dark:text-gray-300">Formato</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => exportMutation.mutate('pdf')}
          className="cursor-pointer gap-2 dark:hover:bg-gray-800"
        >
          <FileText className="h-4 w-4 text-red-500" />
          <span className="dark:text-gray-200">PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportMutation.mutate('excel')}
          className="cursor-pointer gap-2 dark:hover:bg-gray-800"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-500" />
          <span className="dark:text-gray-200">Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportMutation.mutate('csv')}
          className="cursor-pointer gap-2 dark:hover:bg-gray-800"
        >
          <FileType className="h-4 w-4 text-blue-500" />
          <span className="dark:text-gray-200">CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}