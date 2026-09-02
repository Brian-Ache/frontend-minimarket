import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import type { ProductoResponse } from "@/types/response/productoResponse";

interface AgregarProductoProps {
  onAgregar: (item: any) => void;
}

export default function AgregarProductoCompra({ onAgregar }: AgregarProductoProps) {

  const { productos, search, setSearch } = useProductos();
  const sugerencias = productos.slice(0, 7);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indexSugerencia, setIndexSugerencia] = useState<number>(-1);
  const inputBusquedaRef = useRef<HTMLInputElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    productoId: "",
    nombre: "",
    cantidad: 0,
    costo: 0,
    margen: 0,
    precioVenta: 0
  });

  useEffect(() => {
    const clickAfuera = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (contenedorRef.current && target && !contenedorRef.current.contains(target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  const seleccionarProducto = (prod: ProductoResponse) => {
    const costo = prod.costo ?? 0;
    const margen = prod.margen ?? 0;
    setForm({
      ...form,
      productoId: prod.id,
      nombre: prod.nombre,
      costo,
      margen,
      precioVenta: Math.ceil(costo * (1 + margen / 100) / 50) * 50
    });
    setSearch(prod.nombre);
    setMostrarSugerencias(false);
    setIndexSugerencia(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarSugerencias || sugerencias.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndexSugerencia(prev => (prev < sugerencias.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndexSugerencia(prev => (prev > 0 ? prev - 1 : sugerencias.length - 1));
    } else if (e.key === "Enter") {
      if (indexSugerencia >= 0 && indexSugerencia < sugerencias.length) {
        e.preventDefault();
        seleccionarProducto(sugerencias[indexSugerencia]);
      }
    } else if (e.key === "Escape") {
      setMostrarSugerencias(false);
      setIndexSugerencia(-1);
    }
  };

  const handleCostoMargenChange = (campo: "costo" | "margen", valor: number) => {
    setForm(prev => {
      const nuevoCosto = campo === "costo" ? valor : prev.costo;
      const nuevoMargen = campo === "margen" ? valor : prev.margen;

      if (nuevoCosto <= 0) {
        return { ...prev, [campo]: valor, precioVenta: 0 };
      }

      const calculado = nuevoCosto * (1 + nuevoMargen / 100);
      const precioRedondeado = Math.ceil(calculado / 50) * 50;

      return {
        ...prev,
        [campo]: valor,
        precioVenta: precioRedondeado
      };
    });
  };

  const handlePrecioVentaChange = (nuevoPrecio: number) => {
    setForm(prev => {
      if (prev.costo <= 0) {
        return { ...prev, precioVenta: nuevoPrecio, margen: 0 };
      }

      const margenCalculado = ((nuevoPrecio / prev.costo) - 1) * 100;
      const margenRedondeado = Number(margenCalculado.toFixed(2));

      return {
        ...prev,
        precioVenta: nuevoPrecio,
        margen: margenRedondeado
      };
    });
  };

  const handleAgregar = () => {
    if (!form.productoId || form.costo <= 0 || form.cantidad <= 0) return;

    onAgregar(form);
    console.log("el prodcucto que se agrego fue:",form);

    setForm({
      productoId: "",
      nombre: "",
      cantidad: 1,
      costo: 0,
      margen: 0,
      precioVenta: 0
    });
    setSearch("");
    setMostrarSugerencias(false);
    setIndexSugerencia(-1);

    if (inputBusquedaRef.current) {
      inputBusquedaRef.current.focus();
    }
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-8 gap-2 items-end bg-slate-50 p-3 rounded-lg border-dashed border-2 border-border">
      
      <div className="md:col-span-2 relative" ref={contenedorRef}>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Producto</label>
        <Input 
          ref={inputBusquedaRef}
          placeholder="Escriba el nombre del producto" 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setMostrarSugerencias(true);
            setIndexSugerencia(-1);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute z-50 w-full mt-1 overflow-hidden rounded-md border border-border bg-white shadow-lg">
            {sugerencias.map((prod, index) => (
              <button
                key={prod.id}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${index === indexSugerencia ? "bg-slate-200 font-medium" : "hover:bg-slate-100"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  seleccionarProducto(prod);
                }}
              >
                {prod.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Cantidad</label>
        <Input 
          type="number" 
          value={form.cantidad === 0 ? "" : form.cantidad}
          onChange={(e) => {
            const val = e.target.value;
            setForm({ ...form, cantidad: val === "" ? 0 : Number(val) });
          }}
          onBlur={() => {
            if (form.cantidad <= 0) setForm({ ...form, cantidad: 1 });
          }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Costo ($)</label>
        <Input 
          type="number" 
          value={form.costo === 0 ? "" : form.costo} 
          onChange={(e) => handleCostoMargenChange("costo", Number(e.target.value))} 
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Margen %</label>
        <Input 
          type="number" 
          value={form.margen === 0 ? "" : form.margen}
          onChange={(e) => handleCostoMargenChange("margen", Number(e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">P. Venta</label>
        <Input 
          type="number" 
          className="bg-green-50 font-bold text-green-700"
          value={form.precioVenta === 0 ? "" : form.precioVenta}
          onChange={(e) => handlePrecioVentaChange(Number(e.target.value))}
        />
      </div>

      <div className="md:col-span-1">
        <Button 
            onClick={handleAgregar}
            disabled={!form.productoId || form.costo <= 0 || form.cantidad <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Añadir
        </Button>
      </div>

    </div>
  );
}
