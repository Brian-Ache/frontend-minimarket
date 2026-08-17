/*El Contexto de Autenticación en React es un patrón de diseño que utiliza la API de Contexto (React.Context) para centralizar y compartir el estado de la sesión de un usuario a lo largo de toda la aplicación, sin necesidad de pasar datos manualmente componente por componente mediante props (un problema conocido como prop drilling).*/

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import type { User, LoginResponse } from "@/types/auth";

//El Contexto (AuthContext): Define qué datos y funciones estarán disponibles globalmente (por ejemplo: los datos del usuario, si está autenticado o no, funciones de login y logout).
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}


const AuthContext = createContext<AuthContextType | null>(null);

//El Proveedor (AuthProvider): Un componente envoltorio (wrapper) que contiene la lógica, el estado interno de la sesión y distribuye esos datos hacia abajo en el árbol de componentes.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (usuario: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<LoginResponse>("/api/auth/login", { usuario, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al iniciar sesión";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading, error }}>
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