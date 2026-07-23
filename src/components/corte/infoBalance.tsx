import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function InfoBalance() {
  return (
    <Card className="h-full flex flex-col bg-background border border-border ring-0 shadow-none">
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="mt-2 text-center text-xs font-bold tracking-wider text-slate-500 uppercase">
          Balance del Día
        </CardTitle>
      </CardHeader>

      <Separator className="my-1" />

      <CardContent className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center gap-3 p-4"> 

        {/* Fondo Inicial */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fondo Inicial</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">$20.000,00</p>
        </div>

        {/* Ventas Brutas Totales */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Ventas Brutas Totales
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              $145.300,00
            </p>
            <button 
              onClick={() => {/* Lógica para mostrar ventas del día */}}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors block text-left underline decoration-slate-300 underline-offset-2"
            >
              Mostrar ventas del día
            </button>
          </div>
        </div>
        {/* Total Salidas - Rojo Apagado */}
        <div className="p-4 rounded-lg bg-red-50/50 border border-red-100">
          <p className="text-xs font-medium text-red-700/80 uppercase tracking-wide">Total Salidas</p>
          <p className="text-2xl font-bold text-red-700/90 mt-0.5">-$17.500,00</p>
        </div>

        {/* Total Caja - Destacado en Tono Oscuro (Slate) */}
        <div className="p-4 rounded-lg bg-green-100 text-white border border-slate-800 shadow-sm">  
          <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Total Caja</p>
          <p className="text-3xl font-extrabold text-green-700 mt-1">$147.800,00</p>
        </div>

      </CardContent>
    </Card>
  );
}
