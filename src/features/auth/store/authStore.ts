import { create } from 'zustand';
import {
  getStoredTokens,
  setStoredTokens,
  clearStoredTokens,
  getGuestSessionKey,
  clearGuestSessionKey,
} from '@/lib/storage';
import { authApi } from '@/features/auth/api/authApi';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User | null) => void;
  updateUserProfile: (data: Partial<User>) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    const role = user.role || 'customer';
    setStoredTokens(accessToken, refreshToken, role);

    set({
      user,
      accessToken,
      refreshToken: refreshToken || null,
      isAuthenticated: true,
      isLoading: false,
    });

    // Mehmon savatchasini hisobga birlashtirish
    const guestKey = getGuestSessionKey();
    if (guestKey) {
      authApi
        .mergeCart(guestKey)
        .catch(() => null)
        .finally(() => {
          clearGuestSessionKey();
        });
    }
  },

  setAccessToken: (accessToken) => {
    const currentRole = get().user?.role;
    setStoredTokens(accessToken, undefined, currentRole);
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    if (user?.role) {
      const currentToken = get().accessToken;
      if (currentToken) {
        setStoredTokens(currentToken, undefined, user.role);
      }
    }
    set({ user });
  },

  updateUserProfile: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      set({ user: updated });
    }
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

  fetchProfile: async () => {
    try {
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true });
      if (user.role && get().accessToken) {
        setStoredTokens(get().accessToken!, undefined, user.role);
      }
      return user;
    } catch {
      return null;
    }
  },

  initialize: async () => {
    const tokens = getStoredTokens();

    if (!tokens.accessToken) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      isLoading: true,
    });

    try {
      const user = await authApi.getProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      if (user.role) {
        setStoredTokens(tokens.accessToken, tokens.refreshToken || undefined, user.role);
      }
    } catch {
      // Token eskirgan yoki bekor qilingan bo'lsa
      get().logout();
    }
  },
}));
