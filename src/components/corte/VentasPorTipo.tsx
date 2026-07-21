import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function VentasPorTipo() {
  return (
    <Card className="h-full flex flex-col bg-background border-1 ring-0 shadow-none">
      <CardHeader className="border-none shrink-0 pb-2">
        <CardTitle className="mt-2 border-none text-center text-xs font-bold tracking-wider text-slate-500 uppercase">
          Ingresos por Método de Pago
        </CardTitle>
      </CardHeader>

      <Separator className="my-1" />

      <CardContent className="border-none flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-4">

        {/* Efectivo */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
          <p className="border-none text-xs font-medium text-slate-500 uppercase tracking-wide">Efectivo</p>
          <p className="border-none text-2xl font-bold text-slate-800 mt-0.5">$85.000,00</p>
        </div>

        {/* Posnet / Tarjetas */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
          <p className="border-none text-xs font-medium text-slate-500 uppercase tracking-wide">Posnet / Tarjetas</p>
          <p className="border-none text-2xl font-bold text-slate-800 mt-0.5">$42.300,00</p>
        </div>

        {/* Transferencias / QR */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
          <p className="border-none text-xs font-medium text-slate-500 uppercase tracking-wide">Transferencias / QR</p>
          <p className="border-none text-2xl font-bold text-slate-800 mt-0.5">$18.000,00</p>
        </div>

        {/* FIADOS */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
          <p className="border-none text-xs font-medium text-slate-500 uppercase tracking-wide">Fiados / Cuenta Corriente</p>
          <p className="border-none text-2xl font-bold text-slate-800 mt-0.5">$11.000,00</p>
        </div>

        {/* FIADOS */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
          <p className="border-none text-xs font-medium text-slate-500 uppercase tracking-wide">Fiados / Cuenta Corriente</p>
          <p className="border-none text-2xl font-bold text-slate-800 mt-0.5">$11.000,00</p>
        </div>

        {/* FIADOS */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
          <p className="border-none text-xs font-medium text-slate-500 uppercase tracking-wide">Fiados / Cuenta Corriente</p>
          <p className="border-none text-2xl font-bold text-slate-800 mt-0.5">$11.000,00</p>
        </div>

      </CardContent>
    </Card>
  );
}