/**
 * [SQLite] Servicio de venta local con cola de persistencia.
 *
 * Flujo:
 * 1. Guardar evento CREAR + detalles en SQLite (siempre exitoso, es local)
 * 2. La cola de eventos se envía al backend en lotes via syncService
 *
 * Esto garantiza que NUNCA se pierda un ticket aunque se corte la luz
 * o se pierda la conexión con el backend.
 */
import {
  crearEventoCola,
  crearTicketLocal,
  getSesionLocalActiva,
  marcarTicketLocalAnulado,
  type EventoCola,
  type DetalleTicketCola,
} from "./sqliteService";
import { flushColaEventos } from "./syncService";

import { uuidV7 } from "@/lib/uuidv7";
import { nextSecuencia } from "@/lib/sequence";

export interface ProductoVenta {
  id: number | string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface ResultadoCobro {
  exito: boolean;
  ticketId: string;
  mensaje: string;
}

// [SQLite] Cobrar un ticket: guardar local + intentar enviar al backend via sync
export async function cobrarTicket(
  productos: ProductoVenta[],
  idUsuario: string,
  idSesion?: string,
  metodoPago: string = "EFECTIVO"
): Promise<ResultadoCobro> {
  if (!idSesion) {
    return {
      exito: false,
      ticketId: "",
      mensaje: "No hay una sesión de caja abierta. Debés abrir la caja antes de vender."
    };
  }

  try {
    const sesionLocal = await getSesionLocalActiva();
    if (!sesionLocal || sesionLocal.id !== idSesion) {
      return {
        exito: false,
        ticketId: "",
        mensaje: "La caja se cerró. Abrí la caja nuevamente antes de vender."
      };
    }
  } catch (error) {
    console.error("[SQLite] No se pudo verificar la sesión local:", error);
    return {
      exito: false,
      ticketId: "",
      mensaje: "No se pudo verificar la caja local. Intentá nuevamente."
    };
  }

  const ticketId = uuidV7();
  const secuencia = nextSecuencia();
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const ahora = new Date().toISOString();

  const fecha = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ahoraLocal =
    `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T` +
    `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;

  // [SQLite] Armar detalles para la cola
  const detalles: DetalleTicketCola[] = productos.map((p) => ({
    id: uuidV7(),
    id_evento: ticketId,
    tipo: typeof p.id === "string" && p.id.startsWith("manual-") ? "MANUAL" : "PRODUCTO",
    id_producto: typeof p.id === "string" && p.id.startsWith("manual-") ? null : String(p.id),
    nombre_manual: typeof p.id === "string" && p.id.startsWith("manual-") ? p.nombre : null,
    cantidad: p.cantidad,
    precio_unitario: p.precio,
  }));

  // [SQLite] Armar payload del evento CREAR para el backend
  const payload = JSON.stringify({
    uuid: ticketId,
    tipo: "CREAR",
    secuencia,
    ocurridoEn: ahoraLocal,
    idVendedor: idUsuario,
    idSesion: idSesion || null,
    total,
    metodoPago,
    montoRecibido: total,
    detalles: detalles.map((d) => ({
      tipo: d.tipo,
      idProducto: d.id_producto,
      nombreManual: d.nombre_manual,
      cantidad: d.cantidad,
      precioUnitario: d.precio_unitario,
    })),
  });

  // [SQLite] Armar evento para la cola
  const evento: EventoCola = {
    id: ticketId,
    tipo: "CREAR",
    uuid_entidad: ticketId,
    secuencia,
    ocurrido_en: ahora,
    payload,
    estado: "PENDIENTE",
    intentos: 0,
    ultimo_error: null,
    dispositivo: "caja-01",
    creado_en: ahora,
    enviado_en: null,
  };

  // [SQLite] Guardar en SQLite (siempre exitoso, es local)
  await crearEventoCola(evento, detalles);

  // [SQLite] Historial del día: mismo UUID que el evento, para que cuando el
  // sync lo acepte se pueda marcar como sincronizado acá. Es lo que lee el
  // modal de Ventas del Día.
  await crearTicketLocal(
    {
      id: ticketId,
      id_venta_backend: null,
      id_usuario: idUsuario,
      id_sesion: idSesion,
      total,
      estado: "PENDIENTE",
      intentos: 0,
      ultimo_error: null,
      creado_en: ahora,
      enviado_en: null,
    },
    detalles.map((d) => ({
      id: d.id,
      id_ticket: d.id_evento,
      tipo: d.tipo,
      id_producto: d.id_producto,
      nombre_manual: d.nombre_manual,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
    }))
  );

  return {
    exito: true,
    ticketId,
    mensaje: "Venta registrada",
  };
}

// [SQLite] Anular un ticket: siempre se encola el evento ANULAR, aunque el
// ticket ya esté sincronizado. El backend decide si el permiso alcanza.
export async function anularTicket(
  ticketId: string,
  idUsuario: string,
  motivo?: string
): Promise<void> {
  const secuencia = nextSecuencia();
  const ahora = new Date().toISOString();

  const fecha = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ahoraLocal =
    `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T` +
    `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;

  const eventoId = uuidV7();
  const payload = JSON.stringify({
    uuid: ticketId,
    tipo: "ANULAR",
    secuencia,
    ocurridoEn: ahoraLocal,
    idUsuario,
    motivo: motivo ?? null,
  });

  const evento: EventoCola = {
    id: eventoId,
    tipo: "ANULAR",
    uuid_entidad: ticketId,
    secuencia,
    ocurrido_en: ahora,
    payload,
    estado: "PENDIENTE",
    intentos: 0,
    ultimo_error: null,
    dispositivo: "caja-01",
    creado_en: ahora,
    enviado_en: null,
  };

  await crearEventoCola(evento);
  await marcarTicketLocalAnulado(ticketId);

  if (typeof navigator === "undefined" || navigator.onLine) {
    try {
      await flushColaEventos();
    } catch (error) {
      console.warn("[SQLite] No se pudo enviar la anulación todavía:", error);
    }
  }
}
