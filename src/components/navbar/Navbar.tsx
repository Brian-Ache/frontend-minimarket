import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Venta", path: "/" },
  { name: "Productos", path: "/productos" },
  { name: "Compras", path: "/compras" },
  { name: "Corte", path: "/corte" },
  { name: "Reportes", path: "/reportes" },
  { name: "Configuración", path: "/configuracion" },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const [aviso, setAviso] = useState<string | null>(null);
  const avisoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (avisoTimer.current) clearTimeout(avisoTimer.current);
  }, []);

  const mostrarAviso = (texto: string) => {
    setAviso(texto);
    if (avisoTimer.current) clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(null), 4000);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
      setAviso(null);
    } catch {
      mostrarAviso("Sin conexión: no se pudo cerrar la sesión");
    }
  };

  const botonSalir = (className?: string) => (
    <Button variant="ghost" className={className} onClick={handleLogout}>
      <LogOut className="w-4 h-4 mr-1" />
      Cerrar sesión
    </Button>
  );

  return (
    <div className="w-full border-b border-border bg-background px-3 py-2 flex items-center justify-between relative">

      <div className="font-bold text-xl text-[#4a90e2]">
        POS System
      </div>

      {/* Desktop */}
      <div className="hidden md:flex gap-2 items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button variant={isActive ? "default" : "ghost"}>
                {item.name}
              </Button>
            </Link>
          );
        })}
        {botonSalir()}
      </div>

      {/* Hamburger */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Aviso de warning (sin conexión) */}
      {aviso && (
        <p className="absolute left-0 -bottom-8 md:left-auto md:right-3 bg-amber-50 border border-amber-300 text-amber-700 text-xs px-3 py-1 rounded-md shadow-sm z-50">
          {aviso}
        </p>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-12 left-0 w-full bg-background border-b border-border shadow-md z-50 md:hidden">
          <div className="flex flex-col p-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            {botonSalir("w-full justify-start")}
          </div>
        </div>
      )}
    </div>
  );
}
