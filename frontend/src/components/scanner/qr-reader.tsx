'use client';

import { useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { CameraViewfinder } from './camera-viewfinder';
import { ScannerResult } from './scanner-result';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { QrCode, Camera, StopCircle, FlipHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRReaderProps {
  onScan: (url: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

export function QRReader({ onScan, onError, onClose, className }: QRReaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const scannerDivId = `qr-reader-${Math.random().toString(36).substring(7)}`;

  const startScanner = useCallback(async () => {
    setIsLoading(true);
    try {
      const scanner = new Html5Qrcode(scannerDivId, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setLastResult(decodedText);
          scanner.stop().catch(console.error);
          setIsScanning(false);
          onScan(decodedText);
          toast({
            title: 'QR detectado',
            description: 'Código QR leído correctamente',
          });
        },
        () => {}
      );

      setHtml5QrCode(scanner);
      setIsScanning(true);
    } catch (error: any) {
      onError?.(error.message);
      toast({
        title: 'Error',
        description: 'No se pudo acceder a la cámara',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [onScan, onError]);

  const stopScanner = useCallback(async () => {
    if (html5QrCode) {
      await html5QrCode.stop();
      setHtml5QrCode(null);
    }
    setIsScanning(false);
  }, [html5QrCode]);

  const toggleCamera = useCallback(async () => {
    await stopScanner();
    setTimeout(() => startScanner(), 300);
  }, [stopScanner, startScanner]);

  return (
    <div className={cn('space-y-4', className)}>
      <CameraViewfinder isActive={isScanning} isLoading={isLoading}>
        <div id={scannerDivId} className="h-full w-full" />
      </CameraViewfinder>

      <div className="flex flex-wrap items-center gap-2">
        {!isScanning ? (
          <Button onClick={startScanner} className="gap-2" size="lg" disabled={isLoading}>
            <QrCode className="h-5 w-5" />
            {isLoading ? 'Iniciando...' : 'Escanear QR'}
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="destructive" className="gap-2" size="lg">
            <StopCircle className="h-5 w-5" />
            Detener
          </Button>
        )}

        <Button onClick={toggleCamera} variant="outline" size="lg" className="gap-2 dark:border-gray-700" disabled={!isScanning}>
          <FlipHorizontal className="h-5 w-5" />
          Girar Cámara
        </Button>

        {onClose && (
          <Button onClick={onClose} variant="ghost" size="lg" className="ml-auto dark:hover:bg-gray-800">
            Cerrar
          </Button>
        )}
      </div>

      {lastResult && (
        <ScannerResult
          code={lastResult}
          onClear={() => setLastResult(null)}
          onRescan={() => {
            setLastResult(null);
            startScanner();
          }}
        />
      )}
    </div>
  );
}