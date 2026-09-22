/**
 * [SQLite] Servicio de venta local con cola de persistencia.
 *
 * Flujo:
 * 1. Guardar evento CREAR + detalles en SQLite (siempre exitoso, es local)
 * 2. Intentar enviar al backend via POST /api/ventas/v1/sync
 * 3. Si OK → eliminar de la cola
 * 4. Si falla → queda pendiente, reintento automático via syncService
 *
 * Esto garantiza que NUNCA se pierda un ticket aunque se corte la luz
 * o se pierda la conexión con el backend.
 */
import {
  crearEventoCola,
  eliminarEventoCola,
  type EventoCola,
  type DetalleTicketCola,
} from "./sqliteService";
import api from "@/lib/api";

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

// [SQLite] Generar UUID v4 simple
function generarId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// [SQLite] Cobrar un ticket: guardar local + intentar enviar al backend via sync
export async function cobrarTicket(
  productos: ProductoVenta[],
  idUsuario: string,
  idSesion?: string,
  metodoPago: string = "EFECTIVO"
): Promise<ResultadoCobro> {
  const ticketId = generarId();
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const ahora = new Date().toISOString();

  // [SQLite] Armar detalles para la cola
  const detalles: DetalleTicketCola[] = productos.map((p) => ({
    id: generarId(),
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
    montoRecibido: metodoPago === "EFECTIVO" ? total : null,
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

  // [SQLite] Guardar en SQLite (siempre exitoso)
  await crearEventoCola(evento, detalles);

  // [SQLite] Intentar enviar al backend inmediatamente
  try {
    const loteRequest = {
      dispositivo: "caja-01",
      eventos: [JSON.parse(payload)],
    };

    await api.post("/api/ventas/v1/sync", loteRequest);

    // [SQLite] Éxito: eliminar de la cola
    await eliminarEventoCola(ticketId);

    return {
      exito: true,
      ticketId,
      mensaje: "Venta registrada exitosamente",
    };
  } catch (error: any) {
    // [SQLite] Falló: queda pendiente en la cola, reintento automático
    console.warn("[SQLite] Backend no disponible, ticket guardado en cola local:", ticketId);
    return {
      exito: false,
      ticketId,
      mensaje: "Venta guardada localmente. Se enviará cuando el backend esté disponible.",
    };
  }
}
