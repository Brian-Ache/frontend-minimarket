/**
 * [SQLite] Servicio de base de datos local SQLite para el módulo Venta.
 *
 * Inicializa las tablas necesarias y provee funciones CRUD para:
 * - Productos (catálogo local sincronizado desde el backend)
 * - Eventos de la cola (eventos offline pendientes de sync: CREAR, ANULAR, ABRIR_SESION, CERRAR_SESION)
 * - Detalle de eventos CREAR (items de cada venta)
 * - Tickets locales (historial de ventas del día)
 *
 * Usa tauri-plugin-sql con SQLite.
 */
// [SQLite] Importar plugin SQL de Tauri (bindings npm)
import Database from "@tauri-apps/plugin-sql";

// [SQLite] Formato correcto: sqlite:nombre.db
const DB_NAME = "sqlite:minimarket.db";

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
    );
  `)
    
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

//trae los tickets de un dia
export async function getTicketsDia():
Promise<TicketLocal[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<TicketLocal[]>(
    "SELECT * FROM tickets_local"
  )
  await db.close();
  return rows;
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

// [SQLite] Marcar evento con error (intento fallido)
export async function marcarEventoError(id: string, error: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE evento_cola SET intentos = intentos + 1, ultimo_error = ? WHERE id = ?`,
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
