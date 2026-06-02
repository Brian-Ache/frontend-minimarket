import BarraBusquedaProducto from "./BarraBusquedaProducto";
import FormProducto from "./FormProducto";
import TablaProductos from "./TablaProductos";


export default function ProductoPage() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 overflow-hidden">

      {/* 🔍 Buscar / escanear 
      <div className="shrink-0">
        <BarraBusquedaProducto />
      </div>*/}

      {/* ➕ Formulario */}
      <div className="shrink-0">
        <FormProducto />
      </div>

      {/* 📋 Tabla */}
      <div className="flex-1 min-h-0">
        <TablaProductos />
      </div>

    </div>
  );
}