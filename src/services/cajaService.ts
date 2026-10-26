import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/response/paginatedResponse";

export interface SesionActiva {
  id: string;
  fechaApertura: string;
  saldoInicial: number;
  estado: string;
  idUsuarioApertura: string;
  diferenciaApertura: number | null;
}

export async function getSesionActiva(): Promise<SesionActiva> {
  const { data } = await api.get<SesionActiva>("/api/caja/v1/sesion-activa");
  return data;
}

export async function abrirSesion(saldoInicial: number): Promise<SesionActiva> {
  const { data } = await api.post<SesionActiva>("/api/caja/v1/abrir", { saldoInicial });
  return data;
}

export async function cerrarSesion(
  saldoReal: number,
  montoRetirado: number,
  observaciones?: string
): Promise<any> {
  const { data } = await api.post("/api/caja/v1/corte", { saldoReal, montoRetirado, observaciones });
  return data;
}

export interface MovimientoCaja {
  id: string;
  idSesion: string;
  tipo: "ENTRADA" | "SALIDA";
  monto: number;
  motivo: string | null;
  origen: "MANUAL" | "VENTA" | "COMPRA" | "REVERSA" | "RETIRO";
  idReferencia: string | null;
  fecha: string;
}

export async function getMovimientos(page = 0, size = 100): Promise<MovimientoCaja[]> {
  const { data } = await api.get<PaginatedResponse<MovimientoCaja>>(
    "/api/caja/v1/movimientos",
    { params: { page, size } }
  );
  return data.content;
}

export async function registrarEntrada(monto: number, motivo: string): Promise<MovimientoCaja> {
  const { data } = await api.post<MovimientoCaja>("/api/caja/v1/entradas", { monto, motivo });
  return data;
}

export async function registrarSalida(monto: number, motivo: string): Promise<MovimientoCaja> {
  const { data } = await api.post<MovimientoCaja>("/api/caja/v1/salidas", { monto, motivo });
  return data;
}

/** Desglose de caja. Los totales pueden venir null en cortes cerrados antes del desglose. */
export interface ResumenCaja {
  fecha: string;
  saldoInicial: number;
  totalVentas: number | null;
  cantidadVentas: number | null;
  totalCompras: number | null;
  cantidadCompras: number | null;
  totalEntradasManuales: number | null;
  totalSalidasManuales: number | null;
  saldoEsperado: number;
}

/** Resumen de un día cualquiera, aunque no haya caja abierta. fecha: YYYY-MM-DD local. */
export async function getResumenDiario(fecha: string): Promise<ResumenCaja> {
  const { data } = await api.get<ResumenCaja>("/api/caja/v1/resumen/diario", {
    params: { fecha },
  });
  return data;
}

/** Movimientos en un rango (ISO naive local, sin Z). Sin rango el backend usa el turno abierto. */
export async function getMovimientosPorRango(
  desde: string,
  hasta: string,
  page = 0,
  size = 100
): Promise<MovimientoCaja[]> {
  const { data } = await api.get<PaginatedResponse<MovimientoCaja>>(
    "/api/caja/v1/movimientos",
    { params: { desde, hasta, page, size } }
  );
  return data.content;
}