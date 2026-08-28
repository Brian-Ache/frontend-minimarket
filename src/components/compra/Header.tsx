import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {getProveedores } from "@/services/productoService";
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

  useEffect(() => {
    getProveedores().then(setProveedores).catch(() => {});
  }, []);

  const  handleChange = (idProveedor: string | number | boolean) =>{
    console.log("provedores:",proveedores);
    console.log("id del proveedore elegido:",idProveedor);
  }



  return (
    <div className="grid grid-cols-5 gap-2">
      <Select value={""}
          onValueChange={(v) => handleChange(v)}>
          <SelectTrigger><SelectValue placeholder="Selec Proveedor" /></SelectTrigger>
          <SelectContent>
            {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      <Input type="date" value={datos.fecha} onChange={(e) => onChange("fecha", e.target.value)}/>
      
      {/* desplegar dos opciones remito o factura con selec que despliegan*/}
      <select className="w-full px-3 py-2 border border-border rounded-md" value={datos.tipoComprobante} onChange={(e) => onChange("tipoComprobante", e.target.value)}>
        <option value="">Tipo de comprobante</option>
        <option value="remito">Remito</option>
        <option value="factura">Factura</option>
      </select>
       
      {/*<Input placeholder="Tipo comprobante" />*/}  

      {/*<Input placeholder="N° comprobante" />*/}

      <Input 
        placeholder="Observaciones" 
        value={datos.observaciones}
        onChange={(e) => onChange("observaciones", e.target.value)}
      />

    </div>
  );
}