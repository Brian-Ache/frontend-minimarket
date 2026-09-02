import { Trash2 } from "lucide-react";

type CompraItem = {
  productoId: string;
  nombre: string;
  cantidad: number;
  costo: number;
  margen: number;
  precioVenta: number;
};

interface ItemsTableProps {
  items: CompraItem[];
  setItems: (nuevosItems: CompraItem[]) => void;
}


export default function ItemsTable({ items, setItems }: ItemsTableProps) {
  return (
    <div className="h-full border border-border rounded-md overflow-auto">

      <table className="w-full text-sm">

        <thead className="bg-slate-100 sticky top-0">
          <tr>
            <th className="p-2 text-left">Producto</th>
            <th className="p-2 text-right">Cantidad</th>
            <th className="p-2 text-right">Costo</th>
            <th className="p-2 text-right">Margen</th>
            <th className="p-2 text-right">Precio Venta</th>
            <th className="p-2 text-right">Subtotal</th>
            <th className="p-2 text-center">Acción</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center text-sm text-slate-500">
                No hay productos agregados.
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={`${item.productoId}-${i}`} className="border-t border-border hover:bg-slate-50">
                <td className="p-2">{item.nombre}</td>
                <td className="p-2 text-right">{item.cantidad}</td>
                <td className="p-2 text-right">${item.costo}</td>
                <td className="p-2 text-right">{item.margen}%</td>
                <td className="p-2 text-right">
                  ${Math.round(item.costo * (1 + item.margen / 100))}
                </td>
                <td className="p-2 text-right">${item.cantidad * item.costo}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    className="hover:bg-red-50 rounded p-1"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>

    </div>
  );
}
