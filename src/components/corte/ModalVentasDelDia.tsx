import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getVentasPorFecha, type Venta } from "@/services/ventaService";
import { rangoDelDia } from "./fechas";

interface ModalVentasDelDiaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
}

/** Hora corta (HH:mm) de un timestamp ISO del backend (naive local). */
function horaDe(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatearMonto(n: number): string {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Ventas de un día desde la API (GET /api/ventas/v1/fecha), funciona para cualquier fecha.
 * El alcance (todas o solo las propias) lo decide el backend según el rol.
 */
export default function ModalVentasDelDia({ open, onOpenChange, date }: ModalVentasDelDiaProps) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techo, setTecho] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const { desde, hasta } = rangoDelDia(date);
    setCargando(true);
    setError(null);
    setTecho(false);

    getVentasPorFecha(desde, hasta, 0, 200)
      .then((lista) => {
        if (!mounted) return;
        const ordenadas = [...lista].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setVentas(ordenadas);
        setTecho(ordenadas.length === 200);
        setSelectedId(ordenadas[0]?.id ?? null);
      })
      .catch((err) => {
        if (mounted) {
          setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al cargar las ventas del día");
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, date]);

  const seleccionada = ventas.find((v) => v.id === selectedId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ventas del día</DialogTitle>
          <DialogDescription>
            {date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-hidden">
          {/* Lista de tickets */}
          <div className="border border-slate-200 rounded-md overflow-y-auto">
            {cargando ? (
              <p className="text-sm text-slate-400 text-center p-4">Cargando ventas...</p>
            ) : ventas.length === 0 ? (
              <p className="text-sm text-slate-400 text-center p-4">No hay ventas en este día.</p>
            ) : (
              <div className="flex flex-col">
                {ventas.map((venta) => (
                  <button
                    key={venta.id}
                    onClick={() => setSelectedId(venta.id)}
                    className={`flex items-center justify-between px-3 py-2.5 text-left border-b border-slate-100 last:border-b-0 transition-colors hover:bg-blue-50 ${
                      venta.id === selectedId ? "bg-blue-100/70" : ""
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-slate-400">
                        {horaDe(venta.fecha)}
                      </span>
                      <span className="text-sm text-slate-700 font-medium truncate">
                        {venta.metodoPago ?? "—"}
                        {!venta.cobrada && " (sin cobrar)"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 shrink-0 ml-2">
                      {formatearMonto(venta.total)}
                    </span>
                  </button>
                ))}
                {techo && (
                  <p className="text-[11px] text-slate-400 text-center p-2 border-t border-slate-100">
                    Se muestran las primeras 200 ventas del día.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Detalle del ticket seleccionado */}
          <div className="border border-slate-200 rounded-md overflow-y-auto p-3">
            {!seleccionada ? (
              <p className="text-sm text-slate-400 text-center p-4">Seleccioná un ticket.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {horaDe(seleccionada.fecha)} · {seleccionada.metodoPago ?? "—"}
                  </span>
                  {seleccionada.requiereRevision && (
                    <Badge variant="outline" className="text-amber-700 border-amber-300 text-[10px]">
                      Requiere revisión
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col divide-y divide-slate-100">
                  {seleccionada.detalles.map((det, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-slate-700 truncate pr-2">
                        {det.cantidad} × {det.nombre ?? "Ítem"}
                      </span>
                      <span className="text-slate-600 shrink-0">{formatearMonto(det.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-1">
                  <span className="text-sm font-semibold text-slate-700">Total</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatearMonto(seleccionada.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
