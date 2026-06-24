import api from '@/lib/axios';

export const warehousesApi = {
  getAll: (params?: any) => api.get('/warehouses', { params }),
  getById: (id: string) => api.get(`/warehouses/${id}`),
  create: (data: any) => api.post('/warehouses', data),
  update: (id: string, data: any) => api.put(`/warehouses/${id}`, data),
  delete: (id: string) => api.delete(`/warehouses/${id}`),
  getLocations: (id: string) => api.get(`/warehouses/${id}/locations`),
  createLocation: (id: string, data: any) => api.post(`/warehouses/${id}/locations`, data),
  updateLocation: (warehouseId: string, locationId: string, data: any) =>
    api.put(`/warehouses/${warehouseId}/locations/${locationId}`, data),
  deleteLocation: (warehouseId: string, locationId: string) =>
    api.delete(`/warehouses/${warehouseId}/locations/${locationId}`),
};