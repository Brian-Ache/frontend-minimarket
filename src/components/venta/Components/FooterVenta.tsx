import { Button } from "@/components/ui/button";
import ModalNavegarTickets from "../Modals/ModalNavegarTickets";
import ModalAgregarTicket from "../Modals/ModalAgregarTicket";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

type Ticket = {
  id: number;
  nombre: string;
  productos: Producto[];
};

type Props = {
  tickets: Ticket[];
  total: number;
  activeTicket: number;
  agregar: (nombre: string) => void;
  eliminar : (id: number) => void;
  
  cambiar: (id: number) => void;
  onFocusBarcode: () => void;
  
  // Padre controla este modal(venta page)
  openModalNavegarTickets: boolean;
  setOpenModalNavegarTickets: (isOpen: boolean) => void;

  //Padre controla el modal (venta page)
  openModalAgregarTicket: boolean;
  setOpenModalAgregarTicket: (isopen:boolean) => void;
  
};

export default function FooterVenta({ 
  tickets, 
  activeTicket, 
  agregar, 
  eliminar, 
  total, 
  cambiar, 
  onFocusBarcode,
  openModalNavegarTickets,
  setOpenModalNavegarTickets,
  openModalAgregarTicket,
  setOpenModalAgregarTicket,
}: Props) {

  return (
    <div className="flex flex-col gap-2 shrink-0 overflow-hidden select-none">
      {/* FILA 1 */}
      <div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {/* Botón Cambiar Ticket */}
            <Button variant="secondary" onClick={() => setOpenModalNavegarTickets(true)}>
              F5 - Cambiar Ticket
            </Button>

            {openModalNavegarTickets && (
              <ModalNavegarTickets
                tickets={tickets}
                onCambiarTicket={cambiar}
                open={openModalNavegarTickets}
                setOpen={setOpenModalNavegarTickets} 
                onFocusBarcode={onFocusBarcode}
              />
            )}

            <Button variant="secondary" onClick={()=> setOpenModalAgregarTicket(true)}>
              F6 - Nuevo Ticket
            </Button>
            {openModalAgregarTicket && (
              <ModalAgregarTicket
                open={openModalAgregarTicket}
                setOpen={setOpenModalAgregarTicket} 
                onFocusBarcode={onFocusBarcode}
                onAgregarTicket={agregar}
              />
            )}

            <Button variant="destructive" onClick={() => eliminar(activeTicket)}>
              Eliminar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              F12 - Cobrar
            </Button>
          </div>

          {/*Simplificación: Usamos la prop 'total' directo, no hace falta un estado local duplicado */}
          <div className="text-4xl lg:text-5xl font-bold text-blue-600">
            ${total.toFixed(2)}
          </div>
        </div>

        {/* FILA 2 */}
        <div className="flex justify-between text-sm mt-1">
          <div>
            <span className="text-muted-foreground block text-xs">Total:</span>
            <div className="font-bold text-base">${total.toFixed(2)}</div>
          </div>

          <div>
            <span className="text-muted-foreground block text-xs">Pagó Con:</span>
            <div className="font-bold text-base">${total.toFixed(2)}</div>
          </div>

          <div>
            <span className="text-muted-foreground block text-xs">Cambio:</span>
            <div className="font-bold text-base">$0.00</div>
          </div>

          <div className="flex gap-2">
            <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs px-3">
              Reimprimir Último Ticket
            </Button>
            <Button className="bg-slate-300 text-slate-800 hover:bg-slate-400 text-xs px-3">
              Ventas del día
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}