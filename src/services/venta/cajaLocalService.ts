import type { SesionActiva } from "@/services/cajaService";
import { uuidV7 } from "@/lib/uuidv7";
import { nextSecuencia } from "@/lib/sequence";
import {
  crearEventoCola,
  getSesionLocalActiva,
  guardarSesionLocal,
  marcarSesionLocalCerrada,
  type EventoCola,
  type SesionLocalRow,
} from "./sqliteService";

export type OrigenSesion = "ONLINE" | "OFFLINE";

export interface SesionLocal extends SesionActiva {
  origen: OrigenSesion;
}

// Fecha local naive: el backend usa LocalDateTime y el ticket ya se encola así.
// Evita que un ISO con "Z" corra el turno varias horas.
function fechaLocalNaive(fecha = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T` +
    `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`
  );
}

function mapSesionLocal(row: SesionLocalRow): SesionLocal {
  return {
    id: row.id,
    fechaApertura: row.fecha_apertura,
    saldoInicial: row.saldo_inicial,
    estado: row.estado,
    idUsuarioApertura: row.id_usuario_apertura,
    diferenciaApertura: row.diferencia_apertura,
    origen: row.origen === "ONLINE" ? "ONLINE" : "OFFLINE",
  };
}

function filaSesion(sesion: SesionLocal, ahora: string): SesionLocalRow {
  return {
    id: sesion.id,
    fecha_apertura: sesion.fechaApertura,
    saldo_inicial: sesion.saldoInicial,
    estado: sesion.estado,
    id_usuario_apertura: sesion.idUsuarioApertura,
    diferencia_apertura: sesion.diferenciaApertura,
    origen: sesion.origen,
    creado_en: ahora,
    actualizado_en: ahora,
  };
}

function eventoBase(
  tipo: "ABRIR_SESION" | "CERRAR_SESION",
  uuidEntidad: string,
  ocurridoEn: string,
  payload: Record<string, unknown>
): EventoCola {
  const ahora = new Date().toISOString();
  return {
    id: uuidV7(),
    tipo,
    uuid_entidad: uuidEntidad,
    secuencia: nextSecuencia(),
    ocurrido_en: ahora,
    payload: JSON.stringify({ uuid: uuidEntidad, tipo, ocurridoEn, ...payload }),
    estado: "PENDIENTE",
    intentos: 0,
    ultimo_error: null,
    dispositivo: "caja-01",
    creado_en: ahora,
    enviado_en: null,
  };
}

// [Offline] La sesión local que ya estaba abierta (si hay)
export async function getSesionLocal(): Promise<SesionLocal | null> {
  const row = await getSesionLocalActiva();
  return row ? mapSesionLocal(row) : null;
}

// [Online] Cachear la sesión del backend para poder seguir vendiendo si se
// corta internet o se reinicia la app. Su UUID es el mismo que el remoto.
export async function cachearSesionRemota(sesion: SesionActiva): Promise<SesionLocal> {
  const local: SesionLocal = { ...sesion, origen: "ONLINE" };
  await guardarSesionLocal(filaSesion(local, new Date().toISOString()));
  return local;
}

// [Offline] Abrir turno con UUIDv7 propio y encolar ABRIR_SESION.
// El backend lo crea con la misma fecha y el mismo id al reconectar.
export async function abrirSesionLocal(
  saldoInicial: number,
  idUsuario: string
): Promise<SesionLocal> {
  const activa = await getSesionLocal();
  if (activa) {
    throw new Error("Ya hay una caja abierta localmente. Debés cerrarla primero.");
  }

  const id = uuidV7();
  const fechaApertura = fechaLocalNaive();
  const ahora = new Date().toISOString();

  const sesion: SesionLocal = {
    id,
    fechaApertura,
    saldoInicial,
    estado: "ABIERTA",
    idUsuarioApertura: idUsuario,
    diferenciaApertura: null,
    origen: "OFFLINE",
  };

  await guardarSesionLocal(filaSesion(sesion, ahora));
  await crearEventoCola(
    eventoBase("ABRIR_SESION", id, fechaApertura, {
      idUsuario,
      saldoInicial,
    })
  );

  return sesion;
}

// [Offline] Cerrar turno localmente y encolar CERRAR_SESION.
// El evento se procesa después de la apertura y de los tickets por fecha+secuencia.
export async function cerrarSesionLocal(
  sesion: SesionLocal,
  saldoReal: number,
  montoRetirado: number,
  observaciones: string | undefined,
  idUsuario: string
): Promise<void> {
  const ocurridoEn = fechaLocalNaive();

  await crearEventoCola(
    eventoBase("CERRAR_SESION", sesion.id, ocurridoEn, {
      idUsuario,
      saldoFinal: saldoReal,
      montoRetirado,
      observaciones,
    })
  );

  await marcarSesionLocalCerrada(sesion.id);
}
