import { Button } from "@/components/ui/button";
import { useState } from 'react';
import RegistrarUsModal from "./modals/registrarUsModal";
// [SQLite] Importar servicio de sincronización
import { syncProductos } from "@/services/venta/syncService";
import { getSesionActiva, cerrarSesion, type SesionActiva } from "@/services/cajaService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


export default function ConfiguracionPage() {
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  // [SQLite] Estado para mensaje de sincronización
  const [mensajeSync, setMensajeSync] = useState("");

  // Estado para el modal de cierre de caja
  const [modalCorteAbierto, setModalCorteAbierto] = useState(false);
  const [saldoReal, setSaldoReal] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [errorCorte, setErrorCorte] = useState("");
  const [sesionEncontrada, setSesionEncontrada] = useState<SesionActiva | null>(null);

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

  const handleCerrarCaja = async () => {
    setErrorCorte("");
    setSesionEncontrada(null);
    try {
      const sesionActiva = await getSesionActiva();
      setSesionEncontrada(sesionActiva);
      setModalCorteAbierto(true);
    } catch {
      setErrorCorte("No hay caja abierta para cerrar");
    }
  };

  const confirmarCierre = async () => {
    const monto = parseFloat(saldoReal);
    if (isNaN(monto) || monto < 0) {
      setErrorCorte("Ingresá un monto válido (0 o más)");
      return;
    }

    setCerrando(true);
    setErrorCorte("");
    try {
      await cerrarSesion(monto, 0);
      setModalCorteAbierto(false);
      setSaldoReal("");
      setSesionEncontrada(null);
      setMensajeSync("Caja cerrada exitosamente");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al cerrar la caja";
      setErrorCorte(msg);
    } finally {
      setCerrando(false);
    }
  };

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

      <Button
        className="m-2"
        variant="destructive"
        onClick={handleCerrarCaja}
      >
        Cerrar Caja
      </Button>

      <RegistrarUsModal open={modalAbierto} onOpenChange={setModalAbierto} />

      {/* Modal de confirmación de cierre de caja */}
      <Dialog open={modalCorteAbierto} onOpenChange={setModalCorteAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
            <DialogDescription>
              {sesionEncontrada && (
                <>
                  Sesión abierta desde el {new Date(sesionEncontrada.fechaApertura).toLocaleString()}.
                  Saldo inicial: ${sesionEncontrada.saldoInicial}
                </>
              )}
              Ingresá cuánto dinero hay físicamente en la caja para cerrar el turno.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Saldo real en caja ($)
            </label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={saldoReal}
              onChange={(e) => {
                setSaldoReal(e.target.value);
                setErrorCorte("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmarCierre();
                }
              }}
              autoFocus
            />
            {errorCorte && (
              <p className="text-sm text-red-500">{errorCorte}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalCorteAbierto(false);
                setSaldoReal("");
                setErrorCorte("");
                setSesionEncontrada(null);
              }}
              disabled={cerrando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarCierre}
              disabled={saldoReal === "" || cerrando}
            >
              {cerrando ? "Cerrando..." : "Confirmar Cierre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
