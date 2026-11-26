import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSesion } from "@/context/SesionContext";

interface ModalAbrirCajaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbierto?: () => void;
}

export default function ModalAbrirCajaForm({
  open,
  onOpenChange,
  onAbierto,
}: ModalAbrirCajaFormProps) {
  const { abrir, sesion, loading } = useSesion();
  const [saldoInicial, setSaldoInicial] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaldoInicial("");
    setError("");
    setCargando(false);
  }, [open]);

  const handleAbrir = async () => {
    if (cargando) return;

    if (saldoInicial.trim() === "") {
      setError("Ingresá un monto válido (0 o más)");
      return;
    }

    const monto = Number(saldoInicial);
    if (!Number.isFinite(monto) || monto < 0) {
      setError("Ingresá un monto válido (0 o más)");
      return;
    }

    if (sesion) {
      setError("Ya hay una caja abierta. Debés cerrarla primero.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      await abrir(monto);
      onOpenChange(false);
      onAbierto?.();
    } catch (err: any) {
      const status = err.response?.status;
      const mensaje =
        err.response?.data?.error || err.message || "Error al abrir la caja";

      if (status === 409) {
        setError("Ya hay una caja abierta. Debés cerrarla primero.");
      } else if (status === 404) {
        setError("No hay sesión activa.");
      } else {
        setError(mensaje);
      }
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleAbrir();
    }
  };

  const handleOpenChange = (nuevo: boolean) => {
    if (cargando) return;
    onOpenChange(nuevo);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>
            Ingresá el efectivo inicial en caja para comenzar a vender.
            {typeof navigator !== "undefined" && !navigator.onLine && (
              <>
                <br />
                <span className="text-amber-600">
                  Sin conexión: la caja se abrirá localmente y se sincronizará al reconectar.
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Saldo inicial ($)</label>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={saldoInicial}
            onChange={(event) => {
              setSaldoInicial(event.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            disabled={cargando || loading}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!error && sesion && !cargando && (
            <p className="text-sm text-amber-600">Ya hay una caja abierta.</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cargando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAbrir}
            disabled={saldoInicial === "" || cargando || loading || !!sesion}
          >
            {cargando ? "Abriendo..." : "Abrir Caja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
