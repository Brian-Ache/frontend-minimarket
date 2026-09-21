import { Button } from "@/components/ui/button";
import { useState } from 'react';
import RegistrarUsModal from "./modals/registrarUsModal";
// [SQLite] Importar servicio de sincronización
import { syncProductos } from "@/services/venta/syncService";


export default function ConfiguracionPage() {
  // 2. ✅ LOS HOOKS DEBEN IR AQUÍ (Dentro del componente)
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  // [SQLite] Estado para mensaje de sincronización
  const [mensajeSync, setMensajeSync] = useState("");

  // [SQLite] Sincronizar productos desde el backend hacia SQLite
  const sincronizarCatalogo = async () => {
    setCargando(true);
    setMensajeSync("");
    try {
      console.log("[SQLite] Sincronizando productos...");
      const resultado = await syncProductos();
      setMensajeSync(resultado.mensaje);
      console.log("[SQLite] Sincronización:", resultado.mensaje);
    } catch (error) {
      console.error("[SQLite] Error al sincronizar:", error);
      setMensajeSync("Error al sincronizar");
    } finally {
      setCargando(false);
    }
  };

  const abriModal = () => setModalAbierto(true);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Configuración del POS</h1>
      {/* [SQLite] Botón de sincronización manual con feedback */}
      <div className="flex items-center gap-2 m-2">
        <Button 
          variant="secondary" 
          onClick={sincronizarCatalogo}
          disabled={cargando}
        >
          {cargando ? "Sincronizando..." : "Sincronizar productos"}
        </Button>
        {mensajeSync && (
          <span className="text-sm text-slate-600">{mensajeSync}</span>
        )}
      </div>
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