import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSesion } from "@/context/SesionContext";

interface ModalCorteCajaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se invoca después de cerrar la caja con éxito (para que el padre recargue o navegue). */
  onCerrado: () => void;
}

/**
 * Cierre de caja compartido: lo usan Configuración y la página de Corte.
 * Usa la sesión del contexto, que puede ser local (offline) o remota.
 */
export default function ModalCorteCaja({ open, onOpenChange, onCerrado }: ModalCorteCajaProps) {
  const { sesion, cargar, cerrarCaja } = useSesion();
  const [saldoReal, setSaldoReal] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setSaldoReal("");
    setError("");
    setCargando(true);

    // Releer la sesión: puede haber quedado abierta localmente sin conexión.
    void cargar().finally(() => {
      if (mounted) setCargando(false);
    });

    return () => {
      mounted = false;
    };
  }, [open, cargar]);

  const confirmarCierre = async () => {
    const monto = parseFloat(saldoReal);
    if (isNaN(monto) || monto < 0) {
      setError("Ingresá un monto válido (0 o más)");
      return;
    }

    setCerrando(true);
    setError("");
    try {
      await cerrarCaja(monto, 0);
      onOpenChange(false);
      onCerrado();
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
        (err as Error).message ||
        "Error al cerrar la caja";
      setError(mensaje);
    } finally {
      setCerrando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
          <DialogDescription>
            {sesion && (
              <>
                Sesión abierta desde el {new Date(sesion.fechaApertura).toLocaleString()}.
                Saldo inicial: ${sesion.saldoInicial}
                {sesion.origen === "OFFLINE" && (
                  <>
                    <br />
                    <span className="text-amber-600">
                      Sesión abierta sin conexión: el corte se sincronizará al reconectar.
                    </span>
                  </>
                )}
                <br />
              </>
            )}
            Ingresá cuánto dinero hay físicamente en la caja para cerrar el turno.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Saldo real en caja ($)</label>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={saldoReal}
            onChange={(e) => {
              setSaldoReal(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmarCierre();
              }
            }}
            disabled={cargando}
            autoFocus
          />
          {!cargando && !sesion && !error && (
            <p className="text-sm text-red-500">No hay caja abierta para cerrar</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cerrando}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={confirmarCierre}
            disabled={saldoReal === "" || cerrando || cargando || !sesion}
          >
            {cerrando ? "Cerrando..." : "Confirmar Cierre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
