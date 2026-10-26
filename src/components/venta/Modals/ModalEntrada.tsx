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
  registrarEntrada,
  type MovimientoCaja,
} from "@/services/cajaService";

const mensajeDeError = (err: unknown): string =>
  (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
  "No se pudo procesar la entrada";

const formatFecha = (fecha: string): string => {
  const f = new Date(fecha);
  return `${f.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${f.toLocaleTimeString(
    "es-ES",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  )}`;
};

interface ModalEntradaProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: () => void;
}

export default function ModalEntrada({
    open,
    setOpen,
    onFocusBarcode
}: ModalEntradaProps){
    const [valorEntrada, setValorEntrada] = useState<number>(0);
    const [mensaje, setMensaje] = useState<string>("");
    const [entradas, setEntradas] = useState<MovimientoCaja[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Centralizamos el cierre del modal aquí
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => {
                onFocusBarcode();
            }, 0);
        }
    };

    // Movimientos del turno abierto (GET /api/caja/v1/movimientos), solo tipo ENTRADA
    useEffect(() => {
        if (!open) return;

        setCargando(true);
        setError(null);
        getMovimientos()
            .then((movimientos) =>
                setEntradas(movimientos.filter((m) => m.tipo === "ENTRADA"))
            )
            .catch((err) => setError(mensajeDeError(err)))
            .finally(() => setCargando(false));
    }, [open]);

    // POST /api/caja/v1/entradas — el backend responde con el movimiento ya guardado
    const enviarEntrada = async (valor: number, motivo: string) => {
        if (guardando) return;
        if (!Number.isFinite(valor) || valor <= 0) {
            setError("El monto debe ser mayor a 0");
            return;
        }
        if (!motivo.trim()) {
            setError("Ingresá un motivo para la entrada");
            return;
        }

        setError(null);
        setGuardando(true);
        try {
            const movimiento = await registrarEntrada(valor, motivo.trim());
            setEntradas((prev) => [movimiento, ...prev]);
            setValorEntrada(0);
            setMensaje("");
        } catch (err) {
            setError(mensajeDeError(err));
        } finally {
            setGuardando(false);
        }
    };

    // MANEJO DE MODAL CON TECLA Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open || guardando) return;
        
            if (e.key === "Enter") {
                enviarEntrada(valorEntrada, mensaje);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, valorEntrada, mensaje, guardando]);

    return(
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Entrada de Dinero</DialogTitle>
                    <DialogDescription>Completa los campos para registrar un nuevo movimiento.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3">
                    <Input
                        type="number"
                        placeholder="Monto ($)"
                        value={valorEntrada === 0 ? "" : valorEntrada}
                        onChange={(e) => setValorEntrada(Number(e.target.value))}
                    />
                    <Input
                        type="text"
                        placeholder="Agregar una descripción o motivo"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}        
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Tabla de entradas del turno — GET /api/caja/v1/movimientos */}
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
                                    <td colSpan={4} className="text-center p-4 text-slate-400">Cargando entradas...</td>
                                </tr>
                            ) : entradas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4 text-slate-400">No hay entradas en este turno.</td>
                                </tr>
                            ) : (
                                entradas.map((entrada) => (
                                    <tr key={entrada.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 text-xs text-slate-500">
                                            {formatFecha(entrada.fecha)}
                                        </td>
                                        <td className="p-2 text-xs text-slate-500 capitalize">
                                            {entrada.origen}
                                        </td>
                                        <td className="p-2 font-medium">{entrada.motivo ?? "—"}</td>
                                        <td className={`p-2 text-right font-semibold text-green-600`}>
                                            ${entrada.monto}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                    <Button
                        disabled={guardando}
                        onClick={() => enviarEntrada(valorEntrada, mensaje)}
                    >
                        {guardando ? "Guardando..." : "Aceptar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}