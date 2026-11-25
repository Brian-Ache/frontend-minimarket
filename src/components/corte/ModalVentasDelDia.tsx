import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  anularVenta,
  getVentasPorFechaCompleto,
  type Venta,
} from "@/services/ventaService";
import { rangoDelDia } from "./fechas";

interface ModalVentasDelDiaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  onVentaAnulada?: () => void;
}

function horaDe(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function fechaDe(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR");
}

function formatearMonto(n: number): string {
  return `$${Number(n).toFixed(2)}`;
}

export default function ModalVentasDelDia({
  open,
  onOpenChange,
  date,
  onVentaAnulada,
}: ModalVentasDelDiaProps) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anulandoId, setAnulandoId] = useState<string | null>(null);
  const [errorAnulacion, setErrorAnulacion] = useState<string | null>(null);
  const [anuladas, setAnuladas] = useState<Set<string>>(new Set());
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const { desde, hasta } = rangoDelDia(date);
    setCargando(true);
    setError(null);
    setErrorAnulacion(null);
    setAnuladas(new Set());

    getVentasPorFechaCompleto(desde, hasta)
      .then((lista) => {
        if (!mounted) return;
        const ordenadas = [...lista].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setVentas(ordenadas);
        setSelectedId(ordenadas[0]?.id ?? null);
      })
      .catch((err) => {
        if (mounted) {
          setError(
            (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
              "Error al cargar las ventas del día"
          );
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, date]);

  useEffect(() => {
    setErrorAnulacion(null);
  }, [selectedId]);

  const seleccionada = useMemo(
    () => ventas.find((venta) => venta.id === selectedId) ?? ventas[0] ?? null,
    [ventas, selectedId]
  );

  useEffect(() => {
    if (!selectedId) return;
    const elemento = listaRef.current?.querySelector(
      `[data-ticket-id="${selectedId}"]`
    );
    elemento?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const estadoVisible = (venta: Venta) => {
    if (anuladas.has(venta.id)) {
      return { texto: "Anulada", clase: "text-slate-500", simbolo: "—" };
    }
    if (venta.requiereRevision) {
      return { texto: "Requiere revisión", clase: "text-amber-600", simbolo: "!" };
    }
    if (!venta.cobrada) {
      return { texto: "Sin cobrar", clase: "text-amber-600", simbolo: "!" };
    }
    return { texto: "Cobrada", clase: "text-emerald-600", simbolo: "✓" };
  };

  const moverSeleccion = (delta: number) => {
    setSelectedId((actual) => {
      if (ventas.length === 0) return actual;
      const indice = ventas.findIndex((venta) => venta.id === actual);
      const siguiente = Math.min(
        Math.max(indice + delta, 0),
        ventas.length - 1
      );
      return ventas[siguiente]?.id ?? actual;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (ventas.length === 0) return;
    event.preventDefault();
    moverSeleccion(event.key === "ArrowDown" ? 1 : -1);
  };

  const handleAnular = async (venta: Venta) => {
    const total = formatearMonto(venta.total);
    if (!window.confirm(`¿Anular la venta de las ${horaDe(venta.fecha)} por ${total}?`)) {
      return;
    }

    setAnulandoId(venta.id);
    setErrorAnulacion(null);

    try {
      await anularVenta(venta.id);
      setAnuladas((prev) => {
        const siguiente = new Set(prev);
        siguiente.add(venta.id);
        return siguiente;
      });
      onVentaAnulada?.();
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
        (err as Error).message ||
        "No se pudo anular la venta";
      setErrorAnulacion(mensaje);
    } finally {
      setAnulandoId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[55vw] h-[80vh] overflow-hidden !flex !flex-col rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="shrink-0 border-b border-slate-200 px-4 py-3">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800">
            Ventas del Día
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle de ventas del día {date.toLocaleDateString("es-AR")}.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-red-600">
            {error}
          </div>
        ) : cargando ? (
          <div className="flex flex-1 min-h-[320px] items-center justify-center text-slate-500">
            Cargando ventas...
          </div>
        ) : (
          <div className="grid flex-1 min-h-0 grid-cols-[0.9fr_1.8fr] overflow-hidden">
            <section className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50">
              <div className="shrink-0 border-b border-slate-200 px-3 py-2 text-lg font-semibold text-slate-700">
                Lista de Tickets
              </div>

              <div
                ref={listaRef}
                className="flex-1 min-h-0 space-y-2 overflow-y-auto p-3"
              >
                {ventas.length === 0 ? (
                  <div className="text-sm text-slate-500">No hay ventas en este día.</div>
                ) : (
                  ventas.map((venta) => {
                    const isSelected = venta.id === seleccionada?.id;
                    const estado = estadoVisible(venta);

                    return (
                      <button
                        key={venta.id}
                        type="button"
                        data-ticket-id={venta.id}
                        onClick={() => setSelectedId(venta.id)}
                        className={[
                          "w-full border px-2 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                          anuladas.has(venta.id) ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            • {horaDe(venta.fecha)} - {formatearMonto(venta.total)}
                          </span>
                          <span className={`text-xs font-semibold ${estado.clase}`}>
                            {estado.simbolo}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="shrink-0 flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-sm text-slate-500">
                <span>[↑/↓] Navegar</span>
                <span>{date.toLocaleDateString("es-AR")}</span>
              </div>
            </section>

            <section className="flex min-h-0 flex-col bg-white">
              <div className="shrink-0 border-b border-slate-200 px-3 py-2 text-lg font-semibold text-slate-700">
                Detalle del Ticket Seleccionado
              </div>

              {!seleccionada ? (
                <div className="p-4 text-slate-500">No hay ticket seleccionado.</div>
              ) : (
                <div className="flex flex-1 min-h-0 flex-col gap-4 p-4">
                  <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-slate-500">Fecha:</span>{" "}
                      <span className="font-medium">{fechaDe(seleccionada.fecha)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Hora:</span>{" "}
                      <span className="font-medium">{horaDe(seleccionada.fecha)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Estado:</span>{" "}
                      <span className={`font-medium ${estadoVisible(seleccionada).clase}`}>
                        {estadoVisible(seleccionada).texto}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Total:</span>{" "}
                      <span className="text-xl font-bold text-slate-800">
                        {formatearMonto(seleccionada.total)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Método:</span>{" "}
                      <span className="font-medium">{seleccionada.metodoPago ?? "—"}</span>
                    </div>
                  </div>

                  {seleccionada.requiereRevision && !anuladas.has(seleccionada.id) && (
                    <div className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      Esta venta requiere revisión.
                    </div>
                  )}

                  <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-100">
                        <tr>
                          <th className="p-2 font-semibold text-slate-700">Producto</th>
                          <th className="p-2 font-semibold text-slate-700">Cant</th>
                          <th className="p-2 font-semibold text-slate-700">Precio</th>
                          <th className="p-2 text-right font-semibold text-slate-700">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {seleccionada.detalles.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-3 text-slate-500">
                              Sin productos en este ticket.
                            </td>
                          </tr>
                        ) : (
                          seleccionada.detalles.map((detalle, index) => (
                            <tr key={`${detalle.idProducto}-${index}`} className="hover:bg-slate-50">
                              <td className="p-2 text-slate-700">
                                {detalle.nombre ?? "Producto"}
                              </td>
                              <td className="p-2 text-slate-700">{detalle.cantidad}</td>
                              <td className="p-2 text-slate-700">
                                {formatearMonto(detalle.precioUnitario)}
                              </td>
                              <td className="p-2 text-right text-slate-700">
                                {formatearMonto(detalle.subtotal)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="shrink-0 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xl font-bold text-slate-800">
                      <span>TOTAL:</span>
                      <span>{formatearMonto(seleccionada.total)}</span>
                    </div>

                    {!anuladas.has(seleccionada.id) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAnular(seleccionada)}
                        disabled={anulandoId === seleccionada.id}
                        className="mt-2 w-full border-red-200 text-red-700 hover:bg-red-50"
                      >
                        {anulandoId === seleccionada.id ? "Anulando..." : "Anular venta"}
                      </Button>
                    )}

                    {anuladas.has(seleccionada.id) && (
                      <p className="mt-2 text-center text-sm font-medium text-slate-500">
                        Venta anulada
                      </p>
                    )}

                    {errorAnulacion && (
                      <p className="mt-2 text-center text-sm text-red-600">{errorAnulacion}</p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="shrink-0 border-t border-slate-200 px-3 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-md border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            [Cerrar]
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
