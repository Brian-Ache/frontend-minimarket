import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// [SQLite] Importar servicio de productos local
import { getProductos } from "@/services/venta/sqliteService";

// [SQLite] Producto local con id string (UUID de SQLite)
interface Producto {
  id: string;
  nombre: string;
  precio: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (codigo: string) => void;
}

export default function PanelBusquedaProductos({ isOpen, onClose, onSelect }: Props) {
  const [filtro, setFiltro] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);

  // [SQLite] Cargar productos de SQLite al abrir
  useEffect(() => {
    if (isOpen) {
      getProductos().then(setProductos).catch(() => setProductos([]));
    }
  }, [isOpen]);

  // [SQLite] Filtrado en tiempo real
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.id.includes(filtro)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Producto (F10)</DialogTitle>
          <Input 
            placeholder="Escribe nombre o código..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="mt-2"
            autoFocus 
          />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 border border-border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-right">Precio</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr 
                  key={p.id} 
                  className="border-t border-border hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    onSelect(p.id);
                    onClose();
                  }}
                >
                  <td className="p-2 font-mono">{p.id}</td>
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2 text-right">${p.precio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}