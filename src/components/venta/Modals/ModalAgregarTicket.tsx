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

interface ModalAgregarTicket {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: ()=> void;
  onAgregarTicket: (nombre: string) => void;
}

export default function ModalAgregarTicket({
    open,
    setOpen,
    onFocusBarcode
}:ModalAgregarTicket){

    const [nombre, setNombre]= useState("");

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Ticket</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div>
                    <Input
                        type="number"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => {onAgregarTicket(nombre);}}>Aceptar</Button>
                    <Button onClick={() => handleOpenChange(false)}
                    >Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}