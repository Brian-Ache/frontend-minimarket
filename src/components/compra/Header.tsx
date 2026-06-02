import { Input } from "@/components/ui/input";


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
  return (
    <div className="grid grid-cols-5 gap-2">
      <Input 
        placeholder="Proveedor" 
        value={datos.proveedor}
        onChange={(e) => onChange("proveedor", e.target.value)}
      />
      <Input type="date" value={datos.fecha} onChange={(e) => onChange("fecha", e.target.value)}/>
      
      {/* desplegar dos opciones remito o factura con selec que despliegan*/}
      <select className="w-full px-3 py-2 border rounded-md" value={datos.tipoComprobante} onChange={(e) => onChange("tipoComprobante", e.target.value)}>
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