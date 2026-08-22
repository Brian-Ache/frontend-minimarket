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
import type { ProductoResponse } from "@/types/producto";

export default function TablaProductos() {
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
  } = useProductos();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const selectedProduct: ProductoResponse | null =
    productos.length > 0 ? productos[selectedIndex] : null;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, categoriaId, proveedorId, productos]);

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
                <th className="p-2 text-right">Precio</th>
                <th className="p-2 text-left">Categoria</th>
                <th className="p-2 text-left">Proveedor</th>
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
                  <td className="p-2 text-right">${prod.precio}</td>
                  <td className="p-2">{prod.categoria?.nombre ?? "-"}</td>
                  <td className="p-2">{prod.proveedor?.nombre ?? "-"}</td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
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
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre" className="text-slate-600">Nombre del Producto</Label>
                <Input id="nombre" defaultValue={selectedProduct.nombre} className="focus-visible:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="precio" className="text-slate-600">Precio Venta</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                    <Input id="precio" type="number" defaultValue={selectedProduct.precio} className="pl-7" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="margen" className="text-slate-600">Margen (%)</Label>
                  <Input id="margen" type="number" defaultValue={selectedProduct.margen ?? ""} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
