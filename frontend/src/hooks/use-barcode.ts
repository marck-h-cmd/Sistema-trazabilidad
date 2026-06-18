'use client';

import { useMutation } from '@tanstack/react-query';
import { barcodesApi } from '@/lib/api/barcodes.api';

export function useBarcode() {
  const generateMutation = useMutation({
    mutationFn: (data: { code: string; type?: string; scale?: number; height?: number }) =>
      barcodesApi.generate(data),
  });

  const generateQRMutation = useMutation({
    mutationFn: (data: { code: string; size?: number }) => barcodesApi.generateQR(data),
  });

  return {
    generateBarcode: generateMutation.mutate,
    generateQR: generateQRMutation.mutate,
    isGenerating: generateMutation.isPending,
    isGeneratingQR: generateQRMutation.isPending,
    barcodeData: generateMutation.data?.data?.data,
    qrData: generateQRMutation.data?.data?.data,
  };
}