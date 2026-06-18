'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useScannerStore } from '@/stores/scanner.store';
import { Settings, RotateCcw } from 'lucide-react';

export function ScannerSettings() {
  const { mode, setMode, cameraFacing, setCameraFacing, reset } = useScannerStore();
  const [continuousMode, setContinuousMode] = useState(false);
  const [beepOnScan, setBeepOnScan] = useState(true);
  const [vibrateOnScan, setVibrateOnScan] = useState(true);

  const handleReset = () => {
    reset();
    setContinuousMode(false);
    setBeepOnScan(true);
    setVibrateOnScan(true);
  };

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
          <Settings className="h-4 w-4 text-primary" />
          Configuración del Escáner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Modo por defecto */}
        <div className="space-y-2">
          <Label className="text-sm dark:text-gray-300">Modo por defecto</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as 'scan' | 'manual')}>
            <SelectTrigger className="dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="scan">Escaneo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cámara */}
        <div className="space-y-2">
          <Label className="text-sm dark:text-gray-300">Cámara preferida</Label>
          <Select value={cameraFacing} onValueChange={(v) => setCameraFacing(v as 'environment' | 'user')}>
            <SelectTrigger className="dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="environment">Trasera</SelectItem>
              <SelectItem value="user">Frontal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm dark:text-gray-300">Escaneo continuo</Label>
            <Switch checked={continuousMode} onCheckedChange={setContinuousMode} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm dark:text-gray-300">Sonido al escanear</Label>
            <Switch checked={beepOnScan} onCheckedChange={setBeepOnScan} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm dark:text-gray-300">Vibrar al escanear</Label>
            <Switch checked={vibrateOnScan} onCheckedChange={setVibrateOnScan} />
          </div>
        </div>

        {/* Reset */}
        <Button variant="outline" size="sm" className="w-full gap-2 dark:border-gray-700" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Restaurar valores
        </Button>
      </CardContent>
    </Card>
  );
}