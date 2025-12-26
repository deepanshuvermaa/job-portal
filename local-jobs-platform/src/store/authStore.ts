import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  pendingPhone: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setPendingPhone: (phone: string | null) => void;
  login: (user: User, token: string, refreshToken?: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      pendingPhone: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token, refreshToken) =>
        set({
          token,
          refreshToken: refreshToken ?? null,
        }),

      setPendingPhone: (phone) =>
        set({
          pendingPhone: phone,
        }),

      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
          loading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          pendingPhone: null,
        }),

      setLoading: (loading) =>
        set({
          loading,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

