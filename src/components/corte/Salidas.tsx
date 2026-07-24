import { Button } from "@/components/ui/button";

const salidasMock = [
  { id: 1, hora: "10:15", descripcion: "Proveedor de Pan", monto: 12000 },
  { id: 2, hora: "11:30", descripcion: "Distribuidora Cigarrillos", monto: 5500 },
];

export default function Salidas() {
  return (
    <div className="min-h-0 md:h-full flex flex-col bg-background border border-border rounded-md overflow-hidden">

      <div className="shrink-0 flex items-center justify-between p-3 border-b border-border bg-slate-100">
        <h3 className="font-semibold text-slate-700">
          Salidas (Proveedores)
        </h3>
        <Button size="sm" variant="outline" className="text-slate-600">
          + Salida
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-visible md:overflow-y-auto">
        <div className="flex flex-col">
          {salidasMock.map((salida) => (
            <div
              key={salida.id}
              className="flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-blue-100/70 border-b border-slate-100 last:border-b-0 cursor-pointer"
            >
              {/* Columna Hora + Descripción */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-medium text-slate-400 shrink-0 w-12">
                  {salida.hora}
                </span>
                <span className="text-sm text-slate-700 font-medium truncate">
                  {salida.descripcion}
                </span>
              </div>

              {/* Columna Monto */}
              <span className="text-sm font-semibold text-red-700/80 shrink-0 ml-2">
                -${salida.monto.toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
