import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={{ display: "flex", gap: "10px", padding: "10px", background: "#ddd" }}>
      <h1 className="bg-red-500">padre nuestro</h1>
      <Link to="/">Venta</Link>
      <Link to="/productos">Productos</Link>
      <Link to="/compras">Compras</Link>
      <Link to="/corte">Corte</Link>
      <Link to="/reportes">Reportes</Link>
      <Link to="/configuracion">Configuración</Link>
    </div>
  );
}