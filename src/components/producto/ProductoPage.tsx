/**
 * ProductoPage — Página principal de gestión de productos.
 *
 * Usa un estado `refreshKey` como mecanismo de "notificación" entre hermanos.
 * Cuando FormProducto crea un producto, incrementa refreshKey, lo que provoca
 * que TablaProductos re-ejecute su fetch y muestre el nuevo producto al instante.
 * Sin esto, la tabla no se entera de que se creó un producto porque son
 * componentes hermanos que no comparten estado directamente.
 */
import { useState } from "react";
import FormProducto from "./FormProducto";
import TablaProductos from "./TablaProductos";


export default function ProductoPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 overflow-hidden">

      {/* ➕ Formulario */}
      <div className="shrink-0">
        <FormProducto onCreated={() => setRefreshKey((k) => k + 1)} />
      </div>

      {/* 📋 Tabla */}
      <div className="flex-1 min-h-0">
        <TablaProductos refreshKey={refreshKey} onRefresh={() => setRefreshKey((k) => k + 1)} />
      </div>

    </div>
  );
}