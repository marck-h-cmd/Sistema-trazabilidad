import api from '@/lib/axios';

export const receptionsApi = {
  getAll: (params?: any) => api.get('/receptions', { params }),
  getById: (id: string) => api.get(`/receptions/${id}`),
  create: (data: any) => api.post('/receptions', data),
  scanBarcode: (barcode: string) => api.post('/receptions/scan', { barcode }),
  getRecent: (limit?: number) => api.get('/receptions/recent', { params: { limit } }),
};