import api from '@/lib/axios';

export const customersApi = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getByCode: (codigo: string) => api.get(`/customers/code/${codigo}`),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};