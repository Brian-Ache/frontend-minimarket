import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useState, useEffect} from "react"; 

export default function FormProducto() {

  const [margen, setMargen] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);

  //funcion para que  cuando el margen cambie, se actualice el precio de venta y lo redonde de 50 en 50,segun el precio de compra 
  useEffect(() => {
    const precioCompra = parseFloat((document.querySelector('input[placeholder="Precio compra"]') as HTMLInputElement)?.value || "0");
    
    const nuevoPrecioVenta = precioCompra + (precioCompra * margen / 100);
    const precioRedondeado = Math.ceil(nuevoPrecioVenta / 50) * 50;

    setPrecioVenta(precioRedondeado);
  }, [margen]);
  
  return (
    <div className="grid grid-cols-6 gap-2">

      <Input placeholder="Código de barras" />
      <Input placeholder="Nombre" />
      <Input placeholder="Precio compra" />
      <input type="number" placeholder="Margen" className="border border-border" onChange={(e) => setMargen(parseFloat(e.target.value))} />
      <Input placeholder="Precio venta" value={precioVenta} />
      <Input placeholder="Cantidad"/>
      <select className="border border-border">
        <option value="">Categorías</option>
        <option value="Bebidas">Bebidas</option>
        <option value="Alimentos">Alimentos</option>
      </select>
      <select className="border border-border">
        <option value="">Proveedores</option>
        <option value="Proveedor 1">Proveedor 1</option>
        <option value="Proveedor 2">Proveedor 2</option>
      </select>

      <div className="col-span-6 flex gap-2">
        <Button className="bg-emerald-600 text-white">
          Guardar
        </Button>
        <Button variant="secondary">
          Limpiar
        </Button>
      </div>

    </div>
  );
}