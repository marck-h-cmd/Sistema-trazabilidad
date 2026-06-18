import api from '@/lib/axios';

export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getActivity: (limit: number = 10) => api.get('/dashboard/activity', { params: { limit } }),
};