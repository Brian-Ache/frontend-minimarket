import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import RegistrarUsModal from "./modals/registrarUsModal";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

const fetchProductosDesdeDB = async () => {
  return [
    { id: 1, barcode: "779100000001", nombre: "Gaseosa Coca Cola x1.5Lt", costo: 1800, margen: 40, precio: 2520, categoria: "Bebidas", proveedor: "Coca Cola" },
    { id: 2, barcode: "779100000002", nombre: "Gaseosa Pepsi x2.25Lt", costo: 2100, margen: 35, precio: 2835, categoria: "Bebidas", proveedor: "PepsiCo" },
    { id: 3, barcode: "779100000003", nombre: "Agua Mineral Villavicencio x1.5Lt", costo: 900, margen: 45, precio: 1305, categoria: "Bebidas", proveedor: "Villavicencio" },
    { id: 4, barcode: "779100000004", nombre: "Agua Saborizada Levite Manzana x1.5Lt", costo: 1100, margen: 35, precio: 1485, categoria: "Bebidas", proveedor: "Levite" }
  ];
}


export default function ConfiguracionPage() {
  // 2. ✅ LOS HOOKS DEBEN IR AQUÍ (Dentro del componente)
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  // 3. ✅ LAS FUNCIONES QUE USAN EL ESTADO TAMBIÉN VAN AQUÍ
  const sincronizarCatalogo = async () => {
    setCargando(true);
    try {
      console.log("Sincronizando...");
      const datosNuevos = await fetchProductosDesdeDB();
      localStorage.setItem('pos_productos', JSON.stringify(datosNuevos));
      setProductos(datosNuevos);
      console.log("Sincronización exitosa");
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      setCargando(false);
    }
  };

  const abriModal = () => setModalAbierto(true);

  useEffect(() => {
    sincronizarCatalogo();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Configuración del POS</h1>
      <Button 
        className="m-2" 
        variant="secondary" 
        onClick={sincronizarCatalogo}
        disabled={cargando}
      >
        {cargando ? "Sincronizando..." : "Sincronizar"}
      </Button>
      <Button
        className="m-2"
        variant="secondary"
        onClick={abriModal}
      >
        Registrar
      </Button>

      <RegistrarUsModal open={modalAbierto} onOpenChange={setModalAbierto} />
    </div>
  );
}