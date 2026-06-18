import api from '@/lib/axios';

export const productionsApi = {
  getAll: (params?: any) => api.get('/productions', { params }),
  getById: (id: string) => api.get(`/productions/${id}`),
  create: (data: any) => api.post('/productions', data),
  update: (id: string, data: any) => api.put(`/productions/${id}`, data),
  getRecent: (limit?: number) => api.get('/productions/recent', { params: { limit } }),
};