import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Protege una ruta: si el usuario NO esta autenticado, redirige a /login.
 * Si la sesión expiró, conserva la ruta para volver después del login.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          motivo: sessionExpired ? "expirada" : null,
        }}
      />
    );
  }

  return <>{children}</>;
}
