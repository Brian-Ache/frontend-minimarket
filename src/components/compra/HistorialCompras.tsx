import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HistorialCompras() {
  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* 🔎 Filtros */}
      <div className="grid grid-cols-5 gap-2 shrink-0">

        <Input placeholder="Proveedor" />

        <Input type="date" />

        <Input type="date" />

        <select className="w-full px-3 py-2 border border-border rounded-md">
          <option value="">Tipo de comprobante</option>
          <option value="remito">Remito</option>
          <option value="factura">Factura</option>
        </select>

        <Button>
          Buscar
        </Button>
        {/* queremos poder buscar por producto para saber en que boleta vino ese producto  quien lo trajo*/}
        <input placeholder="Buscar por producto" className="border border-border rounded-md p-2" />
        {/* queremos saber cuales fueron las boletas que superaron cierto monto*/}
        <input placeholder="Buscar por monto" className="border border-border rounded-md p-2" />
      </div>

      {/* 📋 Tabla */}
      <div className="flex-1 border border-border rounded-md overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Proveedor</th>
              <th className="p-2 text-left">Comprobante</th>
              <th className="p-2 text-right">Total</th>
              {/* en este caso no me interesa saber el estado ya que es para saber cuales hay que pagar y las boletas se pagan al instante */}
              {/*<th className="p-2 text-center">Estado</th>*/}
            </tr>
          </thead>

          <tbody>
            {[...Array(20)].map((_, i) => (
              <tr
                key={i}
                className="border-t border-border hover:bg-slate-50 cursor-pointer"
              >
                <td className="p-2">15/04/2026</td>

                <td className="p-2">
                  Proveedor {i}
                </td>

                <td className="p-2">
                  FAC-000{i}
                </td>

                <td className="p-2 text-right">
                  $25.000
                </td>

                {/*<td className="p-2 text-center">
                  ACTIVA
                </td>*/}    
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}