import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type BarraProps = {
  onAgregar: (codigo: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export default function BarraBusqueda({ onAgregar,inputRef }: BarraProps) {
  const [codigo, setCodigo] = useState("");

  const handleAction = () => {
    if (!codigo) return;
    onAgregar(codigo);
    setCodigo(""); // Limpiar input después de agregar
  };

  return (
    <div className="flex flex-col gap-2 border-0 sm:flex-row">
      <Input
        id="barcode-input"//id de la barra de busqueda por barcode
        ref={inputRef}
        placeholder="Código del producto"
        className="h-11 flex-1 text-base sm:h-12 sm:text-lg"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAction()}
      />
      <Button className="bg-[#4a90e2] h-11 w-full px-4 sm:h-12 sm:w-auto sm:px-6" onClick={handleAction}>
        <span className="sm:hidden">Agregar producto</span>
        <span className="hidden sm:inline">ENTER - Agregar Producto</span>
      </Button>
    </div>
  );
}