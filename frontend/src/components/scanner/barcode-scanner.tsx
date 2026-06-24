'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { CameraViewfinder } from './camera-viewfinder';
import { ScannerResult } from './scanner-result';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScannerStore } from '@/stores/scanner.store';
import { toast } from '@/components/ui/toast';
import { Camera, StopCircle, FlipHorizontal, Zap, ZapOff, Keyboard, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  readonly onScan: (code: string) => void;
  readonly onError?: (error: string) => void;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly autoStart?: boolean;
}

export function BarcodeScanner({
  onScan,
  onError,
  onClose,
  className,
  autoStart = false,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerDivId = useRef(`barcode-scanner-${Math.random().toString(36).substring(7)}`);
  const { cameraFacing, torchEnabled, toggleTorch, setCameraFacing } = useScannerStore();

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setIsLoading(true);

    // Esperar a que el DOM esté listo
    await new Promise((resolve) => setTimeout(resolve, 300));

    const scannerElement = document.getElementById(scannerDivId.current);
    if (!scannerElement) {
      const err = 'No se encontró el elemento del escáner en el DOM';
      setCameraError(err);
      onError?.(err);
      setIsLoading(false);
      return;
    }

    try {
      const formats = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5QrCode = new Html5Qrcode(scannerDivId.current, {
        formatsToSupport: formats,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: cameraFacing },
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
        },
        (decodedText) => {
          const normalizedCode = normalizeScannedCode(decodedText);
          setLastResult(normalizedCode || decodedText);
          html5QrCode.stop().catch(console.error);
          setIsScanning(false);
          onScan(normalizedCode || decodedText);
          toast({
            title: 'Código detectado',
            description: normalizedCode || decodedText,
          });
        },
        () => {
          // Ignorar errores de escaneo parcial
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      console.error('Error iniciando escáner:', error);
      let errMsg = error?.message || 'Error desconocido al iniciar la cámara';

      // Traducir errores comunes a mensajes amigables
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
        errMsg =
          'Permiso de cámara denegado. Ve a la configuración del navegador y permite el acceso a la cámara para este sitio.';
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('No camera')) {
        errMsg = 'No se detectó ninguna cámara en el dispositivo.';
      } else if (errMsg.includes('NotReadableError') || errMsg.includes('Could not start')) {
        errMsg =
          'La cámara está siendo usada por otra aplicación (Zoom, Teams, etc.). Ciérrala e intenta de nuevo.';
      } else if (errMsg.includes('OverconstrainedError')) {
        errMsg = 'La cámara solicitada no está disponible. Intenta girar la cámara.';
      }

      setCameraError(errMsg);
      onError?.(errMsg);
      toast({
        title: 'Error de cámara',
        description: errMsg,
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
    if (!scannerRef.current) return;

    try {
      const capabilities = scannerRef.current.getRunningTrackCapabilities() as { torch?: boolean } | null;
      if (capabilities?.torch) {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchEnabled }] as any,
        });
        toggleTorch();
      }
    } catch (error) {
      console.error('Error al cambiar la linterna:', error);
      toast({
        title: 'Linterna no disponible',
        description: 'Su dispositivo no soporta esta función',
      });
    }
  }, [torchEnabled, toggleTorch]);

  const normalizeScannedCode = useCallback((rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return '';

    const withoutQuotes = trimmed.replace(/^['"]|['"]$/g, '');

    try {
      const parsedUrl = new URL(withoutQuotes);
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      const traceSegmentIndex = pathSegments.findIndex((segment) => segment === 't' || segment === 'trazabilidad');

      if (traceSegmentIndex >= 0 && pathSegments[traceSegmentIndex + 1]) {
        return pathSegments[traceSegmentIndex + 1].trim().toUpperCase();
      }

      const lastSegment = pathSegments.at(-1);
      if (lastSegment) {
        return lastSegment.trim().toUpperCase();
      }
    } catch {
      // Ignorar URLs inválidas y continuar con el valor original
    }

    const match = /(?:\/t\/|\/trazabilidad\/)([^/?#]+)/i.exec(withoutQuotes);
    if (match?.[1]) {
      return match[1].trim().toUpperCase();
    }

    return withoutQuotes.trim().toUpperCase();
  }, []);

  const handleManualSubmit = () => {
    const normalizedCode = normalizeScannedCode(manualCode);
    if (!normalizedCode) return;
    onScan(normalizedCode);
    setManualCode('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    setIsProcessingImage(true);
    setIsLoading(true);
    setIsScanning(false);

    try {
      await stopScanner();

      const formats = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5QrCode = new Html5Qrcode(scannerDivId.current, {
        formatsToSupport: formats,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const decodedText = await html5QrCode.scanFile(file, false);
      const normalizedCode = normalizeScannedCode(decodedText);
      setLastResult(normalizedCode || decodedText);
      onScan(normalizedCode || decodedText);
      toast({
        title: 'Código leído desde imagen',
        description: normalizedCode || decodedText,
      });
    } catch (error: any) {
      console.error('Error leyendo imagen:', error);
      let errMsg = error?.message || 'No se pudo leer el código QR desde la imagen';

      if (errMsg.includes('No QR code found')) {
        errMsg = 'No se encontró un código QR o de barras legible en la imagen.';
      } else if (errMsg.includes('Unsupported file')) {
        errMsg = 'Formato de imagen no soportado. Prueba con JPG, PNG o WEBP.';
      }

      setCameraError(errMsg);
      onError?.(errMsg);
      toast({
        title: 'No se pudo leer la imagen',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      try {
        if (scannerRef.current) {
          await Promise.resolve(scannerRef.current.clear());
        }
      } catch {
        // Ignorar errores al limpiar el escáner temporal
      }

      scannerRef.current = null;
      setIsProcessingImage(false);
      setIsLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  useEffect(() => {
    if (autoStart) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [autoStart, startScanner, stopScanner]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Visor de cámara */}
      <CameraViewfinder isActive={isScanning} isLoading={isLoading}>
        <div id={scannerDivId.current} style={{ width: '100%', height: '100%', minHeight: 240 }} />
      </CameraViewfinder>

      {/* Mensaje de error de cámara */}
      {cameraError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-semibold">No se pudo acceder a la cámara</p>
          <p className="mt-1">{cameraError}</p>
          <p className="mt-2 text-xs opacity-80">
            Consejo: En Chrome/Edge, haz clic en el icono de candado 🔒 junto a la URL y asegúrate
            de que la cámara esté en "Permitir".
          </p>
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-2">
        {isScanning ? (
          <Button onClick={stopScanner} variant="destructive" className="gap-2" size="lg">
            <StopCircle className="h-5 w-5" />
            Detener
          </Button>
        ) : (
          <Button onClick={startScanner} className="gap-2" size="lg" disabled={isLoading}>
            <Camera className="h-5 w-5" />
            {isLoading ? 'Iniciando...' : 'Escanear'}
          </Button>
        )}

        <Button
          onClick={toggleCamera}
          variant="outline"
          size="lg"
          className="gap-2 dark:border-gray-700"
          disabled={!isScanning}
        >
          <FlipHorizontal className="h-5 w-5" />
          Girar
        </Button>

        <Button
          onClick={handleTorchToggle}
          variant="outline"
          size="lg"
          className="gap-2 dark:border-gray-700"
          disabled={!isScanning}
        >
          {torchEnabled ? <Zap className="h-5 w-5 text-warning" /> : <ZapOff className="h-5 w-5" />}
          {torchEnabled ? 'Linterna ON' : 'Linterna'}
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="lg"
          className="gap-2 dark:border-gray-700"
          disabled={isLoading || isProcessingImage}
        >
          <ImagePlus className="h-5 w-5" />
          {isProcessingImage ? 'Leyendo...' : 'Subir imagen'}
        </Button>

        <Button
          onClick={() => setShowManualInput(!showManualInput)}
          variant="outline"
          size="lg"
          className="gap-2 dark:border-gray-700"
        >
          <Keyboard className="h-5 w-5" />
          {showManualInput ? 'Ocultar teclado' : 'Escribir código'}
        </Button>

        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
            className="ml-auto dark:hover:bg-gray-800"
          >
            Cancelar
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Input manual */}
      {showManualInput && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Escribe o pega el código de barras/QR..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleManualSubmit} disabled={!manualCode.trim()}>
            Aceptar
          </Button>
        </div>
      )}

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
