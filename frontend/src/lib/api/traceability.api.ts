import api from '@/lib/axios';

export const traceabilityApi = {
  getByCode: (code: string) => api.get(`/traceability/${code}`),
  getBackward: (code: string) => api.get(`/traceability/${code}/backward`),
  getForward: (code: string) => api.get(`/traceability/${code}/forward`),
  getPublic: (code: string) => api.get(`/traceability/public/${code}`),
};