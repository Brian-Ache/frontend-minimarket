import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"; // <- Agregamos ChevronDown
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import InfoBalance from "./infoBalance";
import VentasPorTipo from "./VentasPorTipo";
import Salidas from "./Salidas";
import Entradas from "./Entradas";

export default function PageCorte() {
  // Estado local para la fecha seleccionada (por defecto la fecha actual)
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 20)); // Mes 6 = Julio (0-indexed)

  // Formateador dinámico para la fecha
  const formatDate = (date: Date) => {
    const text = date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Comparador para saber si la fecha elegida es HOY
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">

      {/* HEADER DE LA PÁGINA */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">
            Corte de Caja Diario
          </h1>
          
          {/* Badge informativo de histórico */}
          {!isToday(selectedDate) && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Cierre Histórico
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          
          {/* SELECTOR DE FECHA INTERACTIVO */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 transition-colors border border-slate-200/80 rounded-lg shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(selectedDate)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" /> {/* <- Ícono indicador */}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(newDate) => newDate && setSelectedDate(newDate)}
                disabled={{ after: new Date() }} // <- Bloquea la selección de días futuros
              />  
            </PopoverContent>
          </Popover>

          {/* BOTÓN CORTAR CAJA (Solo visible o activo si es HOY) */}
          {isToday(selectedDate) ? (
            <Button
              onClick={() => {/* Lógica para ejecutar el corte de caja */}}
              className="h-8 px-3 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors rounded-lg"
            >
              Cortar Caja
            </Button>
          ) : (
            <Badge variant="outline" className="h-8 px-3 text-xs font-medium text-slate-500 border-slate-200 bg-slate-50">
              Caja Cerrada
            </Badge>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL DE 3 COLUMNAS */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3 overflow-hidden">

        {/* Columna 1: KPIs */}
        <InfoBalance /*date={selectedDate}*/ />

        {/* Columna 2: Métodos de Pago */}
        <VentasPorTipo /*date={selectedDate}*/ />

        {/* Columna 3: Salidas + Entradas */}
        <div className="flex flex-col gap-3 min-h-0">
          <Salidas /*date={selectedDate}*/ />
          <Entradas /*date={selectedDate}*/ />
        </div>

      </div>
    </div>
  );
}
