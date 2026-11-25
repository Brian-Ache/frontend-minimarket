/**
 * [SQLite] Servicio de base de datos local SQLite para el módulo Venta.
 *
 * Inicializa las tablas necesarias y provee funciones CRUD para:
 * - Productos (catálogo local sincronizado desde el backend)
 * - Eventos de la cola (eventos offline pendientes de sync: CREAR, ANULAR, ABRIR_SESION, CERRAR_SESION)
 * - Detalle de eventos CREAR (items de cada venta)
 * - Tickets locales (historial de ventas del día)
 * - Sesión de caja local (apertura/cierre offline)
 *
 * Usa tauri-plugin-sql con SQLite.
 */
// [SQLite] Importar plugin SQL de Tauri (bindings npm)
import Database from "@tauri-apps/plugin-sql";

// [SQLite] Formato correcto: sqlite:nombre.db
const DB_NAME = "sqlite:minimarket.db";

// [SQLite] La inicialización corre en un efecto de App; los contextos hijos
// pueden consultar antes de que terminen las tablas. Este evento avisa cuándo
// están listas para reintentar (por ejemplo, cargar la sesión local).
export const SQLITE_READY_EVENT = "sqlite:ready";

// [SQLite] Inicializar la base de datos y crear tablas
export async function initDatabase(): Promise<void> {
  const db = await Database.load(DB_NAME);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      barcode TEXT,
      precio REAL NOT NULL,
      costo REAL,
      margen REAL,
      maneja_lotes INTEGER DEFAULT 0,
      id_categoria TEXT,
      id_proveedor TEXT,
      deleted_at TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS evento_cola (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,              -- CREAR | ANULAR | ABRIR_SESION | CERRAR_SESION
      uuid_entidad TEXT NOT NULL,      -- UUIDv7 del ticket o turno
      secuencia INTEGER NOT NULL,
      ocurrido_en TEXT NOT NULL,
      payload TEXT NOT NULL,           -- JSON completo del evento
      estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE | ENVIADO | ERROR
      intentos INTEGER DEFAULT 0,
      ultimo_error TEXT,
      dispositivo TEXT,
      creado_en TEXT NOT NULL,
      enviado_en TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS detalle_tickets_cola (
      id TEXT PRIMARY KEY,
      id_evento TEXT NOT NULL,
      tipo TEXT DEFAULT 'PRODUCTO',
      id_producto TEXT,
      nombre_manual TEXT,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      FOREIGN KEY (id_evento) REFERENCES evento_cola(id)
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tickets_local (
      id TEXT PRIMARY KEY,
      id_venta_backend TEXT,
      id_usuario TEXT NOT NULL,
      id_sesion TEXT,
      total REAL NOT NULL,
      estado TEXT DEFAULT 'PENDIENTE',
      intentos INTEGER DEFAULT 0,
      ultimo_error TEXT,
      creado_en TEXT NOT NULL,
      enviado_en TEXT
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tickets_local_detalle (
      id TEXT PRIMARY KEY,
      id_ticket TEXT NOT NULL,
      tipo TEXT DEFAULT 'PRODUCTO',
      id_producto TEXT,
      nombre_manual TEXT,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      FOREIGN KEY (id_ticket) REFERENCES tickets_local(id)
    )
  `)

  // [Offline] Turno de caja abierto sin conexión. Una sola fila ABIERTA a la vez:
  // es el espejo local de la sesión del backend, con el mismo UUID para que
  // ABRIR_SESION/CERRAR_SESION sean idempotentes al sincronizar.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sesion_local (
      id TEXT PRIMARY KEY,
      fecha_apertura TEXT NOT NULL,
      saldo_inicial REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'ABIERTA',
      id_usuario_apertura TEXT NOT NULL,
      diferencia_apertura REAL,
      origen TEXT NOT NULL DEFAULT 'OFFLINE',
      creado_en TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    )
  `);

  // [SQLite] Retención: el historial de ventas locales vive 7 días.
  // Se limpia al arrancar, antes de que nadie lea la tabla.
  //
  // [Offline] Los eventos PENDIENTE que llegaron al tope de intentos por
  // fallos de red (versiones anteriores incrementaban en cada reintento)
  // vuelven a habilitarse. El sync es idempotente por tipo + uuid.
  await db.execute(
    "UPDATE evento_cola SET intentos = 0 WHERE estado = 'PENDIENTE' AND intentos >= 50"
  );

  const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const viejos = await db.select<{ id: string; creado_en: string }[]>(
    "SELECT id, creado_en FROM tickets_local"
  );
  for (const t of viejos) {
    if (new Date(t.creado_en).getTime() < limite) {
      await db.execute("DELETE FROM tickets_local_detalle WHERE id_ticket = ?", [t.id]);
      await db.execute("DELETE FROM tickets_local WHERE id = ?", [t.id]);
    }
  }

  await db.close();
}

// ============================================================
// PRODUCTOS
// ============================================================

export interface ProductoLocal {
  id: string;
  nombre: string;
  barcode: string | null;
  precio: number;
  costo: number | null;
  margen: number | null;
  maneja_lotes: number;
  id_categoria: string | null;
  id_proveedor: string | null;
  deleted_at: string | null;
}

// [SQLite] Obtener todos los productos activos
export async function getProductos(): Promise<ProductoLocal[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<ProductoLocal[]>(
    "SELECT * FROM productos WHERE deleted_at IS NULL ORDER BY nombre"
  );
  await db.close();
  return rows;
}

//[QSLite] Buscar producto por su id 
export async function getProductoById(id: string): Promise<ProductoLocal | null>{
  const db = await Database.load(DB_NAME);
  const rows = await db.select<ProductoLocal[]>(
    "SELECT * FROM productos WHERE id = ? LIMIT 1", [id]
  );
  await db.close();
  return rows[0] ?? null;
}

// [SQLite] Buscar producto por código de barras
export async function getProductoByBarcode(barcode: string): Promise<ProductoLocal | null> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<ProductoLocal[]>(
    "SELECT * FROM productos WHERE barcode = ? AND deleted_at IS NULL",
    [barcode]
  );
  await db.close();
  return rows.length > 0 ? rows[0] : null;
}

// [SQLite] Buscar productos por nombre (parcial, case-insensitive)
export async function searchProductos(query: string): Promise<ProductoLocal[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<ProductoLocal[]>(
    "SELECT * FROM productos WHERE deleted_at IS NULL AND nombre LIKE ? ORDER BY nombre",
    [`%${query}%`]
  );
  await db.close();
  return rows;
}

// [SQLite] Upsert masivo de productos (para sincronización)
export async function upsertProductos(productos: ProductoLocal[]): Promise<void> {
  const db = await Database.load(DB_NAME);

  // [SQLite] Limpiar productos existentes antes de insertar nuevos
  await db.execute("DELETE FROM productos");

  for (const p of productos) {
    await db.execute(
      `INSERT INTO productos (id, nombre, barcode, precio, costo, margen, maneja_lotes, id_categoria, id_proveedor, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.nombre, p.barcode, p.precio, p.costo, p.margen, p.maneja_lotes, p.id_categoria, p.id_proveedor, p.deleted_at]
    );
  }

  await db.close();
}

export interface TicketLocal {
  id: string;
  id_venta_backend: string | null;
  id_usuario: string;
  id_sesion: string | null;
  total: number;
  estado: string;
  intentos: number;
  ultimo_error: string | null;
  creado_en: string;
  enviado_en: string | null;
}

// ============================================================
// SESIÓN DE CAJA LOCAL (apertura/cierre offline)
// ============================================================
export interface SesionLocalRow {
  id: string;
  fecha_apertura: string;
  saldo_inicial: number;
  estado: string;
  id_usuario_apertura: string;
  diferencia_apertura: number | null;
  origen: string;
  creado_en: string;
  actualizado_en: string;
}

// [SQLite] Guardar la sesión local. Cierra cualquier otra ABIERTA: la caja
// física es una sola. El UUID se conserva para que el sync sea idempotente.
export async function guardarSesionLocal(sesion: SesionLocalRow): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE sesion_local
        SET estado = 'CERRADA', actualizado_en = ?
      WHERE estado = 'ABIERTA' AND id <> ?`,
    [sesion.actualizado_en, sesion.id]
  );
  await db.execute(
    `INSERT OR REPLACE INTO sesion_local
       (id, fecha_apertura, saldo_inicial, estado, id_usuario_apertura,
        diferencia_apertura, origen, creado_en, actualizado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sesion.id,
      sesion.fecha_apertura,
      sesion.saldo_inicial,
      sesion.estado,
      sesion.id_usuario_apertura,
      sesion.diferencia_apertura,
      sesion.origen,
      sesion.creado_en,
      sesion.actualizado_en,
    ]
  );
  await db.close();
}

// [SQLite] Turno abierto localmente (si existe)
export async function getSesionLocalActiva(): Promise<SesionLocalRow | null> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<SesionLocalRow[]>(
    "SELECT * FROM sesion_local WHERE estado = 'ABIERTA' ORDER BY fecha_apertura DESC LIMIT 1"
  );
  await db.close();
  return rows[0] ?? null;
}

// [SQLite] Cerrar el turno local (no borra: deja historial y auditoría)
export async function marcarSesionLocalCerrada(id: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    "UPDATE sesion_local SET estado = 'CERRADA', actualizado_en = ? WHERE id = ?",
    [new Date().toISOString(), id]
  );
  await db.close();
}

// [SQLite] ¿Ese turno tiene algo sin sincronizar? Sirve para decidir si al
// reconectar conviene conservar la sesión local o adoptar la del backend.
export async function tieneEventosPendientesDeSesion(idSesion: string): Promise<boolean> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<{ total: number }[]>(
    `SELECT
       (SELECT COUNT(*) FROM evento_cola
         WHERE estado = 'PENDIENTE'
           AND (uuid_entidad = ? OR payload LIKE ?))
       +
       (SELECT COUNT(*) FROM tickets_local
         WHERE estado = 'PENDIENTE' AND id_sesion = ?) AS total`,
    [idSesion, `%"idSesion":"${idSesion}"%`, idSesion]
  );
  await db.close();
  return Number(rows[0]?.total ?? 0) > 0;
}

// ============================================================
// COLA DE EVENTOS (tickets, apertura/cierre de caja, anulaciones)
// ============================================================
export interface EventoCola {
  id: string;
  tipo: string;                    // CREAR | ANULAR | ABRIR_SESION | CERRAR_SESION
  uuid_entidad: string;            // UUIDv7 del ticket o turno
  secuencia: number;
  ocurrido_en: string;             // ISO datetime
  payload: string;                 // JSON completo del evento
  estado: string;                  // PENDIENTE | ENVIADO | ERROR
  intentos: number;
  ultimo_error: string | null;
  dispositivo: string | null;
  creado_en: string;               // ISO datetime
  enviado_en: string | null;       // ISO datetime
}

export interface DetalleTicketCola {
  id: string;
  id_evento: string;               // FK a evento_cola.id
  tipo: string;                    // PRODUCTO | MANUAL
  id_producto: string | null;
  nombre_manual: string | null;
  cantidad: number;
  precio_unitario: number;
}

export interface TicketDetalleLocal {
  id: string;
  id_ticket: string;
  tipo: string;
  id_producto: string | null;
  nombre_manual: string | null;
  cantidad: number;
  precio_unitario: number;
}

// [SQLite] Crear evento en la cola (siempre exitoso, es local)
export async function crearEventoCola(evento: EventoCola, detalles?: DetalleTicketCola[]): Promise<void> {
  const db = await Database.load(DB_NAME);

  await db.execute(
    `INSERT INTO evento_cola (id, tipo, uuid_entidad, secuencia, ocurrido_en, payload, estado, intentos, ultimo_error, dispositivo, creado_en, enviado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [evento.id, evento.tipo, evento.uuid_entidad, evento.secuencia, evento.ocurrido_en, evento.payload, evento.estado, evento.intentos, evento.ultimo_error, evento.dispositivo, evento.creado_en, evento.enviado_en]
  );

  if (detalles && detalles.length > 0) {
    for (const d of detalles) {
      await db.execute(
        `INSERT INTO detalle_tickets_cola (id, id_evento, tipo, id_producto, nombre_manual, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.id_evento, d.tipo, d.id_producto, d.nombre_manual, d.cantidad, d.precio_unitario]
      );
    }
  }

  await db.close();
}

//trae los tickets de un dia (el dia local de la caja, no el UTC)
export async function getTicketsDia():
Promise<TicketLocal[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<TicketLocal[]>(
    "SELECT * FROM tickets_local ORDER BY creado_en DESC"
  )
  await db.close();
  const hoy = new Date().toDateString();
  return rows.filter((t) => new Date(t.creado_en).toDateString() === hoy);
}

// [SQLite] Historial de la venta del dia: se escribe al cobrar, con el mismo
// UUID que el evento de la cola, y se marca ENVIADO cuando el sync la acepta.
export async function crearTicketLocal(ticket: TicketLocal, detalles: TicketDetalleLocal[]): Promise<void> {
  const db = await Database.load(DB_NAME);

  await db.execute(
    `INSERT INTO tickets_local (id, id_venta_backend, id_usuario, id_sesion, total, estado, intentos, ultimo_error, creado_en, enviado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticket.id, ticket.id_venta_backend, ticket.id_usuario, ticket.id_sesion, ticket.total, ticket.estado, ticket.intentos, ticket.ultimo_error, ticket.creado_en, ticket.enviado_en]
  );

  for (const d of detalles) {
    await db.execute(
      `INSERT INTO tickets_local_detalle (id, id_ticket, tipo, id_producto, nombre_manual, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.id_ticket, d.tipo, d.id_producto, d.nombre_manual, d.cantidad, d.precio_unitario]
    );
  }

  await db.close();
}

// [SQLite] El backend aceptó el evento: la venta del día queda sincronizada
export async function marcarTicketLocalSincronizado(id: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE tickets_local SET estado = 'ENVIADO', enviado_en = datetime('now') WHERE id = ?`,
    [id]
  );
  await db.close();
}

//trae los detalles de un ticket del dia por su id
export async function getTicketDetalleLocal(idTicket: string): Promise<TicketDetalleLocal[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<TicketDetalleLocal[]>(
    "SELECT * FROM tickets_local_detalle WHERE id_ticket = ? ORDER BY id",
    [idTicket]
  );
  await db.close();
  return rows;
}

 
// [SQLite] Obtener eventos pendientes de envío
export async function getEventosPendientes(): Promise<EventoCola[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<EventoCola[]>(
    "SELECT * FROM evento_cola WHERE estado = 'PENDIENTE' ORDER BY creado_en"
  );
  await db.close();
  return rows;
}

// [SQLite] Obtener todos los eventos de la cola (todos los estados) — debug/lectura
export async function getEventosCola(): Promise<EventoCola[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<EventoCola[]>(
    "SELECT * FROM evento_cola ORDER BY creado_en DESC"
  );
  await db.close();
  return rows;
}

// [SQLite] Obtener detalle de un evento de la cola
export async function getDetalleEventoCola(idEvento: string): Promise<DetalleTicketCola[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<DetalleTicketCola[]>(
    "SELECT * FROM detalle_tickets_cola WHERE id_evento = ?",
    [idEvento]
  );
  await db.close();
  return rows;
}

// [SQLite] Marcar evento como enviado (éxito del backend)
export async function marcarEventoEnviado(id: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE evento_cola SET estado = 'ENVIADO', enviado_en = datetime('now') WHERE id = ?`,
    [id]
  );
  await db.close();
}

// [SQLite] Marcar evento con error (intento fallido, se reintenta)
export async function marcarEventoError(id: string, error: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE evento_cola SET intentos = intentos + 1, ultimo_error = ? WHERE id = ?`,
    [error, id]
  );
  await db.close();
}

// [SQLite] Error transitorio (sin red, backend caído, 401, 5xx): se registra
// el motivo pero NO se gasta un intento. Así una semana offline no agota los
// 50 intentos y los eventos siguen pendientes al reconectar.
export async function marcarEventoErrorTransitorio(id: string, error: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    "UPDATE evento_cola SET ultimo_error = ? WHERE id = ?",
    [error, id]
  );
  await db.close();
}

// [SQLite] Error definitivo: el backend dijo que reintentar no cambia nada.
// El evento sale de la cola (estado ERROR) y la venta del día queda marcada
// para que alguien la mire, en vez de reintentar cada 15 segundos para siempre.
export async function marcarEventoFalloDefinitivo(id: string, error: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE evento_cola SET estado = 'ERROR', intentos = intentos + 1, ultimo_error = ? WHERE id = ?`,
    [error, id]
  );
  await db.execute(
    `UPDATE tickets_local SET estado = 'ERROR', intentos = intentos + 1, ultimo_error = ? WHERE id = ?`,
    [error, id]
  );
  await db.close();
}

// [SQLite] Eliminar evento de la cola (después de enviado o si se cancela)
export async function eliminarEventoCola(id: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute("DELETE FROM detalle_tickets_cola WHERE id_evento = ?", [id]);
  await db.execute("DELETE FROM evento_cola WHERE id = ?", [id]);
  await db.close();
}
