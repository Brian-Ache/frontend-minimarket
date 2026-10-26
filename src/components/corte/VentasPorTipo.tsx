import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getResumenDiarioVentas, type ResumenVentas } from "@/services/ventaService";
import { aFechaISO } from "./fechas";

interface VentasPorTipoProps {
  date: Date;
  refresco: number;
}

function monto(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function VentasPorTipo({ date, refresco }: VentasPorTipoProps) {
  const [resumen, setResumen] = useState<ResumenVentas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setCargando(true);
    setError(null);

    getResumenDiarioVentas(aFechaISO(date))
      .then((data) => {
        if (mounted) setResumen(data);
      })
      .catch((err) => {
        if (mounted) {
          setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al cargar los ingresos por método de pago");
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
    <Card className="min-h-0 md:h-full flex flex-col bg-background border border-border ring-0 shadow-none">
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="mt-2 text-center text-xs font-bold tracking-wider text-slate-500 uppercase">
          Ingresos por Método de Pago
        </CardTitle>
      </CardHeader>

      <Separator className="my-1" />

      <CardContent className="flex-1 min-h-0 overflow-y-visible md:overflow-y-auto flex flex-col gap-3 p-4">
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {cargando && !error && (
          <p className="text-sm text-slate-400 text-center">Cargando ingresos...</p>
        )}

        {!cargando && !error && resumen && (
          <>
            {/* Efectivo */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Efectivo</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{monto(resumen.totalEfectivo)}</p>
            </div>

            {/* Posnet / Tarjetas */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Posnet / Tarjetas</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{monto(resumen.totalTarjeta)}</p>
            </div>

            {/* Transferencias / QR */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Transferencias / QR</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{monto(resumen.totalTransferencia)}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
