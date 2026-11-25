import { Button } from "@/components/ui/button";
import ModalBuscarProducto from "../Modals/ModalBuscarProducto";
import ModalAgregarProductoComun from "../Modals/ModalAgregarProductoComun";
import ModalEntrada from "../Modals/ModalEntrada";
import ModalSalida from "../Modals/ModalSalidas";

interface Producto {
  id: number | string;
  barcode: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Props {
  productoSeleccionadoId: number | string | null;
  onEliminar: (id: number | string) => void;
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
    <div className="grid grid-cols-2 gap-2 border-0 select-none sm:flex sm:flex-wrap">
      
      {/* Botón Artículo Común */}
      <Button variant="secondary" onClick={() => setModales.comun(true)}>
        <span className="sm:hidden">Producto común</span>
        <span className="hidden sm:inline">Agregar Producto (Ctrl+P)</span>
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
        <span className="sm:hidden">Buscar</span>
        <span className="hidden sm:inline">F10 Buscar</span>
      </Button>
      
      {modales.buscar && (
        <ModalBuscarProducto
          open={modales.buscar}
          setOpen={setModales.buscar} 
          onFocusBarcode={onFocusBarcode}
          agregarProducto={OnAgregarProductoAlTicket}
        />
      )}
      
      <Button variant="secondary"><span className="sm:hidden">Mayoreo</span><span className="hidden sm:inline">F11 Mayoreo</span></Button>

      {/* Botón Entradas */}
      <Button variant="secondary" onClick={() => setModales.entrada(true)}>
        <span className="sm:hidden">Entradas</span>
        <span className="hidden sm:inline">F7 Entradas</span>
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
        <span className="sm:hidden">Salidas</span>
        <span className="hidden sm:inline">F8 Salidas</span>
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
        <span className="sm:hidden">Borrar artículo</span>
        <span className="hidden sm:inline">DEL Borrar Art.</span>
      </Button>
    </div>
  );
}