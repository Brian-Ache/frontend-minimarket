import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RotateCcw, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCompras } from "@/hooks/useCompras";
import { eliminarCompra } from "@/services/compraService";
import type { CompraResponse } from "@/services/compraService";

interface HistorialComprasProps {
  refreshKey?: number;
}

export default function HistorialCompras({ refreshKey = 0 }: HistorialComprasProps) {
  const { user } = useAuth();
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraResponse | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    compras,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    // Filtros
    proveedorId, setProveedorId,
    tipoComprobante, setTipoComprobante,
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    periodo, setPeriodo,
    sortTotal, setSortTotal,
    proveedores,
    tipoComprobanteOpciones,
  } = useCompras(refreshKey + refreshCounter);

  // Auto-scroll: cuando selectedIndex sale del área visible del contenedor, scrollea
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const tbody = container.querySelector("tbody");
    if (!tbody || !tbody.children[selectedIndex]) return;

    const fila = tbody.children[selectedIndex] as HTMLElement;
    const filaTop = fila.offsetTop;
    const filaBottom = filaTop + fila.offsetHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    if (filaBottom > scrollTop + clientHeight) {
      container.scrollTop = filaBottom - clientHeight;
    } else if (filaTop < scrollTop) {
      const thead = container.querySelector("thead");
      const theadHeight = thead ? thead.offsetHeight : 0;
      container.scrollTop = filaTop - theadHeight;
    }
  }, [selectedIndex]);

  // Navegación por teclado (patrón idéntico a TablaProductos)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === "INPUT";

      if (e.key === "ArrowDown" && !isInputFocused) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, compras.length - 1));
      }

      if (e.key === "ArrowUp" && !isInputFocused) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Enter" && compras.length > 0 && !openModal) {
        e.preventDefault();
        setCompraSeleccionada(compras[selectedIndex]);
        setOpenModal(true);
      }

      if (e.key === "Escape") {
        setOpenModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [compras, selectedIndex, openModal]);

  const handleRowClick = (compra: CompraResponse) => {
    setCompraSeleccionada(compra);
    setOpenModal(true);
  };

  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta compra?A los productos involucrados se les descontaran los cantidades correspodientes a esta compra")) return;
    if (!user) { alert("No hay usuario autenticado"); return; }
    try {
      await eliminarCompra(id, user.id);
      setRefreshCounter((k) => k + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar la compra");
    }
  };

  // Reset selectedIndex cuando cambian filtros o página
  useEffect(() => {
    setSelectedIndex(0);
  }, [currentPage, proveedorId, tipoComprobante, fechaDesde, fechaHasta, sortTotal]);

  const totalPagesToShow = Math.min(totalPages, 10);

  const esPersonalizado = periodo === "personalizado";
  const hayFiltrosActivos = proveedorId !== undefined || tipoComprobante !== undefined
    || fechaDesde !== "" || fechaHasta !== "" || sortTotal !== undefined || periodo !== "";

  const resetFiltros = () => {
    setProveedorId(undefined);
    setTipoComprobante(undefined);
    setFechaDesde("");
    setFechaHasta("");
    setSortTotal(undefined);
    setPeriodo("");
  };

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTotal = (total: number) =>
    "$" + total.toLocaleString("es-AR", { minimumFractionDigits: 0 });

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* Filtros */}
      <div className="p-2 flex gap-2 bg-slate-100 flex-wrap shrink-0">

        {/* Selector de Proveedor */}
        <div className="grid gap-2">
          <Select
            value={proveedorId ?? "__ALL__"}
            onValueChange={(value) =>
              setProveedorId(value === "__ALL__" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">Todos</SelectItem>
              {proveedores.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Tipo de Comprobante */}
        <div className="grid gap-2">
          <Select
            value={tipoComprobante ?? "__ALL__"}
            onValueChange={(value) =>
              setTipoComprobante(value === "__ALL__" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Comprobante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">Todos</SelectItem>
              {tipoComprobanteOpciones.map((tc) => (
                <SelectItem key={tc} value={tc}>{tc.charAt(0) + tc.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Orden por Total */}
        <div className="grid gap-2">
          <Select
            value={sortTotal ?? "__NONE__"}
            onValueChange={(value) =>
              setSortTotal(value === "__NONE__" ? undefined : value as "asc" | "desc")
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por total" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">Todos</SelectItem>
              <SelectItem value="desc">Mayor total</SelectItem>
              <SelectItem value="asc">Menor total</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Período */}
        <div className="grid gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="ayer">Ayer</SelectItem>
              <SelectItem value="esta_semana">Esta semana</SelectItem>
              <SelectItem value="este_mes">Este mes</SelectItem>
              <SelectItem value="ultimos_30">Últimos 30 días</SelectItem>
              <SelectItem value="personalizado">Personalizado...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fechas personalizadas */}
        {esPersonalizado && (
          <>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-slate-500">Desde:</Label>
              <Input
                type="date"
                value={fechaDesde ? fechaDesde.slice(0, 10) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFechaDesde(v ? new Date(v + "T00:00:00").toISOString() : "");
                }}
                className="h-9 w-[140px] text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-slate-500">Hasta:</Label>
              <Input
                type="date"
                value={fechaHasta ? fechaHasta.slice(0, 10) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFechaHasta(v ? new Date(v + "T23:59:59").toISOString() : "");
                }}
                className="h-9 w-[140px] text-xs"
              />
            </div>
          </>
        )}

        {/* Botón Restablecer */}
        {hayFiltrosActivos && (
          <button
            onClick={resetFiltros}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-1.5 py-0.5 transition-colors whitespace-nowrap self-center"
          >
            <RotateCcw className="w-3 h-3" />
            Restablecer
          </button>
        )}
      </div>

      {/* Tabla */}
      <div ref={containerRef} className="flex-1 border border-border rounded-md overflow-auto">

        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Cargando compras...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        ) : compras.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            No hay compras registradas
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Proveedor</th>
                <th className="p-2 text-left">Comprobante</th>
                <th className="p-2 text-left">Observaciones</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-t border-border cursor-pointer ${i === selectedIndex ? "bg-slate-200" : "hover:bg-slate-50"}`}
                  onClick={() => {
                    setSelectedIndex(i);
                    handleRowClick(c);
                  }}
                >
                  <td className="p-2">{formatFecha(c.fecha)}</td>
                  <td className="p-2">{c.proveedor?.nombre ?? "—"}</td>
                  <td className="p-2">{c.tipoComprobante ? `${c.tipoComprobante} ${c.nroComprobante ?? ""}` : "—"}</td>
                  <td className="p-2">{c.observaciones ?? "—"}</td>
                  <td className="p-2 text-right">{formatTotal(c.total)}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEliminar(c.id); }}
                      className="hover:bg-red-50 rounded p-1"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 0 && (
        <div className="p-2 border border-border rounded-md bg-slate-50 flex items-center justify-between text-sm shrink-0">
          <span className="text-slate-500">
            {totalElements} resultado{totalElements !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPagesToShow }, (_, i) => i).map((i) => (
              <Button
                key={i}
                variant={i === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal detalle de compra */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalle de Compra</DialogTitle>
            <DialogDescription>
              Información completa de la compra seleccionada.
            </DialogDescription>
          </DialogHeader>

          {compraSeleccionada && (
            <div className="grid gap-4 py-2">
              {/* Info de la compra */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-slate-600">Proveedor: </span>
                  {compraSeleccionada.proveedor?.nombre ?? "—"}
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Fecha: </span>
                  {formatFecha(compraSeleccionada.fecha)}
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Comprobante: </span>
                  {compraSeleccionada.tipoComprobante
                    ? `${compraSeleccionada.tipoComprobante} ${compraSeleccionada.nroComprobante ?? ""}`
                    : "—"}
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Observaciones: </span>
                  {compraSeleccionada.observaciones ?? "—"}
                </div>
              </div>

              {/* Tabla de productos */}
              <div className="border border-border rounded-md overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-right">Costo</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
            <tbody>
                    {compraSeleccionada.detalle.map((d: any, i: number) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2">{d.nombreProducto}</td>
                        <td className="p-2 text-right">{d.cantidad}</td>
                        <td className="p-2 text-right">${d.precioUnitario}</td>
                        <td className="p-2 text-right">${d.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="text-right font-semibold text-sm">
                Total: {formatTotal(compraSeleccionada.total)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
