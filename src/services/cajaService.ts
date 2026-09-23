import api from "@/lib/api";

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