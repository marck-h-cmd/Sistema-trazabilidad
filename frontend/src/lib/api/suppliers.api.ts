import api from '@/lib/axios';

export const suppliersApi = {
  getAll: (params?: any) => api.get('/suppliers', { params }),
  getByCode: (codigo: string) => api.get(`/suppliers/code/${codigo}`),
  getById: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};