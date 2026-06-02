import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BarraBusquedaProducto() {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Escanear o ingresar código de barras..."
        className="flex-1"
      />
      <Button>Buscar</Button>
    </div>
  );
}