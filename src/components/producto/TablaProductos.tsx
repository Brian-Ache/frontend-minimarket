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

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  margen: number;
  precio: number;
  categoria: string;
  proveedor: string;
};

// 👉 mock temporal
/*const productos: Producto[] = [
  { id: 1, codigo: "123", nombre: "Coca Cola", precio: 1000, categoria: "Bebidas", proveedor: "Coca" },
  { id: 2, codigo: "124", nombre: "Pepsi", precio: 900, categoria: "Bebidas", proveedor: "Pepsi" },
  { id: 3, codigo: "125", nombre: "Pan", precio: 500, categoria: "Alimentos", proveedor: "Local" },
];*/

const productos2: Producto[] = localStorage.getItem("pos_productos")  ? JSON.parse(localStorage.getItem("pos_productos")!)
  : productos; 
export default function TablaProductos() {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  // 🔥 1. Filtrado
  const filteredProducts = productos2.filter((p) =>
    p.nombre.toLowerCase().startsWith(search.toLowerCase())
  );

  // 🔥 2. Producto seleccionado
  //si hay productos filtrados, el seleccionado es el que corresponde al selectedIndex, sino es null
  const selectedProduct = filteredProducts.length > 0 ? filteredProducts[selectedIndex]: null;

  // 🔥 3. Reset selección al filtrar
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // 🔥 4. Navegación teclado
  useEffect(() => {//
    const handleKeyDown = (e: KeyboardEvent) => {
      
      const isInputFocused = document.activeElement?.tagName === "INPUT";

      if (e.key === "ArrowDown" && !isInputFocused) {
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredProducts.length - 1)
        );
      }

      if (e.key === "ArrowUp" && !isInputFocused) {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Enter") {
        if (filteredProducts.length > 0) {
          setOpenModal(true);
        }
      }

      if (e.key === "Escape") {
        setOpenModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredProducts]);

  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      
      {/* Filtros */}
      <div className="p-2 flex gap-2 bg-slate-100">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        

        {/* Selector de Proveedor */}
        <div className="grid gap-2">
          <Label htmlFor="proveedor" className="text-slate-600">Proveedor</Label>
          {/*si hay un producto seleccionado, muestra su proveedor, de lo contrario muestra el placeholder*/}
          <Select defaultValue={selectedProduct?.proveedor}>
            <SelectTrigger id="proveedor">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Coca">Coca Cola</SelectItem>
              <SelectItem value="Pepsi">Pepsi</SelectItem>
              <SelectItem value="Local">Distribuidora Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <select defaultValue={selectedProduct?.categoria}>
          <option value="">Todas las categorías</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Alimentos">Alimentos</option>
      </select>
      {/*<Input placeholder="Proveedor..." />*/}
      
      {/* Tabla de productos */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-200 sticky top-0">
            <tr>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-right">Precio Venta</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-left">Proveedor</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((prod, index) => (
              <tr
                key={prod.id}
                className={`
                  border-t cursor-pointer
                  ${index === selectedIndex ? "bg-blue-100" : "hover:bg-slate-50"}
                `}
              >
                <td className="p-2">{prod.codigo}</td>
                <td className="p-2">{prod.nombre}</td>
                <td className="p-2 text-right">${prod.precio}</td>
                <td className="p-2">{prod.categoria}</td>
                <td className="p-2">{prod.proveedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*MODAL PARA MOFIDICAR PRODUCTO*/}
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
            {/* Nombre - Ocupa todo el ancho */}
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-slate-600">Nombre del Producto</Label>
              <Input id="nombre" defaultValue={selectedProduct.nombre} className="focus-visible:ring-blue-500" />
            </div>

            {/* Dos columnas para números */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="margen" className="text-slate-600">Margen (%)</Label>
                <Input id="margen" type="number" defaultValue={selectedProduct.margen} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio" className="text-slate-600">Precio Venta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                  <Input id="precio" type="number" defaultValue={selectedProduct.precio} className="pl-7" />
                </div>
              </div>
            </div>

            {/* Dos columnas para Categoría y Proveedor */}
            <div className="grid grid-cols-2 gap-4">
      {/* Selector de Categoría */}
      <div className="grid gap-2">
        <Label htmlFor="categoria" className="text-slate-600">Categoría</Label>
        <Select defaultValue={selectedProduct?.categoria}>
          <SelectTrigger id="categoria">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bebidas">Bebidas</SelectItem>
            <SelectItem value="Alimentos">Alimentos</SelectItem>
            <SelectItem value="Limpieza">Limpieza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Proveedor */}
      <div className="grid gap-2">
        <Label htmlFor="proveedor" className="text-slate-600">Proveedor</Label>
        <Select defaultValue={selectedProduct?.proveedor}>
          <SelectTrigger id="proveedor">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Coca">Coca Cola</SelectItem>
            <SelectItem value="Pepsi">Pepsi</SelectItem>
            <SelectItem value="Local">Distribuidora Local</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>


    </div>
  );
}