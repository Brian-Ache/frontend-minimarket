import { useEffect, useState } from "react";
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

interface ModalAgregarTicket {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: ()=> void;
  onAgregarTicket: (nombre: string) => void;
}

export default function ModalAgregarTicket({
    open,
    setOpen,
    onFocusBarcode,
    onAgregarTicket
}:ModalAgregarTicket){

    const [nombre, setNombre]= useState("");

////MANEJO DE MODAL CON TECLA Enter
// Manejar navegación con teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
        
            if (e.key === "Enter") {
                //console.log("Se agrego ticket con el nombre: "+ nombre);
                onAgregarTicket(nombre);
                setOpen(false); // Al pasar a false, el useEffect de arriba limpiará el input
                onFocusBarcode();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [open, setOpen,nombre,onAgregarTicket,onFocusBarcode]);


    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Ticket</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div>
                    <Input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                            console.log("el modal esta: " + open);
                            onAgregarTicket(nombre);
                            setOpen(false);
                            onFocusBarcode();
                        }
                    }>Aceptar
                    </Button>
                    <Button onClick={() => {setOpen(false);onFocusBarcode();}}
                    >Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}