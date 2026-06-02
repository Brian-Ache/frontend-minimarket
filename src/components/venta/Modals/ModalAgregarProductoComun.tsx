import { useState } from "react";

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

interface Producto {
  id: number;
  barcode: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface ModalAgregarProductoComunProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: () => void;
  agregarProducto: (producto: Producto) => void;
}

export default function ModalAgregarProductoComun({
  open,
  setOpen,
  agregarProducto,
  onFocusBarcode
}: ModalAgregarProductoComunProps) {

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(1);

  //Centralizamos el cierre del modal aquí
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Si isOpen es false, significa que el modal se está cerrando por CUALQUIER motivo
    if (!isOpen) {
      setTimeout(() => {
        onFocusBarcode();
      }, 0);
    }
  };

  //Agregar producto
  const handleAgregar = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!nombre.trim()) {
        alert("Debe ingresar un nombre");
        return;
    }

    if (cantidad < 1) {
        alert("La cantidad no puede ser menor que 1");
        return;
    }

    if (precio <= 0) {
        alert("El precio debe ser mayor a 0");
        return;
    }

    const nuevoProducto: Producto = {
        id: Date.now(),
        barcode: "",
        nombre,
        precio,
        cantidad,
    };

    agregarProducto(nuevoProducto);

    // limpiar
    setNombre("");
    setPrecio(0);
    setCantidad(1);

    // Al llamar a handleOpenChange(false), disparamos el cierre de los estados 
    // y devolvemos de forma segura el foco al buscador.
    handleOpenChange(false);
  };

  return (
    //Reemplazamos setOpen directo por nuestro manejador centralizado
    <Dialog open={open} onOpenChange={handleOpenChange}>

      <DialogContent className="sm:max-w-[450px]">

        <DialogHeader className="sr-only">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form
            id="producto-form"
            onSubmit={handleAgregar}
            className="flex flex-col gap-4 py-2"
        >
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Nombre del Producto
            </label>
            <Input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pan casero"
            />
          </div>

          {/* Cantidad */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Cantidad
            </label>
            <Input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Precio unitario
            </label>
            <Input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </form>

        <DialogFooter>
          {/* 2. El botón cancelar también pasará por nuestro flujo seguro */}
          <Button
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button 
            type="submit"
            form="producto-form">
            Agregar Producto
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}