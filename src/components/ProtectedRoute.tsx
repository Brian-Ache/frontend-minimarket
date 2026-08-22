import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Protege una ruta: si el usuario NO esta autenticado, redirige a /login.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
