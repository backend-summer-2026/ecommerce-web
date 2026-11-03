export const GUEST_SESSION_STORAGE_KEY = 'ecommerce_guest_session_key';
export const ACCESS_TOKEN_KEY = 'ecommerce_access_token';
export const REFRESH_TOKEN_KEY = 'ecommerce_refresh_token';

/**
 * Mehmon foydalanuvchi uchun sessiya kaliti (UUID) oladi yoki yangi yaratadi.
 * Ushbu kalit savatcha amallarida X-Session-Key sarlavhasi sifatida uzatiladi.
 */
export function getOrCreateGuestSessionKey(): string {
  if (typeof window === 'undefined') return '';

  let key = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  if (!key) {
    key = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_SESSION_STORAGE_KEY, key);
  }
  return key;
}

/**
 * Tizimga kirilganda (login/register) mehmon sessiya kalitini tozalash.
 */
export function clearGuestSessionKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
  }
}

/**
 * Tokenlarni LocalStorage dan olish va o'chirish
 */
export function getStoredTokens() {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setStoredTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
