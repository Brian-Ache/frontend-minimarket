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
    <div className="min-h-[220px] overflow-hidden rounded-md border border-border md:h-full md:min-h-0">

      <div className="divide-y divide-border md:hidden">
        {items.length === 0 ? (
          <p className="p-4 text-center text-sm text-slate-500">No hay productos agregados.</p>
        ) : (
          items.map((item, i) => (
            <div key={`${item.productoId}-${i}`} className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 break-words font-medium">{item.nombre}</span>
                <button
                  type="button"
                  aria-label={`Quitar ${item.nombre}`}
                  onClick={() => setItems(items.filter((_, j) => j !== i))}
                  className="shrink-0 rounded p-1 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
                <span>Cantidad: {item.cantidad}</span>
                <span>Costo: ${item.costo}</span>
                <span>Margen: {item.margen}%</span>
                <span>Venta: ${Math.round(item.costo * (1 + item.margen / 100))}</span>
              </div>
              <div className="text-right text-sm font-semibold">
                Subtotal: ${item.cantidad * item.costo}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="hidden h-full overflow-auto md:block">
      <table className="w-full min-w-[700px] text-sm">

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

    </div>
  );
}
