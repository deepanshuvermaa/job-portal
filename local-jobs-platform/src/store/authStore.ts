import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  pendingPhone: string | null;
  pendingFirebaseToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setPendingPhone: (phone: string | null) => void;
  setPendingFirebaseToken: (token: string | null) => void;
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
      pendingFirebaseToken: null,

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

      setPendingFirebaseToken: (token) =>
        set({
          pendingFirebaseToken: token,
        }),

      login: (user, token, refreshToken) => {
        console.log('🔐 User logged in, storing session');
        set({
          user,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
          loading: false,
        });
      },

      logout: () => {
        console.log('🚪 User logged out, clearing session');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          pendingPhone: null,
          pendingFirebaseToken: null,
        });
      },

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

