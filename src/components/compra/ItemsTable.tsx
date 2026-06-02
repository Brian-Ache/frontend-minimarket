type CompraItem = {
  productoId: number;
  cantidad: number;
  costo: number;
  margen: number;
};

interface ItemsTableProps {
  items: CompraItem[];
  setItems: (nuevosItems: CompraItem[]) => void;
}

//NAVIGACION POR TECLADO EN LA TABLA DE TICKETS


export default function ItemsTable({ items, setItems }: ItemsTableProps) {
  return (
    <div className="h-full border rounded-md overflow-auto">

      <table className="w-full text-sm">

        <thead className="bg-slate-100 sticky top-0">
          <tr>
            <th className="p-2 text-left">Producto</th>
            <th className="p-2 text-right">Cantidad</th>
            <th className="p-2 text-right">Costo</th>
            <th className="p-2 text-right">Margen</th>
            <th className="p-2 text-right">Precio Venta</th>
            <th className="p-2 text-right">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-sm text-slate-500">
                No hay productos agregados.
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={`${item.productoId}-${i}`} className="border-t hover:bg-slate-50">
                <td className="p-2">{item.productoId}</td>
                <td className="p-2 text-right">{item.cantidad}</td>
                <td className="p-2 text-right">${item.costo}</td>
                <td className="p-2 text-right">{item.margen}%</td>
                <td className="p-2 text-right">
                  ${Math.round(item.costo * (1 + item.margen / 100))}
                </td>
                <td className="p-2 text-right">${item.cantidad * item.costo}</td>
              </tr>
            ))
          )}
        </tbody>

      </table>

    </div>
  );
}