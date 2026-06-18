import api from '@/lib/axios';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/auth.types';

export const authApi = {
  login: (data: LoginRequest) => api.post<{ success: boolean; data: LoginResponse }>('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ success: boolean; data: AuthUser }>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};