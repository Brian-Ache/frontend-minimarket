import { Button } from "@/components/ui/button";
import { useState } from 'react';
import RegistrarUsModal from "./modals/registrarUsModal";
// [SQLite] Importar servicio de sincronización
import { syncProductos } from "@/services/venta/syncService";
import { useSesion } from "@/context/SesionContext";
import { useAuth } from "@/context/AuthContext";
import ModalCorteCaja from "@/components/corte/ModalCorteCaja";
import ModalAbrirCajaForm from "@/components/caja/ModalAbrirCajaForm";
import ModalEventosCola from "./modals/ModalEventosCola";


export default function ConfiguracionPage() {
  const { sesion, loading } = useSesion();
  const { clearJustLoggedIn } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  // [SQLite] Estado para mensaje de sincronización
  const [mensajeSync, setMensajeSync] = useState("");

  // Estado para el modal de cierre de caja (componente compartido en components/corte)
  const [modalCorteAbierto, setModalCorteAbierto] = useState(false);
  // [SQLite] Modal de solo lectura de la cola de eventos
  const [modalEventosAbierto, setModalEventosAbierto] = useState(false);
  // Modal para abrir la caja con el monto inicial
  const [modalAperturaAbierto, setModalAperturaAbierto] = useState(false);

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
        <Button
          variant="secondary"
          onClick={() => setModalEventosAbierto(true)}
        >
          Ver cola de eventos
        </Button>
      </div>
      <Button
        className="m-2"
        variant="secondary"
        onClick={abriModal}
      >
        Registrar
      </Button>

      <div className="flex items-center gap-2 m-2">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setModalAperturaAbierto(true)}
          disabled={loading || !!sesion}
        >
          {loading ? "Verificando..." : sesion ? "Caja abierta" : "Abrir Caja"}
        </Button>
      </div>
      <Button
        className="m-2"
        variant="destructive"
        onClick={() => setModalCorteAbierto(true)}
      >
        Cerrar Caja
      </Button>

      <RegistrarUsModal open={modalAbierto} onOpenChange={setModalAbierto} />

      <ModalAbrirCajaForm
        open={modalAperturaAbierto}
        onOpenChange={setModalAperturaAbierto}
        onAbierto={() => {
          clearJustLoggedIn();
          setMensajeSync("Caja abierta exitosamente");
        }}
      />

      <ModalEventosCola
        open={modalEventosAbierto}
        onOpenChange={setModalEventosAbierto}
      />

      {/* Modal de confirmación de cierre de caja — componente compartido con el Corte */}
      <ModalCorteCaja
        open={modalCorteAbierto}
        onOpenChange={setModalCorteAbierto}
        onCerrado={() => {
          console.log("Caja cerrada exitosamente");
          clearJustLoggedIn();
          setMensajeSync("Caja cerrada exitosamente");
        }}
      />
    </div>
  );
}
