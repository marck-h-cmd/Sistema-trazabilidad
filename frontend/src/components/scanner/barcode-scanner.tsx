'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { CameraViewfinder } from './camera-viewfinder';
import { ScannerResult } from './scanner-result';
import { ScannerSettings } from './scanner-settings';
import { Button } from '@/components/ui/button';
import { useScannerStore } from '@/stores/scanner.store';
import { toast } from '@/components/ui/toast';
import { 
  Camera, 
  StopCircle, 
  FlipHorizontal, 
  Zap, 
  ZapOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
  autoStart?: boolean;
}

export function BarcodeScanner({ onScan, onError, onClose, className, autoStart = false }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(autoStart);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = useRef(`barcode-scanner-${Math.random().toString(36).substring(7)}`);
  const { cameraFacing, torchEnabled, toggleTorch, setCameraFacing } = useScannerStore();

  const startScanner = useCallback(async () => {
    setIsLoading(true);
    try {
      const formats = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5QrCode = new Html5Qrcode(scannerDivId.current, { formatsToSupport: formats, verbose: false });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: cameraFacing },
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
        },
        (decodedText) => {
          setLastResult(decodedText);
          html5QrCode.stop().catch(console.error);
          setIsScanning(false);
          onScan(decodedText);
          toast({
            title: 'Código detectado',
            description: decodedText,
          });
        },
        () => {
          // Ignorar errores de escaneo parcial
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      console.error('Error iniciando escáner:', error);
      onError?.(error.message || 'Error al iniciar la cámara');
      toast({
        title: 'Error',
        description: 'No se pudo acceder a la cámara. Verifique los permisos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [cameraFacing, onScan, onError]);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch (error) {
      console.error('Error deteniendo escáner:', error);
    }
    setIsScanning(false);
  }, []);

  const toggleCamera = useCallback(async () => {
    await stopScanner();
    setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment');
    setTimeout(() => startScanner(), 500);
  }, [cameraFacing, stopScanner, startScanner, setCameraFacing]);

  const handleTorchToggle = useCallback(async () => {
    try {
      if (scannerRef.current) {
        // Intentar aplicar torch si está disponible
        const capabilities = await scannerRef.current.getRunningTrackCapabilities();
        if ((capabilities as any)?.torch) {
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: !torchEnabled }] as any,
          });
          toggleTorch();
        }
      }
    } catch (error) {
      toast({
        title: 'Linterna no disponible',
        description: 'Su dispositivo no soporta esta función',
      });
    }
  }, [torchEnabled, toggleTorch]);

  useEffect(() => {
    if (autoStart) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [autoStart]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Visor de cámara */}
      <CameraViewfinder isActive={isScanning} isLoading={isLoading}>
        <div id={scannerDivId.current} className="h-full w-full" />
      </CameraViewfinder>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-2">
        {!isScanning ? (
          <Button onClick={startScanner} className="gap-2" size="lg" disabled={isLoading}>
            <Camera className="h-5 w-5" />
            {isLoading ? 'Iniciando...' : 'Escanear'}
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="destructive" className="gap-2" size="lg">
            <StopCircle className="h-5 w-5" />
            Detener
          </Button>
        )}

        <Button onClick={toggleCamera} variant="outline" size="lg" className="gap-2 dark:border-gray-700" disabled={!isScanning}>
          <FlipHorizontal className="h-5 w-5" />
          Girar
        </Button>

        <Button onClick={handleTorchToggle} variant="outline" size="lg" className="gap-2 dark:border-gray-700" disabled={!isScanning}>
          {torchEnabled ? <Zap className="h-5 w-5 text-warning" /> : <ZapOff className="h-5 w-5" />}
          {torchEnabled ? 'Linterna ON' : 'Linterna'}
        </Button>

        {onClose && (
          <Button onClick={onClose} variant="ghost" size="lg" className="ml-auto dark:hover:bg-gray-800">
            Cancelar
          </Button>
        )}
      </div>

      {/* Resultado */}
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