import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 1. TIPO DE DATOS DEFINIDO
type EntradaHecha = {
    id : string;
    motivo : string;
    valor : number;
    fecha : Date;
};

// 2. DATOS MOCK DE ENTRADAS (Con horas exactas)
export const entradasMock: EntradaHecha[] = [
    { 
        id: "ent-001", 
        motivo: "Sueldo mensual", 
        valor: 2500, 
        fecha: new Date("2026-06-01T09:30:00") 
    },
    { 
        id: "ent-002", 
        motivo: "Pago suscripción streaming", 
        valor: 15, 
        fecha: new Date("2026-06-02T14:15:22") 
    },
    { 
        id: "ent-003", 
        motivo: "Venta de monitor usado", 
        valor: 200, 
        fecha: new Date("2026-06-04T18:45:00") 
    },
];

// 3. CONTROLADOR/SERVICIO PARA TRAER DATOS (Simula petición a Base de Datos)
const obtenerEntradasDesdeBD = async (): Promise<EntradaHecha[]> => {
    // Para probar el flujo de error y ver cómo carga el Mock, cambia esta variable a 'true'
    const forzarFalloDeBaseDeDatos = false; 

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (forzarFalloDeBaseDeDatos) {
                reject(new Error("No se pudo conectar a la BD"));
            } else {
                // Aquí iría tu fetch real. Ej: fetch('/api/entradas')
                // Simulamos que la BD devuelve datos reales (en este ejemplo vacíos para disparar el fallback)
                const datosDeBD: EntradaHecha[] = []; 
                resolve(datosDeBD);
            }
        }, 1000); // Demora de red simulada de 1 segundo
    });
};

interface ModalEntradaProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFocusBarcode: () => void;
}

export default function ModalEntrada({
    open,
    setOpen,
    onFocusBarcode
}: ModalEntradaProps){
    const [valorEntrada, setValorEntrada] = useState<number>(0);
    const [mensaje, setMensaje] = useState<string>("");
    const [entradasHechas, setEntradasHechas] = useState<EntradaHecha[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);

    // Centralizamos el cierre del modal aquí
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => {
                onFocusBarcode();
            }, 0);
        }
    };

    // 4. LÓGICA DE CARGA CON FALLBACK (BD -> MOCK)
    useEffect(() => {
        if (!open) return; // Solo buscar datos si el modal se abre

        setCargando(true);
        obtenerEntradasDesdeBD()
            .then((datos) => {
                // Si la BD se conectó pero está vacía, usamos el Mock por seguridad.
                if (datos.length === 0) {
                    console.log("BD vacía. Cargando datos Mock de respaldo.");
                    setEntradasHechas(entradasMock);
                } else {
                    setEntradasHechas(datos);
                }
            })
            .catch((error) => {
                console.warn(`${error.message}. Usando el Mock financiero automáticamente.`);
                setEntradasHechas(entradasMock);
            })
            .finally(() => {
                setCargando(false);
            });
    }, [open]);

    // Función para enviar entradas con Hora Exacta incorporada
    const enviarEntrada = (valor: number, motivo: string) => {
        if (!motivo.trim()) return alert("Por favor, ingresa un motivo");

        const nuevaEntrada: EntradaHecha = {
            id: crypto.randomUUID(), // ID Autogenerado único en el cliente
            motivo: motivo,
            valor: valor,
            fecha: new Date() // <--- CAPTURA LA HORA EXACTA ACTUAL
        };

        // Guardamos de forma reactiva local
        setEntradasHechas(prev => [nuevaEntrada, ...prev]);
        
        alert(`Se ingresó: ${motivo} ($${valor})`);
        
        // Limpiamos los inputs
        setValorEntrada(0);
        setMensaje("");
        //handleOpenChange(false);
    };

    // MANEJO DE MODAL CON TECLA Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
        
            if (e.key === "Enter") {
                enviarEntrada(valorEntrada, mensaje);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, valorEntrada, mensaje]); // Quitamos funciones de las dependencias para evitar bucles repetitivos

    return(
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Entrada de Dinero</DialogTitle>
                    <DialogDescription>Completa los campos para registrar un nuevo movimiento.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3">
                    <Input
                        type="number"
                        placeholder="Monto ($)"
                        value={valorEntrada === 0 ? "" : valorEntrada}
                        onChange={(e) => setValorEntrada(Number(e.target.value))}
                    />
                    <Input
                        type="text"
                        placeholder="Agregar una descripción o motivo"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}        
                    />
                </div>

                {/* 5. TABLA DE REGISTROS RENDERIZADA */}
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md mt-4">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="p-2 text-slate-600 font-semibold w-1/3">Hora</th>
                                <th className="p-2 text-slate-600 font-semibold w-1/3">Motivo</th>
                                <th className="p-2 text-slate-600 font-semibold w-1/3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                            {cargando ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-4 text-slate-400">Sincronizando flujos...</td>
                                </tr>
                            ) : entradasHechas.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-4 text-slate-400">No hay registros aún.</td>
                                </tr>
                            ) : (
                                entradasHechas.map((entrada) => (
                                    <tr key={entrada.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 text-xs text-slate-500">
                                            {entrada.fecha.toLocaleString("es-ES", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                
                                                hour12: false
                                            })}
                                        </td>
                                        <td className="p-2 font-medium">{entrada.motivo}</td>
                                        <td className={`p-2 text-right font-semibold text-green-600`}>
                                            ${entrada.valor}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                    <Button onClick={() => enviarEntrada(valorEntrada, mensaje)}>Aceptar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}