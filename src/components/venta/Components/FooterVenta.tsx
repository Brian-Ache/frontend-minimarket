import { Button } from "@/components/ui/button";
import ModalNavegarTickets from "../Modals/ModalNavegarTickets";
import ModalAgregarTicket from "../Modals/ModalAgregarTicket";
import ModalVentasDia from "../Modals/ModalVentasDia";

type Producto = {
  id: number | string;
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
  cantidadProcductosTicket: number;
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

  // [SQLite] Función de cobro conectada a la cola de tickets
  onCobrar: () => void;

  //openModalVentasDia
  openModalVentasDia: boolean;
  setOpenModalVentasDia: (isopen:boolean) => void;
};

export default function FooterVenta({ 
  tickets, 
  activeTicket, 
  agregar, 
  eliminar, 
  total,
  cantidadProcductosTicket,
  cambiar, 
  onFocusBarcode,
  openModalNavegarTickets,
  setOpenModalNavegarTickets,
  openModalAgregarTicket,
  setOpenModalAgregarTicket,
  // [SQLite] Recibir función de cobro
  onCobrar,
  openModalVentasDia,
  setOpenModalVentasDia,
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

            <Button variant="secondary" onClick={()=> {setOpenModalAgregarTicket(true);
              console.log("hice click sobre el boton de nuevo tickets",openModalAgregarTicket);
            }}>
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
            {/* [SQLite] Botón Cobrar conectado a la cola de tickets */}
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onCobrar}>
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
          <div  className="flex gap-2">
            <span className="text-muted-foreground block text-xs">Cantidad productos:</span>
            <div className="">{cantidadProcductosTicket}</div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs px-3">
              Reimprimir Último Ticket
            </Button>
            <Button className="bg-slate-300 text-slate-800 hover:bg-slate-400 text-xs px-3" onClick={()=> {
                            setOpenModalVentasDia(true);
                            console.log("hice click en abrir modal ventas", openModalVentasDia);}
                          }>
              Ventas del día
            </Button>
            {openModalVentasDia && (
              <ModalVentasDia
                open={openModalVentasDia}
                setOpen={setOpenModalVentasDia} 
                onFocusBarcode={onFocusBarcode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}