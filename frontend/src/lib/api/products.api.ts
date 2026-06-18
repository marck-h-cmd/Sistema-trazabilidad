import api from '@/lib/axios';

export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  getStock: (id: string) => api.get(`/products/${id}/stock`),
};