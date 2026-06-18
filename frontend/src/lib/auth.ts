import { useAuthStore } from '@/stores/auth.store';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().token;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().user;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!useAuthStore.getState().token;
}

export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.rol === role;
}

export function hasAnyRole(roles: string[]): boolean {
  const user = getUser();
  return !!user && roles.includes(user.rol);
}

export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}