import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Percent, 
  Calendar,
  Filter,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VistaGeneral() {
  // Estado para el período seleccionado
  const [periodo, setPeriodo] = useState<string>("este_mes");
  
  // Estados para el rango de fechas personalizado
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const esPersonalizado = periodo === "personalizado";
  const hayFiltrosActivos = periodo !== "este_mes" || fechaDesde !== "" || fechaHasta !== "";

  const resetFiltros = () => {
    setPeriodo("este_mes");
    setFechaDesde("");
    setFechaHasta("");
  };

  // 4 KPIs principales en lugar de 6
  const kpis = [
    {
      titulo: "Ventas Netas",
      valor: "$ 2.450.800",
      subtexto: "+12.5% vs. período anterior",
      esPositivo: true,
      icono: DollarSign,
      colorIcono: "bg-emerald-50 text-emerald-600",
    },
    {
      titulo: "Ganancia Neta Est.",
      valor: "$ 794.050",
      subtexto: "Margen global positivo",
      esPositivo: true,
      icono: TrendingUp,
      colorIcono: "bg-indigo-50 text-indigo-600",
    },
    {
      titulo: "Margen Promedio",
      valor: "32.4%",
      subtexto: "Rentabilidad sobre costo",
      icono: Percent,
      colorIcono: "bg-blue-50 text-blue-600",
    },
    {
      titulo: "Ticket Promedio",
      valor: "$ 4.850",
      subtexto: "Gasto promedio por cliente",
      icono: ShoppingBag,
      colorIcono: "bg-amber-50 text-amber-600",
    },
  ];

  const mediosPago = [
    { nombre: "Efectivo", monto: "$ 1.102.860", porcentaje: 45, colorBarra: "bg-emerald-500" },
    { nombre: "Transferencia", monto: "$ 196.064", porcentaje: 8, colorBarra: "bg-purple-500" },
    { nombre: "PosPcia", monto: "$ 857.780", porcentaje: 35, colorBarra: "bg-sky-500" },
    { nombre: "QRPcia", monto: "$ 294.096", porcentaje: 12, colorBarra: "bg-indigo-500" },
    { nombre: "MP", monto: "$ 196.064", porcentaje: 8, colorBarra: "bg-purple-500" },
  ];

  return (
    <div className="space-y-4">
      
      {/* BARRA SUPERIOR DE FILTRO DE PERÍODO */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <div className="p-2 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 px-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtro de Período:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {/* SELECTOR DE PERÍODO */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
              <Label htmlFor="periodo-filter" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Período:
              </Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger id="periodo-filter" className="w-[150px] h-8 text-xs bg-white border-slate-200 font-medium text-slate-700">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="ayer">Ayer</SelectItem>
                  <SelectItem value="esta_semana">Esta Semana</SelectItem>
                  <SelectItem value="este_mes">Este Mes</SelectItem>
                  <SelectItem value="ultimos_30">Últimos 30 días</SelectItem>
                  <SelectItem value="anio_actual">Año 2026</SelectItem>
                  <SelectItem value="personalizado">Personalizado...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* FECHAS PERSONALIZADAS */}
            {esPersonalizado && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1">
                  <Label htmlFor="fecha-desde" className="text-xs text-slate-500">
                    Desde:
                  </Label>
                  <Input
                    id="fecha-desde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="h-8 w-[125px] text-xs bg-white border-slate-200"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label htmlFor="fecha-hasta" className="text-xs text-slate-500">
                    Hasta:
                  </Label>
                  <Input
                    id="fecha-hasta"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="h-8 w-[125px] text-xs bg-white border-slate-200"
                  />
                </div>
              </div>
            )}

            {/* BOTÓN RESTABLECER */}
            {hayFiltrosActivos && (
              <button
                onClick={resetFiltros}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-1.5 py-0.5 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                Restablecer
              </button>
            )}

          </div>

        </div>
      </Card>

      {/* 1. GRID REDUCIDO DE 4 CARDS DE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, index) => {
          const Icono = kpi.icono;
          return (
            <Card key={index} className="border-slate-200 shadow-xs bg-white p-2.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-1 pb-1.5">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {kpi.titulo}
                </CardTitle>
                <div className={`p-1.5 rounded-md ${kpi.colorIcono}`}>
                  <Icono className="w-3.5 h-3.5" />
                </div>
              </CardHeader>
              <CardContent className="p-1 pt-0">
                <div className="text-xl font-bold text-slate-900 leading-tight">{kpi.valor}</div>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                  {kpi.subtexto}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 2. ZONA INFERIOR: MÉTODOS DE PAGO + FLUJO DE CAJA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* DISTRIBUCIÓN DE MÉTODOS DE PAGO */}
        <Card className="p-2 lg:col-span-2 border-slate-200 shadow-xs bg-white flex flex-col justify-between">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-800">
                  Distribución por Métodos de Pago
                </CardTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Proporción de ingresos acumulados según el canal de cobro.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] py-0 border-slate-200 text-slate-600">
                Consolidado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            {mediosPago.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700">{item.nombre}</span>
                  <div className="space-x-1.5">
                    <span className="text-slate-900 font-bold">{item.monto}</span>
                    <span className="text-slate-400 text-[11px]">({item.porcentaje}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${item.colorBarra}`}
                    style={{ width: `${item.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RESUMEN DE CAJA ACUMULADO */}
        <Card className="border-slate-200 p-2 shadow-xs bg-white flex flex-col justify-between">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-bold text-slate-800">
              Movimientos Manuales de Caja
            </CardTitle>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Suma de Entradas y Salidas fuera de ventas.
            </p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            
            {/* ENTRADAS MANUALES */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Ingresos / Cambio</p>
                  <p className="text-[10px] text-slate-500">Aportes a caja en el período</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">+ $ 45.000</span>
            </div>

            {/* SALIDAS MANUALES */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-rose-100 text-rose-700">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Egresos / Retiros</p>
                  <p className="text-[10px] text-slate-500">Pagos a proveedores / Gastos</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700">- $ 82.400</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Balance de Movimientos:</span>
                <span className="font-bold text-rose-600">- $ 37.400</span>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}