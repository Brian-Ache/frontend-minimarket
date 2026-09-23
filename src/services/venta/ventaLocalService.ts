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
  type EventoCola,
  type DetalleTicketCola,
} from "./sqliteService";

import { uuidV7 } from "@/lib/uuidv7";

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
  const ticketId = uuidV7();
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const ahora = new Date().toISOString();

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
    secuencia: Date.now(),
    ocurridoEn: ahora,
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
    secuencia: Date.now(),
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

  return {
    exito: true,
    ticketId,
    mensaje: "Venta registrada",
  };
}
