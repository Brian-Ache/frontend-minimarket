import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  getMovimientos,
  registrarSalida,
  type MovimientoCaja,
} from "@/services/cajaService";

const mensajeDeError = (err: unknown): string =>
  (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
  "No se pudo procesar la salida";

const formatFecha = (fecha: string): string => {
  const f = new Date(fecha);
  return `${f.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${f.toLocaleTimeString(
    "es-ES",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  )}`;
};

interface ModalSalida {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: () => void;
}

export default function ModalSalida({
    open,
    setOpen,
    onFocusBarcode
}:ModalSalida){
    const [valorSalida, setValorSalida] = useState(0);
    const [mensaje, setMensaje] = useState("");
    const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Centralizamos el cierre del modal aquí
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Si isOpen es false, significa que el modal se está cerrando por CUALQUIER motivo
    if (!isOpen) {
      setTimeout(() => {
        onFocusBarcode();
      }, 0);
    }
  };

    // Todos los movimientos del turno (GET /api/caja/v1/movimientos), sin filtro de tipo
    useEffect(() => {
        if (!open) return;

        setCargando(true);
        setError(null);
        getMovimientos()
            .then(setMovimientos)
            .catch((err) => setError(mensajeDeError(err)))
            .finally(() => setCargando(false));
    }, [open]);

    // POST /api/caja/v1/salidas — el backend responde con el movimiento ya guardado
    const enviarSalida = async (valor: number, motivo: string) => {
        if (guardando) return;
        if (!Number.isFinite(valor) || valor <= 0) {
            setError("El monto debe ser mayor a 0");
            return;
        }
        if (!motivo.trim()) {
            setError("Ingresá un motivo para la salida");
            return;
        }

        setError(null);
        setGuardando(true);
        try {
            const movimiento = await registrarSalida(valor, motivo.trim());
            setMovimientos((prev) => [movimiento, ...prev]);
            setValorSalida(0);
            setMensaje("");
        } catch (err) {
            setError(mensajeDeError(err));
        } finally {
            setGuardando(false);
        }
    };

    // Enter registra la salida sin cerrar el modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open || guardando) return;

            if (e.key === "Enter") {
                enviarSalida(valorSalida, mensaje);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, valorSalida, mensaje, guardando]);


    return(
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Salida de Dinero</DialogTitle>
                    <DialogDescription>Completa los campos para registrar un nuevo movimiento.</DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <Input
                        type="number"
                        placeholder="Monto ($)"
                        value={valorSalida === 0 ? "" : valorSalida}
                        onChange={(e) => setValorSalida(Number(e.target.value))}
                    />
                    <Input
                        type="text"
                        placeholder="Agregar una descripcion"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Movimientos del turno — GET /api/caja/v1/movimientos; el color del
                    monto distingue ENTRADA (verde) de SALIDA (rojo) */}
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md mt-4">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="p-2 text-slate-600 font-semibold w-1/4">Fecha</th>
                                <th className="p-2 text-slate-600 font-semibold w-1/4">Origen</th>
                                <th className="p-2 text-slate-600 font-semibold w-1/4">Motivo</th>
                                <th className="p-2 text-slate-600 font-semibold w-1/4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                            {cargando ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4 text-slate-400">Cargando movimientos...</td>
                                </tr>
                            ) : movimientos.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4 text-slate-400">No hay movimientos en este turno.</td>
                                </tr>
                            ) : (
                                movimientos.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 text-xs text-slate-500">
                                            {formatFecha(mov.fecha)}
                                        </td>
                                        <td className="p-2 text-xs text-slate-500 capitalize">
                                            {mov.origen}
                                        </td>
                                        <td className="p-2 font-medium">{mov.motivo ?? "—"}</td>
                                        <td
                                            className={`p-2 text-right font-semibold ${
                                                mov.tipo === "ENTRADA" ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            ${mov.monto}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        disabled={guardando}
                        onClick={() => enviarSalida(valorSalida, mensaje)}
                    >
                        {guardando ? "Guardando..." : "Aceptar"}
                    </Button>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}