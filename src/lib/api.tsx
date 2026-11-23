import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { LoginResponse } from "@/types/response/loginResponse";
import {
  emitSessionExpired,
  emitTokenRefreshed,
  getStoredAccessToken,
  getStoredRefreshToken,
  isAuthEndpoint,
  resetSessionExpiredFlag,
  saveSession,
} from "@/lib/authSession";


//LA RUTA EL ELEMENTO QUE SE USA PARA CONECTAR A LA API(BACKEND)
//Y HACERLE CONSULTAS Y PETICIONES DESDE EL FRONT MEDIANTE AXIOS
// URL del backend según el entorno.
const api = axios.create({
  //si se conecto axitosamente a la api la usa si no se conecta al localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// SESIÓN EXPIRADA / REFRESH AUTOMÁTICO
// ============================================================

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Cliente aislado: no pasa por los interceptores de `api`, así el refresh
// no se puede llamar a sí mismo en un loop.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Single-flight: si varios requests reciben 401 al mismo tiempo, todos
// esperan la misma renovación.
let refreshPromise: Promise<LoginResponse> | null = null;

// En pestañas/ventanas distintas del mismo navegador, el refresh token rota
// y solo puede usarse una vez. El lock evita que dos pestañas lo pisen.
function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request("auth-refresh", fn) as Promise<T>;
  }
  return fn();
}

function refreshSession(): Promise<LoginResponse> {
  if (!refreshPromise) {
    refreshPromise = withCrossTabLock(async () => {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error("NO_REFRESH_TOKEN");
      }

      const { data } = await refreshClient.post<LoginResponse>(
        "/api/auth/v1/refresh",
        { refreshToken }
      );

      // El backend rota el refresh: hay que guardar el nuevo par ya.
      saveSession(data);
      resetSessionExpiredFlag();
      emitTokenRefreshed({
        accessToken: data.accessToken,
        user: data.usuario ?? null,
      });

      return data;
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function isDefinitiveRefreshFailure(error: any): boolean {
  const status = error?.response?.status;
  if (!status) return false; // sin red / timeout: transitorio, NO expulsar
  return status === 400 || status === 401 || status === 403 || status === 404;
}

function setAuthorization(config: RetriableConfig, token: string): void {
  config.headers.set("Authorization", `Bearer ${token}`);
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url;

    // 403 es falta de permisos, no sesión. Los endpoints de auth tampoco
    // deben disparar el refresh (ej: login con credenciales inválidas).
    if (status !== 401 || !original || isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    // Ya se reintentó con el token nuevo y volvió 401: no insistir.
    if (original._retry) {
      return Promise.reject(error);
    }

    // Otra pestaña ya renovó: usar el token actual antes de refrescar.
    const storedToken = getStoredAccessToken();
    const usedToken = original.headers
      .get("Authorization")
      ?.toString()
      .replace(/^Bearer\s+/i, "");

    if (storedToken && usedToken && storedToken !== usedToken) {
      original._retry = true;
      setAuthorization(original, storedToken);
      return api(original);
    }

    if (!getStoredRefreshToken()) {
      // Si nunca hubo sesión (ej: pantalla de login haciendo un request
      // público), no hay nada que expirar ni que avisar.
      if (getStoredAccessToken()) {
        emitSessionExpired();
      }
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const session = await refreshSession();
      setAuthorization(original, session.accessToken);
      return api(original);
    } catch (refreshError: any) {
      // Solo se cierra la sesión cuando el backend rechazó el refresh.
      // Offline, timeout o 5xx conservan la sesión y la cola local.
      if (isDefinitiveRefreshFailure(refreshError)) {
        emitSessionExpired();
      }
      return Promise.reject(error);
    }
  }
);

export default api;
