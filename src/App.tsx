/**
 * Componente raiz de la aplicacion.
 *
 * Carga de adentro hacia afuera (Provider mas externo primero):
 * 1. BrowserRouter → habilita navegacion con react-router-dom.
 * 2. AuthProvider   → provee el contexto de autenticacion (user, token, login, logout, isAuthenticated)
 *                     a toda la app via React Context.
 * 3. Navbar + AppRouter → la UI: el navbar y las rutas.
 *
 * El Navbar se oculta automaticamente cuando la ruta es /login para
 * que la pagina de login se muestre sin la barra de navegacion.
 */

import { BrowserRouter, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
// [SQLite] Imports para sincronización de SQLite al iniciar
import { useEffect } from "react";
import { initDatabase } from "./services/venta/sqliteService";
import {
  syncProductos,
  startRetryLoop,
  stopRetryLoop,
  flushColaEventos,
} from "./services/venta/syncService";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_RESTORED_EVENT,
  getStoredAccessToken,
} from "./lib/authSession";
import { SesionProvider } from "./context/SesionContext";
import ModalAbrirCaja from "./components/caja/ModalAbrirCaja";


function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  // El invitado todavía no tiene sesión: la barra no tiene nada que mostrarle.
  const isInvitacionPage = location.pathname === "/invitacion";
  const hideNavbar = isLoginPage || isInvitacionPage;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {!hideNavbar && (
        <div className="shrink-0">
          <Navbar />
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
        <AppRouter />
      </div>
      <ModalAbrirCaja />
    </div>
  );
}

function App() {
  // [SQLite] Inicializar BD local y sincronizar productos al iniciar la app.
  // Sin token no se llama al backend: la pantalla de login no debe disparar
  // un 401 ni la expiración de una sesión que todavía no existe.
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log("[SQLite] Base de datos inicializada");
      } catch (error) {
        console.error("[SQLite] Error al inicializar:", error);
      }

      if (!getStoredAccessToken()) return;

      await syncProductos();
      console.log("[SQLite] Productos sincronizados");

      // El sync pudo haber disparado una expiración definitiva (refresh
      // rechazado). En ese caso no arrancar el loop hasta re-loguear.
      if (getStoredAccessToken()) {
        startRetryLoop();
      }
    };
    init();

    // Sesión vencida: no seguir intentando sincronizar hasta re-loguear.
    // La cola SQLite queda intacta.
    const handleSessionExpired = () => stopRetryLoop();

    // Login/refresh exitoso: reanudar sync de pendientes y catálogo.
    const handleSessionRestored = () => {
      startRetryLoop();
      void flushColaEventos().catch((error) => {
        console.error("[SQLite] Error al sincronizar cola tras login:", error);
      });
      void syncProductos();
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener(AUTH_SESSION_RESTORED_EVENT, handleSessionRestored);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener(AUTH_SESSION_RESTORED_EVENT, handleSessionRestored);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SesionProvider>
         <AppLayout />
       </SesionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
