import api from '@/lib/axios';

export const shipmentsApi = {
  getAll: (params?: any) => api.get('/shipments', { params }),
  getById: (id: string) => api.get(`/shipments/${id}`),
  create: (data: any) => api.post('/shipments', data),
  updateStatus: (id: string, estado: string) => api.put(`/shipments/${id}/status`, { estado }),
  getRecent: (limit?: number) => api.get('/shipments/recent', { params: { limit } }),
  getByClient: (clienteId: string) => api.get(`/shipments/client/${clienteId}`),
};