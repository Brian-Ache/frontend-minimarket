import { useEffect, useState } from "react";
import { getMovimientosPorRango, type MovimientoCaja } from "@/services/cajaService";
import { rangoDelDia } from "./fechas";

interface SalidasProps {
  date: Date;
  refresco: number;
}

function horaDe(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function Salidas({ date, refresco }: SalidasProps) {
  const [salidas, setSalidas] = useState<MovimientoCaja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const { desde, hasta } = rangoDelDia(date);
    setCargando(true);
    setError(null);

    getMovimientosPorRango(desde, hasta, 0, 200)
      .then((movs) => {
        if (mounted) {
          setSalidas(movs.filter((m) => m.tipo === "SALIDA"));
        }
      })
      .catch((err) => {
        if (mounted) {
          setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al cargar las salidas");
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, [date, refresco]);

  return (
    <div className="min-h-0 md:h-full flex flex-col bg-background border border-border rounded-md overflow-hidden">

      <div className="shrink-0 flex items-center justify-between p-3 border-b border-border bg-slate-100">
        <h3 className="font-semibold text-slate-700">
          Salidas
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-visible md:overflow-y-auto">
        {error && <p className="text-sm text-red-600 text-center p-3">{error}</p>}
        {cargando && !error && (
          <p className="text-sm text-slate-400 text-center p-3">Cargando salidas...</p>
        )}
        {!cargando && !error && salidas.length === 0 && (
          <p className="text-sm text-slate-400 text-center p-3">No hay salidas en este día.</p>
        )}
        {!cargando && !error && salidas.length > 0 && (
          <div className="flex flex-col">
            {salidas.map((salida) => (
              <div
                key={salida.id}
                className="flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-blue-100/70 border-b border-slate-100 last:border-b-0"
              >
                {/* Columna Hora + Descripción */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-medium text-slate-400 shrink-0 w-12">
                    {horaDe(salida.fecha)}
                  </span>
                  <span className="text-sm text-slate-700 font-medium truncate">
                    {salida.motivo ?? "—"}
                  </span>
                </div>

                {/* Columna Monto */}
                <span className="text-sm font-semibold text-red-700/80 shrink-0 ml-2">
                  -${salida.monto.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
