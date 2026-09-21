import { useEffect, useMemo, useState } from "react";
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
  getProductoById,
  getTicketDetalleLocal,
  getTicketsDia,
  type TicketDetalleLocal,
  type TicketLocal,
} from "@/services/venta/sqliteService";

type ProductoVenta = {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

type TicketVenta = {
  id: number;
  fecha: string;
  hora: string;
  total: number;
  estado: "Sincronizado" | "Pendiente";
  productos: ProductoVenta[];
};


interface ModalVentasDiaProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: () => void;
}

export default function ModalVentasDia({
  open,
  setOpen,
  onFocusBarcode,
}: ModalVentasDiaProps) {
  const [tickets, setTickets] = useState<TicketLocal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<TicketDetalleLocal[]>([]);
  const [loading, setLoading] = useState(false);

  //cada vez que se renderiza este modal se cargan los tickets de sqllite
  useEffect(() => {
    if (!open) return;

    let mounted = true;

    const cargarTickets = async () => {
      setLoading(true);

      try {
        const rows = await getTicketsDia();

        if (!mounted) return;

        const ordenados = [...rows].sort((a, b) => {
          return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime();
        });

        setTickets(ordenados);

        if (ordenados.length > 0) {
          setSelectedId(ordenados[0].id);
        } else {
          setSelectedId(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    cargarTickets();

    return () => {
      mounted = false;
    };
  }, [open]);

  //cada vez que se renderiza este modal se carga un arreglo de detalle con los productos de un ticket que este seleccionado
  useEffect(() => {
    if (!selectedId) {
      setDetalle([]);
      return;
    }

    const cargarDetalle = async () => {
      const rows = await getTicketDetalleLocal(selectedId);
      setDetalle(rows);
    };

    cargarDetalle();
  }, [selectedId]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null,
    [tickets, selectedId]
  );

  //un arreglo con los productos de un detalle de un ticket
  const [productos, setProductos] = useState<
    Array<{
      nombre: string;
      cantidad: number;
      precio: number;
      subtotal: number;
    }>
  >([]);

  //CUANDO SE RENDERIZA UN DETALLE vuelca cada uno de los productos en el arreglo de productos
  useEffect(() => {
    const resolverProductos = async () => {
      const productosResueltos = await Promise.all(
        detalle.map(async (item) => {
          const nombreProducto =
            item.nombre_manual ??
            (item.id_producto ? (await getProductoById(item.id_producto))?.nombre : null) ??
            "Producto";

          return {
            nombre: nombreProducto,
            cantidad: Number(item.cantidad),
            precio: Number(item.precio_unitario),
            subtotal: Number(item.precio_unitario * item.cantidad),
          };
        })
      );

      setProductos(productosResueltos);
    };

    resolverProductos();
  }, [detalle]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      setTimeout(() => {
        onFocusBarcode();
      }, 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl">
        <DialogHeader className="border-b border-slate-200 px-4 py-3">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800">
            Ventas del Día
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle de ventas del día.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center text-slate-500">
            Cargando ventas...
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_1.4fr]">
            <section className="min-h-[420px] border-r border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 px-3 py-2 text-lg font-semibold text-slate-700">
                Lista de Tickets
              </div>

              <div className="space-y-2 p-3">
                {tickets.length === 0 ? (
                  <div className="text-sm text-slate-500">No hay tickets guardados.</div>
                ) : (
                  tickets.map((ticket) => {
                    const isSelected = ticket.id === selectedTicket?.id;

                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => setSelectedId(ticket.id)}
                        className={[
                          "w-full border px-2 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            •{" "}
                            {new Date(ticket.creado_en).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            - ${Number(ticket.total).toFixed(2)}
                          </span>
                          <span
                            className={[
                              "text-xs font-semibold",
                              ticket.estado === "PENDIENTE"
                                ? "text-amber-600"
                                : "text-emerald-600",
                            ].join(" ")}
                          >
                            {ticket.estado === "PENDIENTE" ? "!" : "✓"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-200 px-3 py-2 text-sm text-slate-500">
                [t/↓] Navegar
              </div>
            </section>

            <section className="min-h-[420px] bg-white">
              <div className="border-b border-slate-200 px-3 py-2 text-lg font-semibold text-slate-700">
                Detalle del Ticket Seleccionado
              </div>

              {!selectedTicket ? (
                <div className="p-4 text-slate-500">No hay ticket seleccionado.</div>
              ) : (
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-slate-500">Fecha:</span>{" "}
                      <span className="font-medium">
                        {new Date(selectedTicket.creado_en).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Hora:</span>{" "}
                      <span className="font-medium">
                        {new Date(selectedTicket.creado_en).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Estado:</span>{" "}
                      <span
                        className={[
                          "font-medium",
                          selectedTicket.estado === "PENDIENTE"
                            ? "text-amber-600"
                            : "text-emerald-600",
                        ].join(" ")}
                      >
                        {selectedTicket.estado}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Total:</span>{" "}
                      <span className="text-xl font-bold text-slate-800">
                        ${Number(selectedTicket.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-md border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-2 font-semibold text-slate-700">Producto</th>
                          <th className="p-2 font-semibold text-slate-700">Cant</th>
                          <th className="p-2 font-semibold text-slate-700">Precio</th>
                          <th className="p-2 text-right font-semibold text-slate-700">Sub</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {productos.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-3 text-slate-500">
                              Sin productos en este ticket.
                            </td>
                          </tr>
                        ) : (
                          productos.map((producto, index) => (
                            <tr key={`${producto.nombre}-${index}`} className="hover:bg-slate-50">
                              <td className="p-2 text-slate-700">{producto.nombre}</td>
                              <td className="p-2 text-slate-700">{producto.cantidad}</td>
                              <td className="p-2 text-slate-700">
                                ${producto.precio.toFixed(2)}
                              </td>
                              <td className="p-2 text-right text-slate-700">
                                ${producto.subtotal.toFixed(2)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xl font-bold text-slate-800">
                      <span>TOTAL:</span>
                      <span>${Number(selectedTicket.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="border-t border-slate-200 px-3 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-md border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            [Cerrar]
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}