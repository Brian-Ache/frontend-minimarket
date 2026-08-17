import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useState, useEffect} from "react"; 
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function FormProducto() {

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioCompra, setPrecioCompra] = useState(0);
  const [margen, setMargen] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [categoriaSelect, setCategoriaSelect] = useState("");
  const [proveedorSelect, setProveedorSelect] = useState("");
 
  useEffect(() => {
    const nuevoPrecioVenta = precioCompra + (precioCompra * margen / 100);
    const precioRedondeado = Math.ceil(nuevoPrecioVenta / 50) * 50;
    setPrecioVenta(precioRedondeado);
  }, [precioCompra, margen]);

  const limpiarFormulario = () => {
    setCodigo("");
    setNombre("");
    setPrecioCompra(0);
    setMargen(0);
    setPrecioVenta(0);
    setCategoriaSelect("");
    setProveedorSelect("");
  };
  
  return (
    <div className="grid grid-cols-6 gap-2">

      <Input className="col-span-1" placeholder="Código de barras" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      <Input className="col-span-1" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <Input className="col-span-1" placeholder="Precio compra" type="number" value={precioCompra || ""} onChange={(e) => setPrecioCompra(Number(e.target.value))} />
      <Input className="col-span-1" placeholder="Margen" type="number"
        value={margen || ""}
        onChange={(e) => setMargen(parseFloat(e.target.value) || 0)}
      />
      <Input className="col-span-1" placeholder="Precio venta" value={precioVenta || ""} readOnly />
      <div className="col-span-1" />

      <div className="col-span-1 grid gap-2">
        <Label htmlFor="categoria" className="text-slate-600">Categoría</Label>
        <Select
          value={categoriaSelect}
          onValueChange={(value) => setCategoriaSelect(value)}
        >
          <SelectTrigger id="categoria">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bebidas">Bebidas</SelectItem>
            <SelectItem value="Alimentos">Alimentos</SelectItem>
            <SelectItem value="Limpieza">Limpieza</SelectItem>
            <SelectItem value="Congelados">Congelados</SelectItem>
            <SelectItem value="Lácteos y Frescos">Lácteos y Frescos</SelectItem>
            <SelectItem value="Cigarrillos">Cigarrillos</SelectItem>
            <SelectItem value="Kiosco">Kiosco</SelectItem>
            <SelectItem value="Mascotas">Mascotas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2 grid gap-2">
        <Label htmlFor="proveedor" className="text-slate-600">Proveedor</Label>
        <Select
          value={proveedorSelect}
          onValueChange={(value) => setProveedorSelect(value)}
        >
          <SelectTrigger id="proveedor">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Coca">Coca Cola</SelectItem>
            <SelectItem value="Pepsi">Pepsi</SelectItem>
            <SelectItem value="Local">Distribuidora Local</SelectItem>
            <SelectItem value="Cervecería y Maltería Quilmes">Cervecería y Maltería Quilmes</SelectItem>
            <SelectItem value="Aguas Danone">Aguas Danone</SelectItem>
            <SelectItem value="Unilever Argentina">Unilever Argentina</SelectItem>
            <SelectItem value="Arcor">Arcor</SelectItem>
            <SelectItem value="Paladini">Paladini</SelectItem>
            <SelectItem value="Bimbo Argentina">Bimbo Argentina</SelectItem>
            <SelectItem value="Bagley">Bagley</SelectItem>
            <SelectItem value="Molinos Río de la Plata">Molinos Río de la Plata</SelectItem>
            <SelectItem value="Mondelēz International">Mondelēz International</SelectItem>
            <SelectItem value="Fratelli Branca">Fratelli Branca</SelectItem>
            <SelectItem value="Mastellone Hermanos">Mastellone Hermanos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-1" />

      <div className="col-span-1 flex items-end justify-between gap-2">
        <Button className="bg-emerald-600 text-white">
          Guardar
        </Button>
        <Button variant="secondary" onClick={limpiarFormulario}>
          Limpiar
        </Button>
      </div>

    </div>
  );
}
