/**
 * [SQLite] Servicio de sincronización entre backend (MySQL) y SQLite local.
 *
 * Funciones:
 * - syncProductos(): Fetch productos desde el backend → upsert en SQLite
 * - flushColaEventos(): Reintentar envío de eventos pendientes al backend
 * - startRetryLoop(): Iniciar loop de reintento automático (cada 15 segundos)
 */
import { getProductos } from "@/services/productoService";
import api from "@/lib/api";
import {
  upsertProductos,
  getEventosPendientes,
  getDetalleEventoCola,
  marcarEventoEnviado,
  marcarEventoError,
  type ProductoLocal,
} from "./sqliteService";

// [SQLite] Sincronizar productos desde el backend hacia SQLite (paginado, 100 por página)
export async function syncProductos(): Promise<{ exito: boolean; cantidad: number; mensaje: string }> {
  // Cantidad máxima de productos que el backend acepta por request
  const PAGE_SIZE = 100;

  // Acá voy a acumular TODOS los productos mapeados al formato SQLite
  const productosLocal: ProductoLocal[] = [];

  try {
    // Página actual que estoy pidiendo (empieza en 0)
    let page = 0;

    // Total real de productos que hay en el backend (lo dice el primer response)
    let totalElements = 0;

    // Cuántos productos ya traje (para saber cuándo parar)
    let fetched = 0;

    // Loop: pide páginas hasta traer todos los productos
    do {
      // Pedir una página de productos al backend (ej: página 0, 100 productos)
      const response = await getProductos({ page, size: PAGE_SIZE });

      // Guardar cuántos productos hay en total (el backend lo dice en el primer response)
      totalElements = response.totalElements;

      // Mapear cada producto del formato del backend al formato SQLite
      const productos = response.content.map((p) => ({
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

      // Agregar los productos de esta página al array acumulador
      productosLocal.push(...productos);

      // Sumar cuántos productos ya traje en total
      fetched += response.content.length;

      // Ir a la siguiente página
      page++;
    } while (fetched < totalElements); // Seguir mientras queden productos por traer

    // Cuando ya tengo todos, hacer upsert masivo en SQLite (crea o actualiza)
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

// [SQLite] Enviar un evento pendiente al backend via POST /api/ventas/v1/sync
async function enviarEventoBackend(eventoId: string): Promise<boolean> {
  try {
    const eventos = await getEventosPendientes();
    const evento = eventos.find((e) => e.id === eventoId);

    if (!evento) return false;

    // [SQLite] Armar el lote con el evento completo (el payload ya tiene todo serializado)
    const loteRequest = {
      dispositivo: evento.dispositivo || "caja-01",
      eventos: [JSON.parse(evento.payload)],
    };

    // [SQLite] Enviar al backend
    await api.post("/api/ventas/v1/sync", loteRequest);

    // [SQLite] Marcar como enviado en la cola
    await marcarEventoEnviado(eventoId);
    return true;
  } catch (error: any) {
    console.error(`[SQLite] Error al enviar evento ${eventoId}:`, error);
    await marcarEventoError(eventoId, error?.message || "Error desconocido");
    return false;
  }
}

// [SQLite] Vaciar la cola de eventos pendientes (reintentar todos)
export async function flushColaEventos(): Promise<{ enviados: number; fallidos: number }> {
  const pendientes = await getEventosPendientes();
  let enviados = 0;
  let fallidos = 0;

  for (const evento of pendientes) {
    // [SQLite] Max 50 intentos por evento
    if (evento.intentos >= 50) {
      console.warn(`[SQLite] Evento ${evento.id} alcanzó el máximo de intentos (50). Se omite.`);
      fallidos++;
      continue;
    }

    const exito = await enviarEventoBackend(evento.id);
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

  console.log("[SQLite] Iniciando loop de reintento de eventos (cada 15s)");
  retryInterval = setInterval(async () => {
    try {
      const pendientes = await getEventosPendientes();
      if (pendientes.length > 0) {
        console.log(`[SQLite] Reintentando ${pendientes.length} eventos pendientes...`);
        await flushColaEventos();
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
