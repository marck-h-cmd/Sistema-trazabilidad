'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Scan, 
  Copy, 
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface ScannerResultProps {
  code: string;
  format?: string;
  onClear?: () => void;
  onRescan?: () => void;
  className?: string;
}

export function ScannerResult({ code, format = 'CODE_128', onClear, onRescan, className }: ScannerResultProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: 'Copiado',
        description: 'Código copiado al portapapeles',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el código',
        variant: 'destructive',
      });
    }
  };

  const formatLabels: Record<string, string> = {
    'CODE_128': 'Code 128',
    'EAN_13': 'EAN-13',
    'EAN_8': 'EAN-8',
    'QR_CODE': 'QR Code',
    'UPC_A': 'UPC-A',
    'UPC_E': 'UPC-E',
  };

  return (
    <Card className={cn(
      'border-2 border-success/50 bg-success/5 animate-fade-in dark:border-green-800 dark:bg-green-900/10',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 dark:bg-green-800/30">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-success dark:text-green-400">
                  Código Detectado
                </p>
                <Badge variant="outline" className="text-xs dark:border-gray-600">
                  {formatLabels[format] || format}
                </Badge>
              </div>
              <p className="font-mono text-xl font-bold tracking-wider text-foreground dark:text-gray-200">
                {code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={copyToClipboard} title="Copiar">
              <Copy className="h-4 w-4" />
            </Button>
            {onRescan && (
              <Button variant="ghost" size="icon-sm" onClick={onRescan} title="Escanear otro">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onClear && (
              <Button variant="ghost" size="icon-sm" onClick={onClear} title="Limpiar" className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}