import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {getProveedores } from "@/services/productoService";
import ModalProveedores from "./ModalProveedores";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";


interface HeaderProps {
  datos: {
    proveedor: string;
    fecha: string;
    tipoComprobante: string;
    nroComprobante: string;
    observaciones: string;
  };
  onChange: (campo: string, valor: string) => void;
}

export default function Header({ datos, onChange }: HeaderProps) {

  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [modalProveedores, setModalProveedores] = useState(false);
  const [tickProveedores, setTickProveedores] = useState(0);

  useEffect(() => {
    getProveedores().then(setProveedores).catch(() => {});
  }, [tickProveedores]);





  return (
    <div className="grid grid-cols-5 gap-2">
      <div className="flex items-center gap-1">
        <Select value={datos.proveedor}
            onValueChange={(v) => onChange("proveedor", v)}>
            <SelectTrigger className="flex-1 min-w-0"><SelectValue placeholder="Selec Proveedor" /></SelectTrigger>
            <SelectContent>
              {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Gestionar proveedores"
          onClick={() => setModalProveedores(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {/*<Input type="date" value={datos.fecha} onChange={(e) => onChange("fecha", e.target.value)}/>*/}
      <Input type="date" value={datos.fecha} disabled className="bg-slate-50 text-slate-500" />
      
      <Select value={datos.tipoComprobante || ""} onValueChange={(v) => onChange("tipoComprobante", v)}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Tipo de comprobante" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="remito">Remito</SelectItem>
          <SelectItem value="factura">Factura</SelectItem>
        </SelectContent>
      </Select>
       
      {/*<Input placeholder="Tipo comprobante" />*/}  

      {/*<Input placeholder="N° comprobante" />*/}

      <Input 
        placeholder="Observaciones" 
        value={datos.observaciones}
        onChange={(e) => onChange("observaciones", e.target.value)}
      />

      <ModalProveedores
        open={modalProveedores}
        onClose={() => setModalProveedores(false)}
        onCreada={(id) => {
          onChange("proveedor", id);
          setTickProveedores((t) => t + 1);
        }}
      />
    </div>
  );
}