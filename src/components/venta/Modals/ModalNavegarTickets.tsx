import { useState,useRef, useEffect} from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

type Ticket = {
  id: number;
  productos: Producto[];
};

interface Props {
  tickets: Ticket[];
  onCambiarTicket: (id: number) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: ()=> void;
}

export default function ModalNavegarTickets({
    tickets,
    onCambiarTicket,
    open,
    setOpen,
    onFocusBarcode
}:Props){

    const [ticketSelecionado, setTicketSelecionado] = useState(0);
    const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

    /////////////////////////////////////////////////////////////
    ////MANEJO DE MODAL CON TECLAS
    // Manejar navegación con teclado
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (!open) return;
    
          if (e.key === "ArrowDown") {
            e.preventDefault();
              setTicketSelecionado((prev) => {
              if (prev >= tickets.length - 1) return prev;
              return prev + 1;
            });
          }
    
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setTicketSelecionado((prev) => {
              if (prev <= 0) return 0;
              return prev - 1;
            });
          }
    
          if (e.key === "Enter") {
            const ticket = tickets[ticketSelecionado];
            if (ticket) {
              console.log("TICKET seleccionado:", ticket);
              onCambiarTicket(ticket.id);
              setOpen(false); // Al pasar a false, el useEffect de arriba limpiará el input
              onFocusBarcode();
            }
          }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [open, tickets, ticketSelecionado, onCambiarTicket, setOpen]);

    ////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          !max-w-[300px]
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
          <div className="border rounded-md overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-3">Tickets</th>
                </tr>
              </thead>

              <tbody>
                
                {(tickets || []).map((ticket: Ticket, index: number) => (
                  <tr
                    ref={(el) => { rowsRef.current[index] = el; }}
                    key={ticket.id}
                    className={`scroll-mt-[40px] cursor-pointer border-t transition-colors ${
                      ticketSelecionado === index
                        ? "bg-blue-300 text-primary-foreground"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setTicketSelecionado(index)}
                  >
                    <td className="p-3">{ticket.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>

          <Button
            onClick={() => {
              const ticket = tickets[ticketSelecionado];
              if (ticket) {
                onCambiarTicket(ticket.id);
                setOpen(false);
              }
            }}
          >
            Selecionar Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}