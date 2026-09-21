/**
 * [SQLite] Servicio de base de datos local SQLite para el módulo Venta.
 *
 * Inicializa las tablas necesarias y provee funciones CRUD para:
 * - Productos (catálogo local sincronizado desde el backend)
 * - Cola de tickets (ventas pendientes de enviar al backend)
 * - Detalle de tickets (items de cada venta)
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
    CREATE TABLE IF NOT EXISTS tickets_cola (
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
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tickets_detalle (
      id TEXT PRIMARY KEY,
      id_ticket TEXT NOT NULL,
      tipo TEXT DEFAULT 'PRODUCTO',
      id_producto TEXT,
      nombre_manual TEXT,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      FOREIGN KEY (id_ticket) REFERENCES tickets_cola(id)
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

// ============================================================
// COLA DE TICKETS
// ============================================================
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

export interface TicketCola {
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

export interface TicketDetalle {
  id: string;
  id_ticket: string;
  tipo: string;
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

// [SQLite] Crear ticket en la cola (siempre exitoso, es local)
export async function crearTicket(ticketCola: TicketCola, detalles: TicketDetalle[]): Promise<void> {
  const db = await Database.load(DB_NAME);

  await db.execute(
    `INSERT INTO tickets_cola (id, id_venta_backend, id_usuario, id_sesion, total, estado, intentos, ultimo_error, creado_en, enviado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticketCola.id, ticketCola.id_venta_backend, ticketCola.id_usuario, ticketCola.id_sesion, ticketCola.total, ticketCola.estado, ticketCola.intentos, ticketCola.ultimo_error, ticketCola.creado_en, ticketCola.enviado_en]
  );
  await db.execute(
    `INSERT INTO tickets_local (id, id_venta_backend, id_usuario, id_sesion, total, estado, intentos, ultimo_error, creado_en, enviado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticketCola.id, ticketCola.id_venta_backend, ticketCola.id_usuario, ticketCola.id_sesion, ticketCola.total, ticketCola.estado, ticketCola.intentos, ticketCola.ultimo_error, ticketCola.creado_en, ticketCola.enviado_en]
  );
  for (const d of detalles) {
    //inserta uno por uno los detalles en el ticket cola
    await db.execute(
      `INSERT INTO tickets_detalle (id, id_ticket, tipo, id_producto, nombre_manual, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.id_ticket, d.tipo, d.id_producto, d.nombre_manual, d.cantidad, d.precio_unitario]
    );
    //inserta uno por uno los detalles en el ticket local
    await db.execute(
      `INSERT INTO tickets_local_detalle (id, id_ticket, tipo, id_producto, nombre_manual, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.id_ticket, d.tipo, d.id_producto, d.nombre_manual, d.cantidad, d.precio_unitario]
    );
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

 
// [SQLite] Obtener tickets pendientes de envío
export async function getTicketsPendientes(): Promise<TicketCola[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<TicketCola[]>(
    "SELECT * FROM tickets_cola WHERE estado = 'PENDIENTE' ORDER BY creado_en"
  );
  await db.close();
  return rows;
}

// [SQLite] Obtener detalle de un ticket
export async function getTicketDetalle(idTicket: string): Promise<TicketDetalle[]> {
  const db = await Database.load(DB_NAME);
  const rows = await db.select<TicketDetalle[]>(
    "SELECT * FROM tickets_detalle WHERE id_ticket = ?",
    [idTicket]
  );
  await db.close();
  return rows;
}

// [SQLite] Marcar ticket como enviado (éxito del backend)
export async function marcarTicketEnviado(id: string, idVentaBackend: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE tickets_cola SET estado = 'ENVIADO', id_venta_backend = ?, enviado_en = datetime('now') WHERE id = ?`,
    [idVentaBackend, id]
  );
  await db.close();
}

// [SQLite] Marcar ticket con error (intento fallido)
export async function marcarTicketError(id: string, error: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute(
    `UPDATE tickets_cola SET intentos = intentos + 1, ultimo_error = ? WHERE id = ?`,
    [error, id]
  );
  await db.close();
}

// [SQLite] Eliminar ticket de la cola (después de enviado o si se cancela)
export async function eliminarTicket(id: string): Promise<void> {
  const db = await Database.load(DB_NAME);
  await db.execute("DELETE FROM tickets_detalle WHERE id_ticket = ?", [id]);
  await db.execute("DELETE FROM tickets_cola WHERE id = ?", [id]);
  await db.close();
}
