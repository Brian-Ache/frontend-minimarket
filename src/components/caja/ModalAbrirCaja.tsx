import { useState } from "react";
import { useSesion } from "@/context/SesionContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ModalAbrirCaja() {
  const { sesion, loading, abrir, recargar } = useSesion();
  const { isAuthenticated, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [saldoInicial, setSaldoInicial] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleAbrir = async () => {
    const monto = parseFloat(saldoInicial);
    if (isNaN(monto) || monto < 0) {
      setError("Ingresá un monto válido (0 o más)");
      return;
    }

    setCargando(true);
    setError("");
    try {
      await abrir(monto);
      clearJustLoggedIn();
      setSaldoInicial("");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al abrir la caja";
      if (msg.includes("Ya existe")) {
        await recargar();
        clearJustLoggedIn();
      } else {
        setError(msg);
      }
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAbrir();
    }
  };

  const handleCerrar = () => {
    clearJustLoggedIn();
  };

  // Solo mostrar inmediatamente después del login, si no hay sesión abierta
  if (loading || sesion || !isAuthenticated || !justLoggedIn) return null;

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-sm"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>
            Ingresá el efectivo inicial en caja para comenzar a vender.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Saldo inicial ($)
          </label>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={saldoInicial}
            onChange={(e) => {
              setSaldoInicial(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCerrar}>
            Cerrar
          </Button>
          <Button
            onClick={handleAbrir}
            disabled={saldoInicial === "" || cargando}
          >
            {cargando ? "Abriendo..." : "Abrir Caja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
