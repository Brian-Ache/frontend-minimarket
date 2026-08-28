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
    modalSaving, modalError,
    guardar,
  } = useModificarProducto({ producto: selectedProduct, stockInicial, onRefresh });

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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Modificar Producto</DialogTitle>
            <DialogDescription>
              Ajusta los detalles del producto seleccionado.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-600">Código de barras</Label>
                  <Input value={modalBarcode} onChange={(e) => setModalBarcode(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-600">Nombre</Label>
                  <Input value={modalNombre} onChange={(e) => setModalNombre(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-600">Precio compra</Label>
                  <Input type="number" value={modalCosto || ""} onChange={(e) => setModalCosto(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-600">Margen (%)</Label>
                  <Input type="number" value={modalMargen || ""} onChange={(e) => setModalMargen(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-600">Precio venta</Label>
                  <Input value={modalPrecio} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
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
                <div className="grid gap-2">
                  <Label className="text-slate-600">Proveedor</Label>
                  <Select value={modalProveedorId ?? ""} onValueChange={(v) => setModalProveedorId(v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {modalProveedores.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={modalManejaLotes} onChange={(e) => setModalManejaLotes(e.target.checked)} />
                  <Label className="text-slate-600">Maneja lotes</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-600">Cantidad (Stock)</Label>
                  <Input type="number" value={modalCantidad} onChange={(e) => setModalCantidad(Number(e.target.value))} />
                </div>
              </div>

              {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={guardar} disabled={modalSaving}>
              {modalSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}