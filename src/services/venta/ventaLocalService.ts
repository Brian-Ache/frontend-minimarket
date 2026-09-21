/**
 * [SQLite] Servicio de venta local con cola de persistencia.
 *
 * Flujo:
 * 1. Guardar ticket + detalles en SQLite (siempre exitoso, es local)
 * 2. Intentar enviar al backend
 * 3. Si OK → eliminar de la cola
 * 4. Si falla → queda pendiente, reintento automático via syncService
 *
 * Esto garantiza que NUNCA se pierda un ticket aunque se corte la luz
 * o se pierda la conexión con el backend.
 */
import {
  crearTicket,
  eliminarTicket,
  type TicketCola,
  type TicketDetalle,
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

// [SQLite] Cobrar un ticket: guardar local + intentar enviar al backend
export async function cobrarTicket(
  productos: ProductoVenta[],
  idUsuario: string,
  idSesion?: string
): Promise<ResultadoCobro> {
  const ticketId = generarId();
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  // [SQLite] Armar ticket para la cola
  const ticket: TicketCola = {
    id: ticketId,
    id_venta_backend: null,
    id_usuario: idUsuario,
    id_sesion: idSesion ?? null,
    total,
    estado: "PENDIENTE",
    intentos: 0,
    ultimo_error: null,
    creado_en: new Date().toISOString(),
    enviado_en: null,
  };

  // [SQLite] Armar detalles
  const detalles: TicketDetalle[] = productos.map((p) => ({
    id: generarId(),
    id_ticket: ticketId,
    tipo: typeof p.id === "string" && p.id.startsWith("manual-") ? "MANUAL" : "PRODUCTO",
    id_producto: typeof p.id === "string" && p.id.startsWith("manual-") ? null : String(p.id),
    nombre_manual: typeof p.id === "string" && p.id.startsWith("manual-") ? p.nombre : null,
    cantidad: p.cantidad,
    precio_unitario: p.precio,
  }));

  // [SQLite] Guardar en SQLite (siempre exitoso)
  await crearTicket(ticket, detalles);

  // [SQLite] Intentar enviar al backend inmediatamente
  try {
    const detallesRequest = detalles.map((d) => ({
      tipo: d.tipo,
      idProducto: d.id_producto ?? null,
      nombreManual: d.nombre_manual ?? null,
      cantidad: d.cantidad,
      precioUnitario: d.precio_unitario,
    }));

    const { data } = await api.post(
      "/api/ventas/v1",
      {
        detalles: detallesRequest,
        idSesion: idSesion || undefined,
      },
      {
        headers: { idUsuario },
      }
    );

    // [SQLite] Éxito: eliminar de la cola
    await eliminarTicket(ticketId);

    return {
      exito: true,
      ticketId: data.id,
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
