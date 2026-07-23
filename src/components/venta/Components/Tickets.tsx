type Ticket = {
  id: number;
  nombre: string;
  productos: Producto[];
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

type Props = {
  tickets: Ticket[];
  activeTicket: number;
  setActiveTicket: (id: number) => void;
  productoSeleccionadoId: number | null;
  onSeleccionarProducto: (id: number | null) => void;
  onFocusBarcode: () => void;
};

export default function Tickets({
  tickets,
  activeTicket,
  setActiveTicket,
  productoSeleccionadoId,
  onSeleccionarProducto,
  onFocusBarcode,
}: Props) {
  
  const ticketActual = tickets.find((t) => t.id === activeTicket);
  const productosDelTicket = ticketActual ? ticketActual.productos : [];

  return (
    <div className="h-full flex flex-col min-h-0 p-1 select-none">
      {/* Tabs */}
      <div className="flex items-end shrink-0">
        {/*recorre el array ticket y por cada ticket retorna un boton que referencia a ese ticket*/}
        {tickets.map((ticket) => {
          const isActive = ticket.id === activeTicket;
          return (
            <button
              key={ticket.id}
              onClick={() => {
                setActiveTicket(ticket.id);
                onSeleccionarProducto(null); 
                setTimeout(() => {
                  onFocusBarcode();
                }, 0);
              }}
              className={`
                px-4 py-1 text-sm font-medium
                border border-border relative rounded-t-md transition-colors
                ${
                  isActive
                    ? "bg-slate-100 z-20 -mb-px border-b-transparent font-semibold"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-200 border-b-slate-200"
                }
              `}
            >
              {ticket.nombre}({ticket.id})
            </button>
          );
        })}
      </div>

      {/* Tabla con alturas y anchos fijos para evitar "saltos" */}
      <div className="flex-1 min-h-0 overflow-auto bg-background border border-border rounded-b-md table-fixed-layout">
        {/*table-fixed congela el ancho de las columnas */}
        <table className="w-full text-sm table-fixed"> 
          <thead className="bg-slate-100 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="w-[12%] p-2 text-left text-slate-600 font-semibold">Código</th>
              <th className="w-[48%] p-2 text-left text-slate-600 font-semibold">Descripción</th>
              <th className="w-[15%] p-2 text-right text-slate-600 font-semibold">Precio</th>
              <th className="w-[10%] p-2 text-center text-slate-600 font-semibold">Cant</th>
              <th className="w-[15%] p-2 text-right text-slate-600 font-semibold">Importe</th>
            </tr>
          </thead>

          {/*line-height y font-weight estables para que nada se mueva al navegar */}
          {/*recorre el array productosDelTicket que tiene todos los productos del ticket actual y retorna una fila con cada producto que tenga*/}
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {productosDelTicket.map((prod) => {
              const isSelected = productoSeleccionadoId === prod.id;
              
              return (
                <tr
                  key={prod.id}
                  onClick={() => onSeleccionarProducto(prod.id)}
                  className={`cursor-pointer transition-colors h-10 ${ 
                    isSelected
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-950" 
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="p-2 truncate">{prod.id}</td>
                  <td className="p-2 truncate font-medium text-slate-900">{prod.nombre}</td>
                  <td className="p-2 text-right">${prod.precio.toLocaleString()}</td>
                  <td className="p-2 text-center">{prod.cantidad}</td>
                  <td className="p-2 text-right">
                    ${(prod.precio * prod.cantidad).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            
            {productosDelTicket.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                  Este ticket no tiene productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}