import api from '@/lib/axios';

export const barcodesApi = {
  generate: (data: any) => api.post('/barcodes/generate', data),
  generateQR: (data: any) => api.post('/barcodes/qr', data),
  scan: (barcode: string) => api.post('/barcodes/scan', { barcode }),
};