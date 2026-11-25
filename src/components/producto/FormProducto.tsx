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
import { Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import useCargarProducto from "@/hooks/useCargarProducto";
import { getCategorias, getProveedores } from "@/services/productoService";
import ModalCategorias from "./ModalCategorias";
import type { CategoriaResponse } from "@/types/response/categoriaResponse";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";

export default function FormProducto({ onCreated }: { onCreated?: () => void }) {
  const { form, handleChange, cargar, loading, error, reset } = useCargarProducto();
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [modalCategorias, setModalCategorias] = useState(false);
  const [tickCategorias, setTickCategorias] = useState(0);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
    getProveedores().then(setProveedores).catch(() => {});
  }, [tickCategorias]);

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Input className="min-w-0" placeholder="Código de barras" value={form.barcode}
        onChange={(e) => handleChange("barcode", e.target.value)} />
      <Input
          className="min-w-0 capitalize"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => {
              const valor = e.target.value;
              const capitalizado = valor.replace(/\b\p{L}/gu, letra =>
                  letra.toLocaleUpperCase()
              );
              handleChange("nombre", capitalizado);
          }}
      />
      <Input className="min-w-0" placeholder="Precio compra" type="number" value={form.costo || ""}
        onChange={(e) => handleChange("costo", Number(e.target.value))} />
      <Input className="min-w-0" placeholder="Margen" type="number" value={form.margen || ""}
        onChange={(e) => handleChange("margen", parseFloat(e.target.value) || 0)} />
      <Input
          className="min-w-0"
          placeholder="Precio venta"
          type="number"
          value={form.precio || ""}
          onChange={(e) => handleChange("precio", Number(e.target.value))}
      />

      <div className="grid min-w-0 gap-2 lg:col-span-2">
        <Label className="text-slate-600">Categoría</Label>
        <div className="flex items-center gap-1">
          <Select value={form.idCategoria ?? ""}
            onValueChange={(v) => handleChange("idCategoria", v)}>
            <SelectTrigger className="flex-1 min-w-0"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {categorias.map(c => (
                <SelectItem key={c.id} value={c.id} title={c.descripcion ?? ""}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Gestionar categorías"
            onClick={() => setModalCategorias(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-2">
        <Label className="text-slate-600">Proveedor</Label>
        <Select value={form.idProveedor ?? ""}
          onValueChange={(v) => handleChange("idProveedor", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* <div className="col-span-1 flex items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.manejaLotes}
            onChange={(e) => handleChange("manejaLotes", e.target.checked)} />
          <span className="text-sm text-slate-600">Maneja lotes</span>
        </label>
      </div> */}

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5 lg:justify-end">
        <Button className="flex-1 bg-emerald-600 text-white sm:flex-none" onClick={handleGuardar} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        <Button className="flex-1 sm:flex-none" variant="secondary" onClick={reset}>Limpiar</Button>
      </div>

      {error && <p className="text-sm text-red-500 sm:col-span-2 lg:col-span-5">{error}</p>}

      <ModalCategorias
        open={modalCategorias}
        onClose={() => setModalCategorias(false)}
        onCreada={(id) => {
          handleChange("idCategoria", id);
          setTickCategorias((t) => t + 1);
        }}
      />
    </div>
  );
}