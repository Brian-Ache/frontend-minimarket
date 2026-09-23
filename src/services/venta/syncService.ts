/**
 * [SQLite] Servicio de sincronización entre backend (MySQL) y SQLite local.
 *
 * Funciones:
 * - syncProductos(): Fetch productos desde el backend → upsert en SQLite
 * - flushColaEventos(): Enviar eventos pendientes al backend en lotes (max 100)
 * - startRetryLoop(): Iniciar loop de reintento automático (cada 15 segundos)
 */
import { getProductos } from "@/services/productoService";
import api from "@/lib/api";
import {
  upsertProductos,
  getEventosPendientes,
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

// [SQLite] Enviar todos los eventos pendientes al backend en lotes de a 100
async function enviarLoteBackend(): Promise<{ enviados: number; fallidos: number }> {
  const LOTE_MAXIMO = 100;
  let enviados = 0;
  let fallidos = 0;

  // [SQLite] Traer todos los eventos pendientes de la cola
  const pendientes = await getEventosPendientes();
  if (pendientes.length === 0) return { enviados: 0, fallidos: 0 };

  // [SQLite] Filtrar los que ya alcanzaron el máximo de intentos (50)
  const listos = pendientes.filter((e) => e.intentos < 50);
  const omitidos = pendientes.length - listos.length;
  if (omitidos > 0) {
    console.warn(`[SQLite] ${omitidos} eventos omitidos (máximo de intentos alcanzado)`);
  }

  // [SQLite] Dividir en chunks de a 100 (límite del backend)
  for (let i = 0; i < listos.length; i += LOTE_MAXIMO) {
    const chunk = listos.slice(i, i + LOTE_MAXIMO);

    // [SQLite] Armar el lote: parsear cada payload serializado
    const loteRequest = {
      dispositivo: chunk[0].dispositivo || "caja-01",
      eventos: chunk.map((e) => JSON.parse(e.payload)),
    };

    try {
      // [SQLite] Enviar al backend — responde 200 con resultado por evento
      const { data } = await api.post("/api/ventas/v1/sync", loteRequest);

      // [SQLite] Procesar cada resultado del backend
      for (const resultado of data.resultados) {
        const uuid = resultado.uuid;
        if (resultado.estado === "OK" || resultado.requiereRevision) {
          await marcarEventoEnviado(uuid);
          enviados++;
        } else if (resultado.reintentable) {
          await marcarEventoError(uuid, resultado.mensaje || "Error reintentable");
          fallidos++;
        } else {
          // Error no reintentable: marcar con error para que quede registrado
          await marcarEventoError(uuid, resultado.mensaje || "Error no reintentable");
          fallidos++;
        }
      }
    } catch (error: any) {
      // [SQLite] Error de red o backend no disponible: marcar todo el chunk como error
      console.error(`[SQLite] Error al enviar lote de ${chunk.length} eventos:`, error);
      for (const evento of chunk) {
        await marcarEventoError(evento.id, error?.message || "Backend no disponible");
        fallidos++;
      }
    }
  }

  return { enviados, fallidos };
}

// [SQLite] Vaciar la cola de eventos pendientes (enviar todos en lote)
export async function flushColaEventos(): Promise<{ enviados: number; fallidos: number }> {
  return enviarLoteBackend();
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
