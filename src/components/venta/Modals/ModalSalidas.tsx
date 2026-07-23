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
    const [mensaje, setMensaje] = useState("");

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

////MANEJO DE MODAL CON TECLA Enter
// Manejar navegación con teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
        
            if (e.key === "Enter") {
                //console.log("Se agrego ticket con el nombre: "+ nombre);
                enviarSalida(valorSalida);
                setOpen(false); // Al pasar a false, el useEffect de arriba limpiará el input
                onFocusBarcode();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, setOpen,valorSalida,enviarSalida,onFocusBarcode]);


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
                <div>
                    <input
                        type="text"
                        placeholder="Agregar una descripcion"
                        className="border border-border"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}        
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