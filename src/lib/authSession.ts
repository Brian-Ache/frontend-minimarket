/**
 * Helpers de sesión de autenticación.
 *
 * No depende de React ni de Axios: solo localStorage y eventos de ventana.
 * La usan el interceptor de `api.tsx` y el `AuthContext`.
 *
 * Regla clave del modo offline: acá se limpian SOLO las claves de auth.
 * La cola de eventos y los tickets locales de SQLite no se tocan nunca.
 */
import type { LoginResponse, User } from "@/types/response/loginResponse";

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
export const AUTH_TOKEN_REFRESHED_EVENT = "auth:token-refreshed";
export const AUTH_SESSION_RESTORED_EVENT = "auth:session-restored";

export interface RefreshedSessionDetail {
  accessToken: string;
  user: User | null;
}

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

let sessionExpiredHandled = false;

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveSession(data: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  if (data.usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function resetSessionExpiredFlag(): void {
  sessionExpiredHandled = false;
}

export function emitSessionExpired(): void {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  clearAuthStorage();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export function emitTokenRefreshed(detail: RefreshedSessionDetail): void {
  sessionExpiredHandled = false;
  window.dispatchEvent(
    new CustomEvent<RefreshedSessionDetail>(AUTH_TOKEN_REFRESHED_EVENT, { detail })
  );
}

export function emitSessionRestored(): void {
  sessionExpiredHandled = false;
  window.dispatchEvent(new Event(AUTH_SESSION_RESTORED_EVENT));
}

export function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return url.includes("/api/auth/v1/");
}
