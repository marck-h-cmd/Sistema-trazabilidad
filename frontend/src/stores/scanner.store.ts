import { create } from 'zustand';

type ScannerMode = 'scan' | 'manual';

interface ScannerState {
  mode: ScannerMode;
  lastScan: { code: string; format: string; timestamp: string } | null;
  isScanning: boolean;
  cameraFacing: 'environment' | 'user';
  torchEnabled: boolean;
  setMode: (mode: ScannerMode) => void;
  toggleMode: () => void;
  setLastScan: (scan: { code: string; format: string; timestamp: string } | null) => void;
  setIsScanning: (isScanning: boolean) => void;
  setCameraFacing: (facing: 'environment' | 'user') => void;
  toggleTorch: () => void;
  reset: () => void;
}

export const useScannerStore = create<ScannerState>()((set, get) => ({
  mode: 'manual',
  lastScan: null,
  isScanning: false,
  cameraFacing: 'environment',
  torchEnabled: false,
  setMode: (mode) => set({ mode }),
  toggleMode: () => set({ mode: get().mode === 'scan' ? 'manual' : 'scan' }),
  setLastScan: (lastScan) => set({ lastScan }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setCameraFacing: (cameraFacing) => set({ cameraFacing }),
  toggleTorch: () => set({ torchEnabled: !get().torchEnabled }),
  reset: () => set({
    mode: 'manual',
    lastScan: null,
    isScanning: false,
    cameraFacing: 'environment',
    torchEnabled: false,
  }),
}));