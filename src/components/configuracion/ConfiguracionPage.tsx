import { Button } from "@/components/ui/button";
import { useState } from 'react';
import RegistrarUsModal from "./modals/registrarUsModal";
// [SQLite] Importar servicio de sincronización
import { syncProductos } from "@/services/venta/syncService";
import { useSesion } from "@/context/SesionContext";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import ModalCorteCaja from "@/components/corte/ModalCorteCaja";


export default function ConfiguracionPage() {
  const { cerrar, abrir } = useSesion();
  const { clearJustLoggedIn } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  // [SQLite] Estado para mensaje de sincronización
  const [mensajeSync, setMensajeSync] = useState("");

  // Estado para el modal de cierre de caja (componente compartido en components/corte)
  const [modalCorteAbierto, setModalCorteAbierto] = useState(false);

  // Estado para abrir caja
  const [saldoInicial, setSaldoInicial] = useState("");
  const [cargandoApertura, setCargandoApertura] = useState(false);
  const [errorApertura, setErrorApertura] = useState("");

  const handleAbrir = async () => {
    const monto = parseFloat(saldoInicial);
    if (isNaN(monto) || monto < 0) {
      setErrorApertura("Ingresá un monto válido (0 o más)");
      return;
    }
    setCargandoApertura(true);
    setErrorApertura("");
    try {
      await abrir(monto);
      console.log("Caja abierta exitosamente");
      clearJustLoggedIn();
      setSaldoInicial("");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error al abrir la caja";
      console.error("Error al abrir caja:", msg);
      setErrorApertura(msg);
    } finally {
      setCargandoApertura(false);
    }
  };

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

      <div className="flex items-center gap-2 m-2">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={handleAbrir}
          disabled={cargandoApertura}
        >
          {cargandoApertura ? "Abriendo..." : "Abrir Caja"}
        </Button>
        <Input
          type="number"
          min="0"
          step="any"
          placeholder="Saldo inicial $"
          value={saldoInicial}
          onChange={(e) => { setSaldoInicial(e.target.value); setErrorApertura(""); }}
          className="w-32"
        />
        {errorApertura && (
          <span className="text-sm text-red-500">{errorApertura}</span>
        )}
      </div>
      <Button
        className="m-2"
        variant="destructive"
        onClick={() => setModalCorteAbierto(true)}
      >
        Cerrar Caja
      </Button>

      <RegistrarUsModal open={modalAbierto} onOpenChange={setModalAbierto} />

      {/* Modal de confirmación de cierre de caja — componente compartido con el Corte */}
      <ModalCorteCaja
        open={modalCorteAbierto}
        onOpenChange={setModalCorteAbierto}
        onCerrado={() => {
          console.log("Caja cerrada exitosamente");
          cerrar();
          clearJustLoggedIn();
          setMensajeSync("Caja cerrada exitosamente");
        }}
      />
    </div>
  );
}
