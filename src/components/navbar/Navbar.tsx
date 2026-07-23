import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="w-full border-b border-border bg-background px-3 py-2 flex items-center justify-between">

      {/* 🏷️ Logo / Nombre */}
      <div className="font-bold text-lg">
        POS System
      </div>

      {/* 🧭 Navegación */}
      <div className="flex gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link className={""}key={item.path} to={item.path}>
              <Button variant={isActive ? "default" : "ghost"}>
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
