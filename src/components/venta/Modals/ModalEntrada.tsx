import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {useState,useEffect} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalEntrada {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: ()=> void;
}

export default function ModalEntrada({
    open,
    setOpen,
    onFocusBarcode
}:ModalEntrada){
    const [valorEntrada, setValorEntrada] = useState(0);

    // 🔥 Centralizamos el cierre del modal aquí
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Si isOpen es false, significa que el modal se está cerrando por CUALQUIER motivo
    if (!isOpen) {
      setTimeout(() => {
        onFocusBarcode();
      }, 0);
    }
  };
     const enviarEntrada = (valor : number)=>{
        
        alert("Se ingreso:"+valor);
        handleOpenChange(false);
    }

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Entrada de Dinero</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div>
                    <Input
                        type="number"
                        value={valorEntrada}
                        onChange={(e) => setValorEntrada(Number(e.target.value))}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => {enviarEntrada(valorEntrada);}}>Aceptar</Button>
                    <Button onClick={() => handleOpenChange(false)}
                    >Cancelar</Button>
                    <Button>Registro Salidas</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}