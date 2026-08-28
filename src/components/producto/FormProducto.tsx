/**
 * FormProducto — Formulario de carga de productos.
 *
 * Recibe un callback `onCreated` que se ejecuta después de crear un producto
 * exitosamente. Su propósito es avisar al componente padre (ProductoPage)
 * que hay un producto nuevo, para que este dispare el refresh de la tabla.
 * Se usa optional chaining (onCreated?.()) porque el callback es opcional,
 * permitiendo que el formulario se use también sin tabla (caso standalone).
 */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import useCargarProducto from "@/hooks/useCargarProducto";
import { getCategorias, getProveedores } from "@/services/productoService";
import type { CategoriaResponse } from "@/types/response/categoriaResponse";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";

export default function FormProducto({ onCreated }: { onCreated?: () => void }) {
  const { form, handleChange, cargar, loading, error, reset } = useCargarProducto();
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
    getProveedores().then(setProveedores).catch(() => {});
  }, []);

  const handleGuardar = async () => {
    try {
      const result = await cargar();
      console.log("Producto creado:", result);
      alert("Producto creado exitosamente");
      onCreated?.();
    } catch {
      // error ya está en el hook
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      <Input className="col-span-1" placeholder="Código de barras" value={form.barcode}
        onChange={(e) => handleChange("barcode", e.target.value)} />
      <Input className="col-span-1" placeholder="Nombre" value={form.nombre}
        onChange={(e) => handleChange("nombre", e.target.value)} />
      <Input className="col-span-1" placeholder="Precio compra" type="number" value={form.costo || ""}
        onChange={(e) => handleChange("costo", Number(e.target.value))} />
      <Input className="col-span-1" placeholder="Margen" type="number" value={form.margen || ""}
        onChange={(e) => handleChange("margen", parseFloat(e.target.value) || 0)} />
      <Input className="col-span-1" placeholder="Precio venta" value={form.precio || ""} readOnly />

      <div className="col-span-1 grid gap-2">
        <Label className="text-slate-600">Categoría</Label>
        <Select value={form.idCategoria ?? ""}
          onValueChange={(v) => handleChange("idCategoria", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2 grid gap-2">
        <Label className="text-slate-600">Proveedor</Label>
        <Select value={form.idProveedor ?? ""}
          onValueChange={(v) => handleChange("idProveedor", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 flex items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.manejaLotes}
            onChange={(e) => handleChange("manejaLotes", e.target.checked)} />
          <span className="text-sm text-slate-600">Maneja lotes</span>
        </label>
      </div>

      <div className="col-span-1 flex items-end justify-between gap-2">
        <Button className="bg-emerald-600 text-white" onClick={handleGuardar} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        <Button variant="secondary" onClick={reset}>Limpiar</Button>
      </div>

      {error && <p className="col-span-6 text-red-500 text-sm">{error}</p>}
    </div>
  );
}