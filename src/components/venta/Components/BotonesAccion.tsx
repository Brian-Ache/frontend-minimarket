import { Button } from "@/components/ui/button";
import ModalBuscarProducto from "../Modals/ModalBuscarProducto";
import ModalAgregarProductoComun from "../Modals/ModalAgregarProductoComun";
import ModalEntrada from "../Modals/ModalEntrada";
import ModalSalida from "../Modals/ModalSalidas";

interface Producto {
  id: number;
  barcode: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Props {
  productoSeleccionadoId: number | null;
  onEliminar: (id: number) => void;
  OnAgregarProductoAlTicket: (producto: Producto) => void;
  onFocusBarcode: () => void;
  
  // 🌟 Nuevas props: El padre ahora nos da el control de los modales
  modales: {
    buscar: boolean;
    comun: boolean;
    entrada: boolean;
    salida: boolean;
  };
  setModales: {
    buscar: (open: boolean) => void;
    comun: (open: boolean) => void;
    entrada: (open: boolean) => void;
    salida: (open: boolean) => void;
  };
}

export default function BotonesAccion({ 
  productoSeleccionadoId, 
  onEliminar, 
  OnAgregarProductoAlTicket, 
  onFocusBarcode,
  modales,
  setModales
}: Props) {

  return (
    <div className="flex gap-2 flex-wrap border-0 select-none">
      
      {/* Botón Artículo Común */}
      <Button variant="secondary" onClick={() => setModales.comun(true)}>
        Agregar Producto (Ctrl+P)
      </Button>
      
      {modales.comun && (
        <ModalAgregarProductoComun
          open={modales.comun}
          setOpen={setModales.comun} 
          onFocusBarcode={onFocusBarcode}
          agregarProducto={OnAgregarProductoAlTicket}
        />
      )}
      
      {/* Botón Buscar Producto */}
      <Button variant="secondary" onClick={() => setModales.buscar(true)}>
        F10 Buscar
      </Button>
      
      {modales.buscar && (
        <ModalBuscarProducto
          open={modales.buscar}
          setOpen={setModales.buscar} 
          onFocusBarcode={onFocusBarcode}
          agregarProducto={OnAgregarProductoAlTicket}
        />
      )}
      
      <Button variant="secondary">F11 Mayoreo</Button>

      {/* Botón Entradas */}
      <Button variant="secondary" onClick={() => setModales.entrada(true)}>
        F7 Entradas
      </Button>
      
      {modales.entrada && (
        <ModalEntrada
          open={modales.entrada}
          setOpen={setModales.entrada}
          onFocusBarcode={onFocusBarcode}
        />
      )}

      {/* Botón Salidas */}
      <Button variant="secondary" onClick={() => setModales.salida(true)}>
        F8 Salidas
      </Button>
      
      {modales.salida && (
        <ModalSalida
          open={modales.salida}
          setOpen={setModales.salida}
          onFocusBarcode={onFocusBarcode}
        />
      )}

      {/* Botón Eliminar Artículo Seleccionado */}
      <Button
        variant="destructive"
        disabled={!productoSeleccionadoId}
        onClick={() => productoSeleccionadoId && onEliminar(productoSeleccionadoId)}
      >
        DEL Borrar Art.
      </Button>
    </div>
  );
}