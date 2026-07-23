import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalBuscarProductoProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  agregarProducto: (producto: Producto) => void;
  onFocusBarcode: ()=> void;
}

interface Producto {
  id: number;
  barcode: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export default function ModalBuscarProducto({
  open,
  setOpen,
  agregarProducto,
}: ModalBuscarProductoProps) {

  const [busqueda, setBusqueda] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

  // Carga de productos
  const productos = localStorage.getItem("pos_productos") 
    ? JSON.parse(localStorage.getItem("pos_productos")!) 
    : [];

  ////////////////////////////////////////////////////////////////////////////////
  //FILTRO DE BUSQUEDA POR NOMBRE DE PRODUCTO
  /*/**
 * 🔍 FILTRO DE PRODUCTOS CON USEMEMO (ANÁLISIS DE RENDIMIENTO)
 * 
 *¿Qué hace acá? 
 * Evita que la lista se vuelva a filtrar si el componente sufre re-renders ajenos a la búsqueda.
 * Almacena en caché la DIRECCIÓN DE MEMORIA del array resultante (no duplica los objetos).
 * 
 * Caso específico de este Modal:
 * Como este modal es simple (solo tiene el input de búsqueda y al dar Enter se cierra), 
 * 'useMemo' NO está optimizando activamente el tipado letra por letra, ya que al cambiar 
 * 'busqueda' se ve obligado a recalcular el filtro siempre. Tampoco sobrevive al cerrar el modal (se destruye).(por lo que usar un useState y un useEffect seria exactamente lo mismo)
 * 
 *¿Por qué lo dejamos entonces? (Programación defensiva):
 * 1. Protege al modal de re-renders innecesarios si el componente PADRE (el del ticket) se actualiza.
 * 2. Escalabilidad: Si a futuro agregamos filtros por categoría, marca o precios dentro del modal, 
 *    useMemo ya estará listo para evitar la degradación de rendimiento.
 */
  const productosFiltrados = useMemo(() => {
    // 1. Limpiamos y separamos la búsqueda en un array de palabras
    const palabrasBusqueda = busqueda.toLowerCase().trim().split(/\s+/);

    return productos.filter((producto: Producto) => {
      const nombreProducto = producto.nombre.toLowerCase();
      
      // 2. Verificamos que CADA palabra de la búsqueda esté en el nombre del producto
      return palabrasBusqueda.every((palabra) => nombreProducto.includes(palabra));
    });
  }, [busqueda, productos]);

  // Controla la apertura/cierre para enfocar Y resetear el buscador
  useEffect(() => {
    if (open) {
      // Al abrir, forzamos el foco con un sutil delay por la animación del Dialog
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // Al cerrar (Enter, Escape, Clic fuera, Botón Cerrar), reseteamos todo
      setBusqueda("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Resetear el índice si cambia el texto de búsqueda
  useEffect(() => {
    setSelectedIndex(0);
  }, [busqueda]);

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev >= productosFiltrados.length - 1) return prev;
          return prev + 1;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }

      if (e.key === "Enter") {
        const producto = productosFiltrados[selectedIndex];
        if (producto) {
          console.log("Producto seleccionado:", producto);
          agregarProducto(producto);
          setOpen(false); // Al pasar a false, el useEffect de arriba limpiará el input
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, productosFiltrados, selectedIndex, agregarProducto, setOpen]);

  // Scroll automático a la fila seleccionada
  useEffect(() => {
    rowsRef.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          !max-w-[1200px]
          !w-[70vw]
          max-h-[80vh]
          overflow-hidden
          flex
          flex-col
        "
      >
        <DialogHeader className="sr-only">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <Input
            ref={inputRef}
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="border border-border rounded-md overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-3">Producto</th>
                  <th className="text-left p-3">Precio</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto: Producto, index: number) => (
                  <tr
                    ref={(el) => { rowsRef.current[index] = el; }}
                    key={producto.id}
                    className={`scroll-mt-[40px] cursor-pointer border-t border-border transition-colors ${
                      selectedIndex === index
                        ? "bg-blue-300 text-primary-foreground"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <td className="p-3">{producto.nombre}</td>
                    <td className="p-3">
                      ${producto.precio.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {productosFiltrados.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No se encontraron productos.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>

          <Button
            onClick={() => {
              const producto = productosFiltrados[selectedIndex];
              if (producto) {
                agregarProducto(producto);
                setOpen(false);
              }
            }}
          >
            Agregar Producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}