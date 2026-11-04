import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEventosCola,
  type EventoCola,
} from "@/services/venta/sqliteService";

interface ModalEventosColaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatFecha = (fecha: string): string => {
  const f = new Date(fecha.includes("T") ? fecha : fecha.replace(" ", "T"));
  if (isNaN(f.getTime())) return fecha;
  return `${f.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${f.toLocaleTimeString(
    "es-ES",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  )}`;
};

const estadoBadge = (estado: string) => {
  switch (estado) {
    case "PENDIENTE":
      return "bg-amber-100 text-amber-700";
    case "ENVIADO":
      return "bg-emerald-100 text-emerald-700";
    case "ERROR":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function ModalEventosCola({ open, onOpenChange }: ModalEventosColaProps) {
  const [eventos, setEventos] = useState<EventoCola[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setCargando(true);
    setError(null);
    getEventosCola()
      .then(setEventos)
      .catch(() => setError("No se pudo leer la cola de eventos"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!open) return;
    cargar();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cola de eventos (SQLite)</DialogTitle>
          <DialogDescription>
            Todos los eventos de la cola local, sin importar su estado.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="max-h-[400px] overflow-auto border border-slate-200 rounded-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-2 text-slate-600 font-semibold">Fecha</th>
                <th className="p-2 text-slate-600 font-semibold">Tipo</th>
                <th className="p-2 text-slate-600 font-semibold">Estado</th>
                <th className="p-2 text-slate-600 font-semibold text-right">Intentos</th>
                <th className="p-2 text-slate-600 font-semibold">UUID entidad</th>
                <th className="p-2 text-slate-600 font-semibold">Último error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-slate-400">
                    Cargando eventos...
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-slate-400">
                    La cola de eventos está vacía.
                  </td>
                </tr>
              ) : (
                eventos.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 text-xs text-slate-500 whitespace-nowrap">
                      {formatFecha(ev.creado_en)}
                    </td>
                    <td className="p-2 font-medium">{ev.tipo}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoBadge(ev.estado)}`}
                      >
                        {ev.estado}
                      </span>
                    </td>
                    <td className="p-2 text-right">{ev.intentos}</td>
                    <td
                      className="p-2 text-xs font-mono text-slate-500"
                      title={ev.uuid_entidad}
                    >
                      {ev.uuid_entidad.slice(0, 8)}…
                    </td>
                    <td className="p-2 text-xs text-red-500 max-w-40 truncate" title={ev.ultimo_error ?? ""}>
                      {ev.ultimo_error ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={cargar} disabled={cargando}>
            {cargando ? "Refrescando..." : "Refrescar"}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
