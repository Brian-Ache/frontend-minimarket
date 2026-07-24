import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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

  return (
    <div className="w-full border-b border-border bg-background px-3 py-2 flex items-center justify-between">

      <div className="font-bold text-xl text-[#4a90e2]">
        POS System
      </div>

      {/* Desktop */}
      <div className="hidden md:flex gap-2">
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
      </div>

      {/* Hamburger */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

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
          </div>
        </div>
      )}
    </div>
  );
}
