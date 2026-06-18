import api from '@/lib/axios';

export const inventoryApi = {
  getMovements: (params?: any) => api.get('/inventory/movements', { params }),
  getRecentMovements: (limit?: number) => api.get('/inventory/movements/recent', { params: { limit } }),
  getMovementsByLot: (lotId: string) => api.get(`/inventory/movements/lot/${lotId}`),
  getStockByLot: (lotId: string) => api.get(`/inventory/stock/lot/${lotId}`),
  getStockByLocation: (locationId: string) => api.get(`/inventory/stock/location/${locationId}`),
  getExpiringSoon: (dias?: number) => api.get('/inventory/expiring', { params: { dias } }),
  getFifoSuggestions: (productoId: string, cantidad: number) =>
    api.get('/inventory/fifo', { params: { productoId, cantidad } }),
  validateFifo: (lotes: { loteId: string; cantidad: number }[]) =>
    api.post('/inventory/fifo/validate', { lotes }),
  moveLot: (data: any) => api.post('/inventory/move', data),
};