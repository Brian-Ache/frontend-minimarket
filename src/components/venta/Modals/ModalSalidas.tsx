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

interface ModalSalida {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: ()=> void;
}

export default function ModalSalida({
    open,
    setOpen,
    onFocusBarcode
}:ModalSalida){
    const [valorSalida, setValorSalida] = useState(0);

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
     const enviarSalida = (valor : number)=>{
        alert("Se retiro:"+valor);
        handleOpenChange(false);
    }

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Salida de Dinero</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div>
                    <Input
                        type="number"
                        value={valorSalida}
                        onChange={(e) => setValorSalida(Number(e.target.value))}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => {enviarSalida(valorSalida);}}>Aceptar</Button>
                    <Button onClick={() => handleOpenChange(false)}
                    >Cancelar</Button>
                    <Button>Registro Salidas</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}