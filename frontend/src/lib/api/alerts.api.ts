import api from '@/lib/axios';

export const alertsApi = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  getActive: () => api.get('/alerts/active'),
  getById: (id: string) => api.get(`/alerts/${id}`),
  create: (data: any) => api.post('/alerts', data),
  analyzeImpact: (id: string) => api.get(`/alerts/${id}/impact`),
  activate: (id: string) => api.post(`/alerts/${id}/activate`),
  resolve: (id: string, data: { resolucion: string }) => api.post(`/alerts/${id}/resolve`, data),
  close: (id: string) => api.post(`/alerts/${id}/close`),
  updateRecovery: (id: string, data: any) => api.put(`/alerts/${id}/recovery`, data),
};