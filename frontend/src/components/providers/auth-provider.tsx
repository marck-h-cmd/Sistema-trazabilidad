'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, refreshToken, setUser, setToken, clearAuth } = useAuthStore();

  const refreshUser = useCallback(async () => {
    if (token) {
      try {
        const response = await authApi.me();
        setUser(response.data.data);
      } catch (error) {
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            setToken(accessToken, newRefreshToken);

            const meResponse = await authApi.me();
            setUser(meResponse.data.data);
          } catch {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      }
    }
    setIsLoading(false);
  }, [token, refreshToken, setUser, setToken, clearAuth]);

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data.data;
    setToken(accessToken, newRefreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores
    }
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}