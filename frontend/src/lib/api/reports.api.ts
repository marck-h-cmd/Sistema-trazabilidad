import api from '@/lib/axios';

export const reportsApi = {
  getStockReport: (params?: any) =>
    api.get('/reports/stock', { params, responseType: params?.formato === 'excel' ? 'blob' : 'json' }),
  getExpiryReport: (params?: any) =>
    api.get('/reports/expiry', { params, responseType: params?.formato === 'excel' ? 'blob' : 'json' }),
  getTraceabilityReport: (loteId: string) => api.get(`/reports/traceability/${loteId}`),
  getShipmentReport: (params?: any) =>
    api.get('/reports/shipments', { params, responseType: params?.formato === 'excel' ? 'blob' : 'json' }),
};