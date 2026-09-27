import { useState, useEffect } from "react";
import { useSesion } from "@/context/SesionContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ModalAbrirCaja() {
  const { sesion, loading, abrir, cargar } = useSesion();
  const { isAuthenticated, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [saldoInicial, setSaldoInicial] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (justLoggedIn) {
      cargar();
    }
  }, [justLoggedIn]);

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
      console.log("Caja abierta exitosamente");
      clearJustLoggedIn();
      setSaldoInicial("");
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || "Error al abrir la caja";
      if (status === 409) {
        setError("Ya hay una caja abierta. Debés cerrarla primero.");
      } else if (status === 404) {
        setError("No hay sesión activa.");
      } else {
        setError(msg);
      }
      console.error("Error al abrir caja:", msg, "- Status:", status);
      await cargar();
      clearJustLoggedIn();
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

  if (loading) return (
    <Dialog open>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cargando...</DialogTitle>
          <DialogDescription>
            Verificando sesión de caja.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
  if (sesion || !isAuthenticated || !justLoggedIn) return null;

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
