import { create } from 'zustand';
import { getStoredTokens, setStoredTokens, clearStoredTokens } from '@/lib/storage';

export interface User {
  id: number | string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'ADMIN' | 'CUSTOMER' | string;
  is_staff?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    setStoredTokens(accessToken, refreshToken);
    set({
      user,
      accessToken,
      refreshToken: refreshToken || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setAccessToken: (accessToken) => {
    setStoredTokens(accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    clearStoredTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: () => {
    const tokens = getStoredTokens();
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: !!tokens.accessToken,
      isLoading: false,
    });
  },
}));
