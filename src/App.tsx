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
import { syncProductos, startRetryLoop } from "./services/venta/syncService";

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {!isLoginPage && (
        <div className="shrink-0">
          <Navbar />
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
        <AppRouter />
      </div>
    </div>
  );
}

function App() {
  // [SQLite] Inicializar BD local y sincronizar productos al iniciar la app
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log("[SQLite] Base de datos inicializada");
        await syncProductos();
        console.log("[SQLite] Productos sincronizados");
      } catch (error) {
        console.error("[SQLite] Error al inicializar:", error);
      }
    };
    init();
    // [SQLite] Iniciar loop de reintento de tickets pendientes
    startRetryLoop();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
