import api from '@/lib/axios';

export const labelsApi = {
  print: (data: any) => api.post('/labels/print', data),
  getTemplates: (productoId?: string) =>
    api.get('/labels/templates', { params: { productoId } }),
  createTemplate: (data: any) => api.post('/labels/templates', data),
  updateTemplate: (id: string, data: any) => api.put(`/labels/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/labels/templates/${id}`),
};