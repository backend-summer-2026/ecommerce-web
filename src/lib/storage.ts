export const GUEST_SESSION_STORAGE_KEY = 'ecommerce_guest_session_key';
export const ACCESS_TOKEN_KEY = 'ecommerce_access_token';
export const REFRESH_TOKEN_KEY = 'ecommerce_refresh_token';
export const USER_ROLE_KEY = 'ecommerce_user_role';

const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 kun

function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE_SECONDS): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Mehmon foydalanuvchi uchun sessiya kaliti (UUID) oladi yoki yangi yaratadi.
 * Ushbu kalit savatcha amallarida X-Session-Key sarlavhasi sifatida uzatiladi.
 */
export function getOrCreateGuestSessionKey(): string {
  if (typeof window === 'undefined') return '';

  let key = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  if (!key) {
    key = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_SESSION_STORAGE_KEY, key);
  }
  return key;
}

export function getGuestSessionKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
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
 * Tokenlar va foydalanuvchi rolini LocalStorage hamda Cookie larda saqlash
 */
export function setStoredTokens(accessToken: string, refreshToken?: string, role?: string): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  setCookie('access_token', accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role);
    setCookie('user_role', role);
  }
}

/**
 * Tokenlarni LocalStorage dan olish (va cookie dan fallback)
 */
export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
} {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, role: null };
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie('access_token');
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const role = localStorage.getItem(USER_ROLE_KEY) || getCookie('user_role');

  return { accessToken, refreshToken, role };
}

/**
 * Chiqish (logout) qilinganda barcha saqlangan tokenlar va cookielarni tozalash
 */
export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);

  deleteCookie('access_token');
  deleteCookie('user_role');
}
