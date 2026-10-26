import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumenDiario, type ResumenCaja } from "@/services/cajaService";
import { aFechaISO } from "./fechas";
import ModalVentasDelDia from "./ModalVentasDelDia";

interface InfoBalanceProps {
  date: Date;
  refresco: number;
}

function monto(n: number | null): string {
  if (n === null || n === undefined) return "—";
  const abs = `$${Math.abs(n).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  return n < 0 ? `-${abs}` : abs;
}

export default function InfoBalance({ date, refresco }: InfoBalanceProps) {
  const [resumen, setResumen] = useState<ResumenCaja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVentasAbierto, setModalVentasAbierto] = useState(false);

  useEffect(() => {
    let mounted = true;
    setCargando(true);
    setError(null);

    getResumenDiario(aFechaISO(date))
      .then((data) => {
        if (mounted) setResumen(data);
      })
      .catch((err) => {
        if (mounted) {
          setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Error al cargar el balance del día");
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
      <CardHeader className="shrink-0">
        <CardTitle className="mt-2 text-center text-xs font-bold tracking-wider text-slate-500 uppercase">
          Balance del Día
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-visible md:overflow-y-auto flex flex-col justify-center gap-3 p-4">
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {cargando && !error && (
          <p className="text-sm text-slate-400 text-center">Cargando balance...</p>
        )}

        {!cargando && !error && resumen && (
          <>
            {/* Fondo Inicial */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fondo Inicial</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{monto(resumen.saldoInicial)}</p>
            </div>

            {/* Ventas Brutas Totales */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Ventas Brutas Totales
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {monto(resumen.totalVentas)}
                </p>
                <button
                  onClick={() => setModalVentasAbierto(true)}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors block text-left underline decoration-slate-300 underline-offset-2"
                >
                  Mostrar ventas del día
                  {resumen.cantidadVentas !== null && ` (${resumen.cantidadVentas})`}
                </button>
              </div>
            </div>
            {/* Total Entrada - Verde */}
            <div className="p-4 rounded-lg bg-green-100 text-white border border-slate-800 shadow-sm">  
              <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Total Entradas</p>
              <p className="text-2xl font-extrabold text-green-700 mt-0.5">{monto(resumen.totalEntradasManuales)}</p>
            </div>
            {/* Total Salidas - Rojo Apagado */}
            <div className="p-4 rounded-lg bg-red-50/50 border border-red-100">
              <p className="text-xs font-medium text-red-700/80 uppercase tracking-wide">Total Salidas</p>
              <p className="text-2xl font-bold text-red-700/90 mt-0.5">
                {monto(resumen.totalSalidasManuales !== null ? -resumen.totalSalidasManuales : null)}
              </p>
            </div>

            {/* Total Caja - Destacado en Tono Oscuro (Slate) */}
            <div className="p-4 rounded-lg bg-blue-100 text-white border border-slate-800 shadow-sm">  
              <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Total Caja</p>
              <p className="text-3xl font-extrabold text-green-700 mt-1">{monto(resumen.saldoEsperado)}</p>
            </div>
          </>
        )}
      </CardContent>

      <ModalVentasDelDia
        open={modalVentasAbierto}
        onOpenChange={setModalVentasAbierto}
        date={date}
      />
    </Card>
  );
}
