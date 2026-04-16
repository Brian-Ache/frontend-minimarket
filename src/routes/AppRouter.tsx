import { Routes, Route } from "react-router-dom";
import Venta from "../pages/Venta";
import Productos from "../pages/Productos";
import Compras from "../pages/Compras";
import Corte from "../pages/Corte";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/Configuracion";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Venta />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/compras" element={<Compras />} />
      <Route path="/corte" element={<Corte />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/configuracion" element={<Configuracion />} />
    </Routes>
  );
}