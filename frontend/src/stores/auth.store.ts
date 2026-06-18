import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setToken: (token, refreshToken) => set({ token, refreshToken }),
      clearAuth: () => set({ user: null, token: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);