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
    <div className="flex gap-2 border-0">
      <Input
        id="barcode-input"//id de la barra de busqueda por barcode
        ref={inputRef}
        placeholder="Código del producto"
        className="flex-1 text-lg h-12"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAction()}
      />
      <Button className="bg-[#4a90e2] h-12 px-6" onClick={handleAction}>
        ENTER - Agregar Producto
      </Button>
    </div>
  );
}