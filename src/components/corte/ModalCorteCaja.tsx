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
import { getSesionActiva, cerrarSesion, type SesionActiva } from "@/services/cajaService";

interface ModalCorteCajaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se invoca después de cerrar la caja con éxito (para que el padre recargue o navegue). */
  onCerrado: () => void;
}

/**
 * Cierre de caja compartido: lo usan Configuración y la página de Corte.
 * Al abrir busca la sesión activa (404 → no hay caja abierta) y cierra con saldoReal.
 */
export default function ModalCorteCaja({ open, onOpenChange, onCerrado }: ModalCorteCajaProps) {
  const [sesion, setSesion] = useState<SesionActiva | null>(null);
  const [saldoReal, setSaldoReal] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setSesion(null);
    setSaldoReal("");
    setError("");
    setCargando(true);

    getSesionActiva()
      .then((sesionActiva) => {
        if (mounted) setSesion(sesionActiva);
      })
      .catch((err) => {
        if (!mounted) return;
        const response = (err as { response?: { status?: number; data?: { error?: string } } }).response;
        if (response?.status === 404) {
          setError("No hay caja abierta para cerrar");
        } else {
          setError(response?.data?.error || "Error al buscar la caja abierta");
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  const confirmarCierre = async () => {
    const monto = parseFloat(saldoReal);
    if (isNaN(monto) || monto < 0) {
      setError("Ingresá un monto válido (0 o más)");
      return;
    }

    setCerrando(true);
    setError("");
    try {
      await cerrarSesion(monto, 0);
      onOpenChange(false);
      onCerrado();
    } catch (err) {
      setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al cerrar la caja");
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
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cerrando}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={confirmarCierre}
            disabled={saldoReal === "" || cerrando || cargando}
          >
            {cerrando ? "Cerrando..." : "Confirmar Cierre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
