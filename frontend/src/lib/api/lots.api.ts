import api from '@/lib/axios';

export const lotsApi = {
  getAll: (params?: any) => api.get('/lots', { params }),
  getById: (id: string) => api.get(`/lots/${id}`),
  getAvailableByProduct: (productId: string) => api.get(`/lots/available/${productId}`),
};
