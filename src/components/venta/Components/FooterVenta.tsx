import { Button } from "@/components/ui/button";
import { type SesionActiva } from "@/services/cajaService";
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

  sesion: SesionActiva | null;
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
  sesion,
}: Props) {

  return (
    <div className="flex shrink-0 flex-col gap-2 overflow-hidden select-none">
      {/* FILA 1 */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {/* Botón Cambiar Ticket */}
            <Button variant="secondary" onClick={() => setOpenModalNavegarTickets(true)}>
              <span className="sm:hidden">Cambiar ticket</span>
              <span className="hidden sm:inline">F5 - Cambiar Ticket</span>
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
              <span className="sm:hidden">Nuevo ticket</span>
              <span className="hidden sm:inline">F6 - Nuevo Ticket</span>
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
              <span className="sm:hidden">Eliminar</span>
              <span className="hidden sm:inline">Eliminar ticket</span>
            </Button>
            {/* [SQLite] Botón Cobrar conectado a la cola de tickets */}
            <Button className="col-span-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:col-span-1" onClick={onCobrar} disabled={!sesion}>
              {!sesion && (
                <>
                  <span className="sm:hidden">Caja cerrada</span>
                  <span className="hidden sm:inline">La caja no esta abierta para vender</span>
                </>
              )}
              {sesion && (
                <>
                  <span className="sm:hidden">Cobrar</span>
                  <span className="hidden sm:inline">F12 - Cobrar</span>
                </>
              )}
            </Button>
            
          </div>

          {/*Simplificación: Usamos la prop 'total' directo, no hace falta un estado local duplicado */}
          <div className="text-right text-3xl font-bold text-blue-600 sm:text-4xl lg:text-5xl">
            ${total.toFixed(2)}
          </div>
        </div>

        {/* FILA 2 */}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div  className="flex gap-2">
            <span className="text-muted-foreground block text-xs">Cantidad productos:</span>
            <div className="">{cantidadProcductosTicket}</div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-slate-200 px-3 text-xs text-slate-700 hover:bg-slate-300">
              <span className="sm:hidden">Reimprimir</span>
              <span className="hidden sm:inline">Reimprimir Último Ticket</span>
            </Button>
            <Button className="bg-slate-300 px-3 text-xs text-slate-800 hover:bg-slate-400" onClick={()=> {
                            setOpenModalVentasDia(true);
                            console.log("hice click en abrir modal ventas", openModalVentasDia);}
                          }>
              <span className="sm:hidden">Ventas hoy</span>
              <span className="hidden sm:inline">Ventas del día</span>
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