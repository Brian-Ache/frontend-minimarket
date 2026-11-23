/*El Contexto de Autenticación en React es un patrón de diseño que utiliza la API de Contexto (React.Context) para centralizar y compartir el estado de la sesión de un usuario a lo largo de toda la aplicación, sin necesidad de pasar datos manualmente componente por componente mediante props (un problema conocido como prop drilling).*/

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import type { User, LoginResponse } from "@/types/response/loginResponse";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKEN_REFRESHED_EVENT,
  clearAuthStorage,
  emitSessionRestored,
  getStoredUser,
  resetSessionExpiredFlag,
  type RefreshedSessionDetail,
} from "@/lib/authSession";

//El Contexto (AuthContext): Define qué datos y funciones estarán disponibles globalmente (por ejemplo: los datos del usuario, si está autenticado o no, funciones de login y logout).
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  justLoggedIn: boolean;
  sessionExpired: boolean;
  clearJustLoggedIn: () => void;
}


const AuthContext = createContext<AuthContextType | null>(null);

//El Proveedor (AuthProvider): Un componente envoltorio (wrapper) que contiene la lógica, el estado interno de la sesión y distribuye esos datos hacia abajo en el árbol de componentes.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // La sesión expiró (refresh rechazado) o se renovó en otra pestaña.
  // El interceptor de axios no puede tocar el estado de React: se comunica
  // por eventos. La limpieza local ya la hizo `emitSessionExpired`.
  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUser(null);
      setJustLoggedIn(false);
      setSessionExpired(true);
    };

    const handleRefreshed = (event: Event) => {
      const detail = (event as CustomEvent<RefreshedSessionDetail>).detail;
      if (!detail) return;
      if (detail.accessToken) setToken(detail.accessToken);
      if (detail.user) setUser(detail.user);
      setSessionExpired(false);
    };

    // Otra pestaña limpió o renovó el token.
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "token") return;

      if (!event.newValue) {
        setToken(null);
        setUser(null);
        setJustLoggedIn(false);
        setSessionExpired(true);
        return;
      }

      setToken(event.newValue);
      const storedUser = getStoredUser();
      if (storedUser) setUser(storedUser);
      setSessionExpired(false);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
    window.addEventListener(AUTH_TOKEN_REFRESHED_EVENT, handleRefreshed);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
      window.removeEventListener(AUTH_TOKEN_REFRESHED_EVENT, handleRefreshed);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const login = async (usuario: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<LoginResponse>("/api/auth/v1/login", { username: usuario, password });
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      setToken(data.accessToken);
      setUser(data.usuario);
      setJustLoggedIn(true);
      setSessionExpired(false);
      resetSessionExpiredFlag();
      emitSessionRestored();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al iniciar sesión";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cierra la sesión solo si el backend confirmó (revoca el refresh). Sin internet o con
  // el backend caído lanza SIN_CONEXION y NO se limpia nada local.
  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      // Sesiones viejas sin refreshToken guardado: no hay nada que revocar.
      if (refreshToken) {
        await api.post("/api/auth/v1/logout", { refreshToken });
      }
    } catch {
      throw new Error("SIN_CONEXION");
    }
    clearAuthStorage();
    setToken(null);
    setUser(null);
    setJustLoggedIn(false);
    setSessionExpired(false);
  };

  const clearJustLoggedIn = () => setJustLoggedIn(false);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading, error, justLoggedIn, sessionExpired, clearJustLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

//El Hook Personalizado (useAuth): Una función auxiliar que facilita a cualquier componente el consumo sencillo del contexto sin necesidad de importar useContext y AuthContext individualmente en cada archivo.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}