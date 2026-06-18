'use client';

import { useCallback } from 'react';
import { useScannerStore } from '@/stores/scanner.store';

export function useScanner() {
  const { mode, lastScan, isScanning, setMode, toggleMode, setLastScan, setIsScanning } =
    useScannerStore();

  const handleScan = useCallback(
    (code: string, format: string = 'code128') => {
      setLastScan({
        code,
        format,
        timestamp: new Date().toISOString(),
      });
      setIsScanning(false);
      return code;
    },
    [setLastScan, setIsScanning]
  );

  const resetScan = useCallback(() => {
    setLastScan(null);
    setIsScanning(false);
  }, [setLastScan, setIsScanning]);

  return {
    mode,
    lastScan,
    isScanning,
    setMode,
    toggleMode,
    handleScan,
    resetScan,
    setIsScanning,
  };
}