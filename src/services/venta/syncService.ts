/**
 * [SQLite] Servicio de sincronización entre backend (MySQL) y SQLite local.
 *
 * Funciones:
 * - syncProductos(): Fetch productos desde el backend → upsert en SQLite
 * - flushColaTickets(): Reintentar envío de tickets pendientes al backend
 * - startRetryLoop(): Iniciar loop de reintento automático (cada 15 segundos)
 */
import { getProductos } from "@/services/productoService";
import api from "@/lib/api";
import {
  upsertProductos,
  getTicketsPendientes,
  getTicketDetalle,
  marcarTicketEnviado,
  marcarTicketError,
  type ProductoLocal,
} from "./sqliteService";

// [SQLite] Sincronizar productos desde el backend hacia SQLite
export async function syncProductos(): Promise<{ exito: boolean; cantidad: number; mensaje: string }> {
  try {
    // [SQLite] Fetch productos del backend (traer todos, sin paginación)
    const response = await getProductos({ page: 0, size: 9999 });
    const productos = response.content;

    // [SQLite] Mapear respuesta del backend al formato SQLite
    const productosLocal: ProductoLocal[] = productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      barcode: p.barcode ?? null,
      precio: p.precio,
      costo: p.costo ?? null,
      margen: p.margen ?? null,
      maneja_lotes: p.manejaLotes ? 1 : 0,
      id_categoria: p.categoria?.id ?? null,
      id_proveedor: p.proveedor?.id ?? null,
      deleted_at: null,
    }));

    // [SQLite] Upsert masivo en SQLite
    await upsertProductos(productosLocal);

    return {
      exito: true,
      cantidad: productosLocal.length,
      mensaje: `${productosLocal.length} productos sincronizados`,
    };
  } catch (error: any) {
    console.error("[SQLite] Error al sincronizar productos:", error);
    return {
      exito: false,
      cantidad: 0,
      mensaje: error?.message || "Error de conexión con el backend",
    };
  }
}

// [SQLite] Enviar un ticket pendiente al backend
async function enviarTicketBackend(ticketId: string): Promise<boolean> {
  try {
    const detalles = await getTicketDetalle(ticketId);

    // [SQLite] Mapear detalles al formato del backend
    const detallesRequest = detalles.map((d) => ({
      tipo: d.tipo,
      idProducto: d.id_producto ?? null,
      nombreManual: d.nombre_manual ?? null,
      cantidad: d.cantidad,
      precioUnitario: d.precio_unitario,
    }));

    // [SQLite] Obtener el ticket de la cola para saber el id_usuario y id_sesion
    const { getTicketsPendientes: getTickets } = await import("./sqliteService");
    const ticketsPendientes = await getTickets();
    const ticket = ticketsPendientes.find((t) => t.id === ticketId);

    if (!ticket) return false;

    // [SQLite] Enviar al backend
    const { data } = await api.post(
      "/api/ventas/v1",
      {
        detalles: detallesRequest,
        idSesion: ticket.id_sesion || undefined,
      },
      {
        headers: { idUsuario: ticket.id_usuario },
      }
    );

    // [SQLite] Marcar como enviado en la cola
    await marcarTicketEnviado(ticketId, data.id);
    return true;
  } catch (error: any) {
    console.error(`[SQLite] Error al enviar ticket ${ticketId}:`, error);
    await marcarTicketError(ticketId, error?.message || "Error desconocido");
    return false;
  }
}

// [SQLite] Vaciar la cola de tickets pendientes (reintentar todos)
export async function flushColaTickets(): Promise<{ enviados: number; fallidos: number }> {
  const pendientes = await getTicketsPendientes();
  let enviados = 0;
  let fallidos = 0;

  for (const ticket of pendientes) {
    // [SQLite] Max 50 intentos por ticket
    if (ticket.intentos >= 50) {
      console.warn(`[SQLite] Ticket ${ticket.id} alcanzó el máximo de intentos (50). Se omite.`);
      fallidos++;
      continue;
    }

    const exito = await enviarTicketBackend(ticket.id);
    if (exito) {
      enviados++;
    } else {
      fallidos++;
    }
  }

  return { enviados, fallidos };
}

// [SQLite] Loop de reintento automático (se ejecuta cada 15 segundos)
let retryInterval: ReturnType<typeof setInterval> | null = null;

export function startRetryLoop(): void {
  if (retryInterval) return; // ya está corriendo

  console.log("[SQLite] Iniciando loop de reintento de tickets (cada 15s)");
  retryInterval = setInterval(async () => {
    try {
      const pendientes = await getTicketsPendientes();
      if (pendientes.length > 0) {
        console.log(`[SQLite] Reintentando ${pendientes.length} tickets pendientes...`);
        await flushColaTickets();
      }
    } catch (error) {
      console.error("[SQLite] Error en loop de reintento:", error);
    }
  }, 15000);
}

export function stopRetryLoop(): void {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
    console.log("[SQLite] Loop de reintento detenido");
  }
}
