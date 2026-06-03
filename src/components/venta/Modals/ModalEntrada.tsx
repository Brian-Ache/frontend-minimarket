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

type EntradaHecha = {
    motivo : string;
    valor : number;
};

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
    const [mensaje, setMensaje] = useState("");
    const [salidasHechas,setSalidasHechas] = useState<EntradaHecha>({
        motivo: "",
        valor: 0,
    });

    //Centralizamos el cierre del modal aquí
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


////MANEJO DE MODAL CON TECLA Enter
// Manejar navegación con teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
        
            if (e.key === "Enter") {
                //console.log("Se agrego ticket con el nombre: "+ nombre);
                enviarEntrada(valorEntrada);
                setOpen(false); // Al pasar a false, el useEffect de arriba limpiará el input
                onFocusBarcode();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, setOpen,valorEntrada,enviarEntrada,onFocusBarcode]);


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
                <div>
                    <input
                        type="text"
                        placeholder="Agregar una descripcion"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}        
                    />
                </div>
                <table>
                    <thead className="bg-slate-100 sticky top-0 shadow-sm z-10">
                        <tr>
                        <th className="w-[12%] p-2 text-left text-slate-600 font-semibold">Motivo</th>
                        <th className="w-[48%] p-2 text-left text-slate-600 font-semibold">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                        {productosDelTicket.map((prod) => {
                        const isSelected = productoSeleccionadoId === prod.id;
                        
                            return (
                                <tr
                                key={prod.id}
                                onClick={() => onSeleccionarProducto(prod.id)}
                                className={`cursor-pointer transition-colors h-10 ${ 
                                    isSelected
                                    ? "bg-blue-100 hover:bg-blue-200 text-blue-950" 
                                    : "hover:bg-slate-50"
                                }`}
                                >
                                <td className="p-2 truncate">{prod.id}</td>
                                <td className="p-2 truncate font-medium text-slate-900">{prod.nombre}</td>
                                <td className="p-2 text-right">${prod.precio.toLocaleString()}</td>
                                <td className="p-2 text-center">{prod.cantidad}</td>
                                <td className="p-2 text-right">
                                    ${(prod.precio * prod.cantidad).toLocaleString()}
                                </td>
                                </tr>
                            );
                        })}
                        
                        {productosDelTicket.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                            Este ticket no tiene productos.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
                <DialogFooter>
                    <Button onClick={() => {enviarEntrada(valorEntrada);}}>Aceptar</Button>
                    <Button onClick={() => handleOpenChange(false)}
                    >Cancelar</Button>
                    <Button>Registro Entradas</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}