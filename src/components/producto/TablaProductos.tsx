/**
 * TablaProductos — Tabla paginada de productos con filtros.
 *
 * Recibe `refreshKey` y lo pasa a useProductos(). Cuando refreshKey cambia,
 * el hook re-ejecuta el fetch de productos, manteniendo la tabla actualizada.
 * Esto se necesita porque la tabla y el formulario de carga son hermanos
 * dentro de ProductoPage, y no comparten estado directamente.
 *
 * Recibe `onRefresh` como callback para avisar al padre que debe incrementar
 * refreshKey después de modificar un producto, de forma que la tabla se
 * re-renderice con los datos actualizados.
 *
 * El modal de modificación usa el hook useModificarProducto() que encapsula
 * todo el estado y la lógica del formulario, incluyendo la actualización
 * de stock vía el endpoint POST /api/inventario/v1/controlar.
 */
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Check, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useProductos } from "@/hooks/useProductos";
import { getStockBatch } from "@/services/productoService";
import useModificarProducto from "@/hooks/useModificarProducto";
import type { ProductoResponse } from "@/types/response/productoResponse";

interface TablaProductosProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

export default function TablaProductos({ refreshKey, onRefresh }: TablaProductosProps) {
  const {
    productos,
    loading,
    error,
    search,
    setSearch,
    categoriaId,
    setCategoriaId,
    proveedorId,
    setProveedorId,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    categorias,
    proveedores,
  } = useProductos(refreshKey);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  // Historial de proveedores
  const [openHistorial, setOpenHistorial] = useState(false);
  const [historial, setHistorial] = useState([
    { id: "1", proveedor: "Hergo", fecha: "02/09/2026", precioEntrada: 1900, precioReferencia: 2050 },
    { id: "2", proveedor: "Wally", fecha: "15/08/2026", precioEntrada: 1750, precioReferencia: 1900 },
    { id: "3", proveedor: "Across", fecha: "10/07/2026", precioEntrada: 1680, precioReferencia: 1850 },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Stock de los productos de la página actual
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());

  const selectedProduct: ProductoResponse | null =
    productos.length > 0 ? productos[selectedIndex] : null;

  const stockInicial = selectedProduct ? (stockMap.get(selectedProduct.id) ?? 0) : 0;

  const {
    modalBarcode, setModalBarcode,
    modalNombre, setModalNombre,
    modalCosto, setModalCosto,
    modalMargen, setModalMargen,
    modalPrecio,
    modalManejaLotes, setModalManejaLotes,
    modalCategoriaId, setModalCategoriaId,
    modalProveedorId, setModalProveedorId,
    modalCantidad, setModalCantidad,
    modalCategorias, modalProveedores,
    modalSaving, modalDeleting, modalError,
    guardar,
    eliminar,
  } = useModificarProducto({ producto: selectedProduct, stockInicial, onRefresh, onClose: () => setOpenModal(false) });

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, categoriaId, proveedorId, productos]);

  useEffect(() => {
    if (productos.length === 0) {
      setStockMap(new Map());
      return;
    }
    const ids = productos.map((p) => p.id);
    getStockBatch(ids)
      .then((stocks) => {
        const map = new Map<string, number>();
        stocks.forEach((s) => map.set(s.idProducto, s.cantidad));
        setStockMap(map);
      })
      .catch(() => setStockMap(new Map()));
  }, [productos, refreshKey]);

  useEffect(() => {
    if (openModal && selectedProduct) {
      setModalBarcode(selectedProduct.barcode);
      setModalNombre(selectedProduct.nombre);
      setModalCosto(selectedProduct.costo ?? 0);
      setModalMargen(selectedProduct.margen ?? 0);
      setModalManejaLotes(selectedProduct.manejaLotes);
      setModalCategoriaId(selectedProduct.categoria?.id ?? null);
      setModalProveedorId(selectedProduct.proveedor?.id ?? null);
      setModalCantidad(stockMap.get(selectedProduct.id) ?? 0);
    }
  }, [openModal, selectedProduct, stockMap]);

  // Navegacion teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === "INPUT";

      if (e.key === "ArrowDown" && !isInputFocused) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, productos.length - 1));
      }

      if (e.key === "ArrowUp" && !isInputFocused) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Enter" && productos.length > 0) {
        setOpenModal(true);
      }

      if (e.key === "Escape") {
        setOpenModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [productos]);

  const totalPagesToShow = Math.min(totalPages, 10);

  return (
    <div className="h-full flex flex-col border border-border rounded-md overflow-hidden">

      {/* Filtros */}
      <div className="p-2 flex gap-2 bg-slate-100 flex-wrap">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Selector de Proveedor dinamico */}
        <div className="grid gap-2">
          <Select
            value={proveedorId ?? "__ALL__"}
            onValueChange={(value) =>
              setProveedorId(value === "__ALL__" ? undefined : value)
            }
          >
            <SelectTrigger id="proveedor">
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

        {/* Selector de Categoria dinamico */}
        <div className="grid gap-2">
          <Select
            value={categoriaId ?? "__ALL__"}
            onValueChange={(value) =>
              setCategoriaId(value === "__ALL__" ? undefined : value)
            }
          >
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Cargando productos...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-200 sticky top-0">
              <tr>
                <th className="p-2 text-left">Codigo</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-right">Costo</th>
                <th className="p-2 text-right">Precio</th>
                <th className="p-2 text-left">Categoria</th>
                <th className="p-2 text-left">Proveedor</th>
                <th className="p-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod, index) => (
                <tr
                  key={prod.id}
                  className={`
                    border-t border-border cursor-pointer
                    ${index === selectedIndex ? "bg-blue-100" : "hover:bg-slate-50"}
                  `}
                >
                  <td className="p-2">{prod.barcode}</td>
                  <td className="p-2">{prod.nombre}</td>
                  <td className="p-2 text-right">${prod.costo ?? "-"}</td>
                  <td className="p-2 text-right">${prod.precio}</td>
                  <td className="p-2">{prod.categoria?.nombre ?? "-"}</td>
                  <td className="p-2">{prod.proveedor?.nombre ?? "-"}</td>
                  <td className="p-2 text-right">{stockMap.get(prod.id) ?? "-"}</td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginacion */}
      <div className="p-2 border-t border-border bg-slate-50 flex items-center justify-between text-sm">
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

      {/* Modal para modificar producto */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Modificar Producto</DialogTitle>
            <DialogDescription>
              Ajusta los detalles del producto seleccionado.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-6 gap-4 py-4 items-start">
              <div className="col-span-3 grid gap-2">
                <Label className="text-slate-600">Código de barras</Label>
                <Input value={modalBarcode} onChange={(e) => setModalBarcode(e.target.value)} />
              </div>
              <div className="col-span-3 grid gap-2">
                <Label className="text-slate-600">Nombre</Label>
                <Input value={modalNombre} onChange={(e) => setModalNombre(e.target.value)} />
              </div>

              <div className="col-span-2 grid gap-2">
                <Label className="text-slate-600">Precio compra</Label>
                <Input type="number" value={modalCosto || ""} onChange={(e) => setModalCosto(Number(e.target.value))} />
              </div>
              <div className="col-span-2 grid gap-2">
                <Label className="text-slate-600">Margen (%)</Label>
                <Input type="number" value={modalMargen || ""} onChange={(e) => setModalMargen(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-2 grid gap-2">
                <Label className="text-slate-600">Precio venta</Label>
                <Input value={modalPrecio} readOnly />
              </div>

              <div className="col-span-2 grid gap-2">
                <Label className="text-slate-600">Categoría</Label>
                <Select value={modalCategoriaId ?? ""} onValueChange={(v) => setModalCategoriaId(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {modalCategorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4 grid gap-2">
                <Label className="text-slate-600">Proveedor</Label>
                <Select value={modalProveedorId ?? ""} onValueChange={(v) => setModalProveedorId(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {modalProveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 justify-start text-slate-500 hover:text-slate-700"
                  onClick={() => setOpenHistorial(true)}
                >
                  ↻ Ver historial de proveedores
                </Button>
              </div>

              <div className="col-span-2 grid gap-2">
                <Label className="text-slate-600">Cantidad (Stock)</Label>
                <Input type="number" value={modalCantidad} onChange={(e) => setModalCantidad(Number(e.target.value))} />
              </div>
              <div className="col-span-1 flex items-center gap-2 pt-6">
                <input type="checkbox" checked={modalManejaLotes} onChange={(e) => setModalManejaLotes(e.target.checked)} />
                <Label className="text-slate-600">Maneja lotes</Label>
              </div>

              {modalError && <p className="col-span-6 text-red-500 text-sm">{modalError}</p>}
            </div>
          )}

          <DialogFooter className="px-6 flex flex-row justify-between sm:justify-between items-center w-full">
            <Button
              variant="destructive"
              onClick={eliminar}
              disabled={modalSaving || modalDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {modalDeleting ? "Eliminando..." : "Eliminar"}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                Cancelar
              </Button>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={guardar}
                disabled={modalSaving || modalDeleting}
              >
                {modalSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de historial de proveedores */}
      {selectedProduct && (
        <Dialog open={openHistorial} onOpenChange={setOpenHistorial}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Historial de proveedores</DialogTitle>
              <DialogDescription>
                Producto: {selectedProduct.nombre}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Proveedor</th>
                    <th className="p-2 text-left">Fecha Ingreso</th>
                    <th className="p-2 text-right">Precio Ingreso</th>
                    <th className="p-2 text-right">Precio referencia</th>
                    <th className="p-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id} className="border-t border-border">
                      <td className="p-2">{h.proveedor}</td>
                      <td className="p-2">{h.fecha}</td>
                      <td className="p-2 text-right">${h.precioEntrada.toLocaleString("es-AR")}</td>
                      <td className="p-2 text-right">
                        {editingId === h.id ? (
                          <Input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="h-7 w-24 text-right inline"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setHistorial((prev) =>
                                  prev.map((item) =>
                                    item.id === h.id
                                      ? { ...item, precioReferencia: Number(editingValue) }
                                      : item
                                  )
                                );
                                setEditingId(null);
                              }
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                        ) : (
                          <span>${h.precioReferencia.toLocaleString("es-AR")}</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {editingId === h.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setHistorial((prev) =>
                                  prev.map((item) =>
                                    item.id === h.id
                                      ? { ...item, precioReferencia: Number(editingValue) }
                                      : item
                                  )
                                );
                                setEditingId(null);
                              }}
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-3 h-3 text-slate-500" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setEditingId(h.id);
                              setEditingValue(String(h.precioReferencia));
                            }}
                          >
                            <Pencil className="w-3 h-3 text-slate-400" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenHistorial(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}