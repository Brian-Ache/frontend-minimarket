# Changelog Frontend

## 2026-10-13

---

### Gestión de categorías y proveedores desde los formularios

**Resumen**: Los selects de categoría (módulo Productos) y de proveedor (módulo Compras) se
agregaron un botón `+` que abre un modal para crear, editar y dar de baja sin salir del
formulario. De paso, el "tipo de comprobante" dejó de ser un `<select>` nativo y pasó a usar
el mismo componente `Select` que el resto de la app.

#### Tipos

- **`src/types/response/categoriaResponse.ts`**: +`descripcion?: string | null`.
- **`src/types/response/proveedorResponse.ts`**: +`telefono?`, `email?`, `direccion?` y
  `deletedAt?: string | null`.

#### `src/services/productoService.ts`

- `getCategorias()` y `getProveedores()` ahora piden `?size=100`: el backend pagina con
  `size=20` por defecto y se tragaba las categorías/proveedores que pasaban de ahí (100 es el
  máximo de `Paginacion.MAX_PAGE_SIZE`).
- `crearCategoria(nombre, descripcion)` → `POST /api/categorias/v1`.
- `modificarCategoria(id, nombre, descripcion)` → `PUT /api/categorias/v1/{id}`.
- `eliminarCategoria(id)` → `DELETE /api/categorias/v1/{id}`.
- `crearProveedor(nombre, telefono, email, direccion)` → `POST /api/proveedores/v1`.
- `modificarProveedor(id, ...)` → `PUT /api/proveedores/v1/{id}`.
- `eliminarProveedor(id)` → `DELETE /api/proveedores/v1/{id}`.
- En los cuatro, los campos vacíos van como `null` (el backend los recorta con `trim()`).

#### `src/components/producto/ModalCategorias.tsx` (NUEVO)

- Se abre con el botón `+` al lado del select de Categoría de `FormProducto.tsx`.
- Formulario de arriba: Nombre (obligatorio) + Descripción; Enter crea. En modo edición pasa
  a "Guardar cambios" con "Cancelar edición".
- Tabla `NOMBRE | DESCRIPCIÓN | ACCIONES` con acciones solo icono (✎ Editar / 🗑 Eliminar),
  borrado con `window.confirm`.
- Errores del backend en rojo via `response.data.error` (duplicados, "No se puede borrar una
  categoría con productos asignados", permisos).
- Al crear, `onCreada(id)` selecciona la nueva categoría en el formulario y refresca el
  select con `tickCategorias`.

#### `src/components/compra/ModalProveedores.tsx` (NUEVO)

- Se abre con el botón `+` al lado del select de Proveedor del `Header` de la compra.
- Formulario 2×2: Nombre | Teléfono arriba, Email | Dirección abajo (solo nombre obligatorio).
- Tabla `NOMBRE | TELÉFONO | EMAIL | DIRECCIÓN | ACCIONES` con acciones solo icono y
  borrado con `window.confirm`.
- No lista dados de baja ni restaura: el backend lo soporta (`?incluirBajas=true` y
  `POST /v1/{id}/restaurar`) pero quedó fuera de alcance.
- Mismo patrón de `onCreada`: selecciona el proveedor recién creado en el header.

#### `src/components/compra/Header.tsx`

- Select de proveedor envuelto en `flex items-center gap-1` con el trigger en
  `flex-1 min-w-0`, más el botón `+` (`variant="outline"`, `size="icon"`). Refresco con
  `tickProveedores`.
- **Tipo de comprobante**: se reemplazó el `<select>` nativo por el `Select` del repo
  (trigger `w-full`, placeholder "Tipo de comprobante", opciones `remito` y `factura`).
  `NuevaCompra.tsx` sigue enviando `tipoComprobante || null`, sin cambios en el payload.

#### Ajustes de los dos modales

- Ancho `sm:max-w-[860px]` (antes 560 en categorías y 640 en proveedores): con varias
  columnas los 640 apretaban email y dirección.
- Acciones de fila solo icono (`size="icon-sm"` con tooltip via `title`), manteniendo el
  encabezado "Acciones" en la tabla.

#### Nota sobre permisos

- La escritura de categorías y proveedores es `hasRole("ADMIN")` en el backend; el botón `+`
  se muestra siempre porque la página de productos y la de compras son de uso administrativo.

#### Verificación

- `npx tsc --noEmit` y `npm run build` sin errores en los dos módulos.

---

## 2026-09-30

---

### Historial del día, estados de sync y hora local sin `Z`

**Resumen**: El modal de Ventas del Día ahora refleja el estado real de cada ticket
(Pendiente / Sincronizado / Error) porque `tickets_local` empezó a escribirse al cobrar y a
actualizarse en cada sync. Además se corrigió la causa que dejaba **todos** los eventos en
ERROR: el payload mandaba `ocurridoEn` en UTC con `Z` y el backend lo interpretaba como hora
local (+3 h) y lo rechazaba.

#### Sincronización de `tickets_local` — `sqliteService.ts`

- **`crearTicketLocal(ticket, detalles)`** (nueva): inserta en `tickets_local` +
  `tickets_local_detalle` con el mismo UUID que el evento de `evento_cola`, para que cuando
  el backend acepte el evento se pueda marcar el historial como sincronizado.
- **`marcarTicketLocalSincronizado(id)`** (nueva): `estado = "ENVIADO"` y
  `enviado_en = datetime('now')`.
- **`marcarEventoFalloDefinitivo(id, error)`** (nueva): `estado = "ERROR"` + `ultimo_error`
  en `evento_cola` **y** en `tickets_local`, para códigos no reintentables.
- **`initDatabase()`**: al arrancar borra `tickets_local` con más de **7 días** (retención
  del historial del día).
- **`getTicketsDia()`**: filtra por **día local** (`toDateString()`, antes traía todo) y
  ordena `creado_en DESC`.

#### Escritura del historial al cobrar — `ventaLocalService.ts`

- `cobrarTicket()` ahora llama a `crearTicketLocal()` con el mismo `ticketId` que usa el
  evento. Antes `tickets_local` solo se leía (modal vacío); ahora el modal del día muestra
  las ventas.
- **`ocurridoEn` se arma en hora local sin `Z`** (`ahoraLocal`, p. ej.
  `2026-09-30T20:59:14`): el backend lo recibe como `LocalDateTime` y lo compara contra
  `LocalDateTime.now()` (zona del servidor). Con `new Date().toISOString()` llegaba `…Z`,
  se leía como 23:59 → +3 h contra un máximo de 5 min (`sync.desfase-maximo-minutos`) →
  `FECHA_INVALIDA` "La fecha del evento está en el futuro" y **todos** los tickets quedaban
  en ERROR.
- `creado_en` y `ocurrido_en` de SQLite siguen en UTC con `Z` (son instantes): el modal los
  renderiza con `new Date(...)` y el filtro de "hoy" depende de ellos.
- No hizo falta tocar el backend.

#### Errores definitivos en la cola — `syncService.ts`

- `enviarLoteBackend()`:
  - `estado === "OK"` → además marca `tickets_local` ENVIADO (`marcarTicketLocalSincronizado`).
  - error **reintentable** → `marcarEventoError()` (sigue en la cola).
  - error **no reintentable** → `marcarEventoFalloDefinitivo()` (evento y ticket a ERROR).
    Antes las dos ramas de error hacían lo mismo: el evento giraba cada 15 s para siempre, o
    desaparecía de la cola al llegar a 50 intentos.

#### Modal de Ventas del Día — `ModalVentasDia.tsx`

- **`estadoVisible(estado)`**: 3 estados en lista y detalle — `PENDIENTE` (Pendiente, !),
  `ENVIADO` (Sincronizado, ✓), `ERROR` (Error de sincronización, ✗).
- El detalle muestra `ultimo_error` en rojo cuando `estado === "ERROR"`.
- `productos` pasa a `useState<ProductoVenta[]>`; se eliminó el tipo `TicketVenta` sin uso.
- Lo que se ve en el modal es lo que el backend aceptó o rechazó (misma fuente que la cola).

#### Convención de hora en la infraestructura

- Todo el sistema guarda hora local **naive**: `LocalDateTime` en la API y `datetime(6)` en
  MySQL (`fecha_cobro`, `fecha_apertura`, `created_at`). La zona la aporta el JVM de la
  máquina; no se persiste en ningún lado.
- Consecuencias: la zona vive solo en la máquina que escribió (migrar la BD a otra región
  reinterpreta el histórico), el valor no es un instante (no sirve para comparar entre
  máquinas ni con DST), y un equipo con reloj/zona mal configurados escribe horas corridas
  **sin que nadie lo detecte**.
- **Regla de operación**: todos los dispositivos y el servidor con la misma zona horaria y
  NTP activado (es lo que hace que la tolerancia de 5 min de `validarFecha` tenga sentido).
- En SQLite local se mantiene la regla más segura: guardar instantes con `Z` y convertir a
  hora local solo al mostrar.
- Las implicancias completas de esta convención están en el **Anexo — Contradicciones de
  infraestructura de no usar zonas horarias**, al final del archivo.

### Pendiente

1. **Filtros de compras corridos 3 h**: `useCompras.tsx:60,65` y
   `HistorialCompras.tsx:244,256` mandan `.toISOString()` como query param (pasa por
   `@DateTimeFormat`, no por Jackson) → `desde` = 03:00 en vez de 00:00. Se arregla con la
   misma convención: hora local sin `Z`.
2. **Prueba end-to-end del sync**: venta → `evento_cola` y `tickets_local` en `ENVIADO` →
   fila en MySQL `ventas` con `fecha_cobro` en hora local (requiere borrar los eventos
   viejos que quedaron en ERROR).
3. **Navegación y anulación en el modal**: ↑/↓ y la tecla `E` para anular no están
   implementados; el front hoy solo emite eventos `CREAR`. Falta armar y encolar `ANULAR`
   (y `ABRIR_SESION`/`CERRAR_SESION` offline).
4. **Robustez de zona horaria**: si un equipo tiene la TZ desconfigurada, la venta entra con
   fecha corrida y en silencio (cae en "ayer", queda fuera de "anular solo hoy" y contamina
   los informes). La opción B que lo elimina — deserializador en el backend que acepte `Z` y
   convierta a su zona — quedó sin aplicar.

---

## 2026-09-21

---

### Sincronización offline-first — Reestructuración de la cola de eventos

**Resumen**: Se reestructuró la cola de eventos del frontend para enviar al endpoint
`POST /api/ventas/v1/sync` en vez del endpoint `POST /api/ventas/v1` (online). Los tickets
ahora se guardan como eventos serializados con su payload completo, listos para sync batch.

#### Qué es un evento y un payload

Un **evento** es algo que pasó en el local y que el backend necesita enterarse. No es solo
una venta — puede ser cualquiera de las cuatro acciones que el sistema maneja:

| Evento | Qué representa |
|---|---|
| `CREAR` | Se vendió un ticket |
| `ANULAR` | Se anuló un ticket |
| `ABRIR_SESION` | Se abrió la caja |
| `CERRAR_SESION` | Se cerró la caja |

Cuando la caja registradora está sin internet, estos eventos se acumulan en una cola local
(SQLite). Cuando vuelve la conexión, se mandan todos juntos al backend.

El **payload** es el evento completo serializado como JSON. Es todo lo que el backend
necesita para procesarlo. Se guarda como un campo `TEXT` en la tabla `evento_cola` porque
es genérico: el mismo campo sirve para los 4 tipos de evento, cada uno con sus propios
campos.

#### Por qué se hicieron estos cambios

El frontend original enviaba cada ticket individualmente a `POST /api/ventas/v1` (el
endpoint online). Eso funciona cuando hay internet, pero:

1. Si no hay internet, el request falla y el ticket se pierde o queda en una cola genérica.
2. El formato no coincide con lo que el backend espera para offline: el sync endpoint pide
   un lote de eventos con `uuid` v7, `tipo`, `secuencia`, `ocurridoEn`, etc.
3. No contempla anulaciones ni apertura/cierre de caja offline — solo ventas.

La solución:

1. **Cola de eventos genérica**: en vez de una tabla `tickets_cola` que solo guardaba
   ventas, `evento_cola` guarda los 4 tipos de evento con su payload serializado.
2. **Payload como JSON**: un solo campo `TEXT` almacena todo el evento. El front lo
   serializa cuando lo crea, y lo deserializa cuando lo envía.
3. **Envío batch al sync endpoint**: `syncService.ts` arma un `SyncLoteRequest` con todos
   los eventos pendientes y los manda juntos a `POST /api/ventas/v1/sync`.
4. **UUID v7 + idempotencia**: el `uuid` del evento es el de la entidad (ticket o turno).
   Si se reenvía el mismo lote, el backend lo reconoce y no duplica nada.

#### Base de datos (SQLite local)

- **Tabla `evento_cola`** — nueva, reemplaza a `tickets_cola`. Almacena los 4 tipos de
  evento con un campo `payload` que contiene el JSON completo. Columnas: `id`, `tipo`,
  `uuid_entidad`, `secuencia`, `ocurrido_en`, `payload`, `estado`, `intentos`,
  `ultimo_error`, `dispositivo`, `creado_en`, `enviado_en`.
- **Tabla `detalle_tickets_cola`** — renombrada de `tickets_detalle`. FK cambiada de
  `id_ticket` a `id_evento` (referencia a `evento_cola.id`).
- **Tabla eliminada**: `tickets_cola` (reemplazada por `evento_cola`).
- **Tablas sin cambios**: `productos`, `tickets_local`, `tickets_local_detalle`.

> **Al actualizar hay que borrar la base SQLite vieja** (`minimarket.db`) para que
> `initDatabase()` cree las tablas nuevas con la estructura correcta.

#### `src/services/venta/sqliteService.ts`

- **`initDatabase()`**: tabla `evento_cola` crea las columnas nuevas; tabla
  `detalle_tickets_cola` usa `id_evento` con FK a `evento_cola(id)`.
- **Interfaces nuevas**: `EventoCola` (reemplaza `TicketCola`) y `DetalleTicketCola`
  (reemplaza `TicketDetalle`).
- **`crearEventoCola()`** (antes `crearTicket()`): acepta `EventoCola` + opcional
  `DetalleTicketCola[]`. Inserta en `evento_cola` con las columnas correctas (`tipo`,
  `uuid_entidad`, `secuencia`, `ocurrido_en`, `payload`, `dispositivo`).
- **`getEventosPendientes()`** (antes `getTicketsPendientes()`): sin cambios lógicos.
- **`getDetalleEventoCola()`** (antes `getTicketDetalle()`): busca por `id_evento` en
  vez de `id_ticket`.
- **`marcarEventoEnviado()`** (antes `marcarTicketEnviado()`): elimina referencia a
  `id_venta_backend` (no existe en la tabla nueva).
- **`marcarEventoError()`** (antes `marcarTicketError()`): sin cambios lógicos.
- **`eliminarEventoCola()`** (antes `eliminarTicket()`): borra por `id_evento` en
  `detalle_tickets_cola`.

#### `src/services/venta/ventaLocalService.ts`

- **`cobrarTicket()`**: acepta parámetro `metodoPago` (default `"EFECTIVO"`).
- Construye el `payload` JSON con todos los campos que espera el endpoint sync: `uuid`,
  `tipo`, `secuencia`, `ocurridoEn`, `idVendedor`, `idSesion`, `total`, `metodoPago`,
  `montoRecibido`, `detalles[]`.
- Arma `EventoCola` con `payload` serializado y lo guarda via `crearEventoCola()`.
- Envía a `POST /api/ventas/v1/sync` (antes enviaba a `POST /api/ventas/v1`).
- Importa `crearEventoCola`, `eliminarEventoCola`, `DetalleTicketCola` (nombres nuevos).

#### `src/services/venta/syncService.ts`

- **`enviarEventoBackend()`**: lee el `payload` de `evento_cola`, lo parsea y lo envía
  como `SyncLoteRequest` a `POST /api/ventas/v1/sync`.
- **`flushColaEventos()`** (antes `flushColaTickets()`): referencia a
  `getEventosPendientes()`.
- Importa `getEventosPendientes`, `getDetalleEventoCola`, `marcarEventoEnviado`,
  `marcarEventoError` (nombres nuevos).
- `startRetryLoop()` y `stopRetryLoop()` sin cambios lógicos.

#### UUID v7 — Generador de IDs para eventos

- **Archivo nuevo**: `src/lib/uuidv7.ts`
- Generador UUIDv7 puro, sin dependencias externas. Misma lógica que el `Uuid7.java`
  del backend: 48-bit timestamp (epoch ms), 4-bit versión (`0x7`), 12-bit counter
  monótono, 62-bit random con variante `10`.
- Garantiza IDs estrictamente crecientes (counter maneja múltiples llamadas en el
  mismo milisegundo). Usa `crypto.getRandomValues` (no `Math.random`).
- Reemplaza al generador UUID v4 que el backend rechazaba con `UUID_INVALIDO`.

#### Sesión de caja — Obtener sesión activa del backend

- **Archivo nuevo**: `src/services/cajaService.ts`
- Función `getSesionActiva()`: llama a `GET /api/caja/v1/sesion-activa` y devuelve
  la sesión abierta (`id`, `saldoInicial`, `estado`, `idUsuarioApertura`, etc.).
- Si no hay sesión abierta, el backend devuelve 400 y la función lanza error.

#### Sesión de caja — Contexto global

- **Archivo nuevo**: `src/context/SesionContext.tsx`
- `SesionProvider`: al montar la app, llama a `getSesionActiva()` y guarda el
  resultado en estado. Expone `{ sesion, idSesion, loading }` via `useSesion()`.
- Si no hay sesión abierta (error 400), `idSesion = null` y loguea warning.
- No maneja apertura/cierre de sesión todavía (eso es para después).

#### `src/App.tsx`

- Importa y agrega `<SesionProvider>` envolviendo `<AppLayout />` dentro de
  `<AuthProvider>`. Esto hace que el contexto de sesión esté disponible a toda la app.

#### `src/components/venta/VentaPage.tsx`

- Importa `useSesion` desde `SesionContext`.
- Obtiene `idSesion` del contexto y lo pasa a `cobrarTicket()` en la línea 276:
  `cobrarTicket(productos, user.id, idSesion ?? undefined)`.
- Antes el `idSesion` era `undefined` siempre — el backend rechazaba con
  "El ticket no declara su sesión de caja".

#### `src/services/venta/ventaLocalService.ts`

- Importa `uuidV7` desde `@/lib/uuidv7` (reemplaza al generador UUID v4).
- `cobrarTicket()` ahora usa `uuidV7()` para generar el `ticketId` y los IDs de
  los detalles (antes usaba `generarId()` con v4).
- `montoRecibido` siempre envía `total` (antes era `null` para métodos no efectivo).
- El backend ahora recibe UUID v7 válido, `idSesion` de la sesión activa, y
  `montoRecibido` siempre presente.

#### `src/services/venta/syncService.ts`

- **`syncProductos()`**: ahora pagina las requests al backend de a 100 productos
  (`size=100`) en vez de intentar traer todos de una (`size=9999`). El backend
  limita `size` a máximo 100 y rechazaba con 400.
- Loop `do...while`: pide página por página hasta que `fetched >= totalElements`.

#### Envío de ventas por lote — `ventaLocalService.ts`

- Se eliminó el bloque de envío inmediato al backend (try/catch de ~25 líneas después
  de `crearEventoCola`). Antes intentaba enviar cada venta individualmente al
  `POST /api/ventas/v1/sync` y si fallaba, la dejaba en la cola.
- `cobrarTicket()` ahora solo guarda el evento en SQLite y retorna éxito siempre.
  La cola de eventos se envía al backend de forma independiente via `syncService`.
- Se eliminaron imports de `eliminarEventoCola` y `api` (ya no se usan en este archivo).

#### Envío de ventas por lote — `syncService.ts`

- Nueva función `enviarLoteBackend()` que reemplaza a `enviarEventoBackend()`.
  Trae todos los eventos pendientes de SQLite, los divide en chunks de 100 (límite
  del backend), y los envía en una sola request por chunk.
- Parsea la respuesta del backend (`SyncLoteResponse`) y por cada resultado:
  - `estado === "OK"` o `requiereRevision` → `marcarEventoEnviado(uuid)`
  - `estado === "ERROR"` y `reintentable` → `marcarEventoError(uuid, mensaje)`
  - `estado === "ERROR"` y no reintentable → `marcarEventoError(uuid, mensaje)`
- `flushColaEventos()` ahora solo llama a `enviarLoteBackend()` (antes hacía un
  loop de a 1 evento).
- Se eliminó import de `getDetalleEventoCola` (ya no se usaba).

#### Servicio de caja — `cajaService.ts`

- +`abrirSesion(saldoInicial)` → llama a `POST /api/caja/v1/abrir` con
  `{ saldoInicial }` y retorna `SesionActiva`.
- +`cerrarSesion(saldoReal, montoRetirado, observaciones?)` → llama a
  `POST /api/caja/v1/corte` con `{ saldoReal, montoRetirado, observaciones }`.

#### Sesión de caja — Contexto con abrir/cerrar — `SesionContext.tsx`

- +`abrir(saldoInicial)` — llama a `abrirSesion()` del servicio y actualiza
  el estado del contexto con la nueva sesión.
- +`cerrar()` — limpia la sesión del estado (`setSesion(null)`).
- El contexto ahora expone `{ sesion, idSesion, loading, abrir, cerrar }`.

#### Modal de apertura de caja — `ModalAbrirCaja.tsx` (NUEVO)

- **Archivo nuevo**: `src/components/caja/ModalAbrirCaja.tsx`
- Modal que aparece **solo inmediatamente después del login** cuando no hay
  sesión de caja abierta. Usa el flag `justLoggedIn` de AuthContext — no aparece
  al recargar la página (F5) ni al navegar entre páginas.
- No cerrable: sin botón X (`showCloseButton={false}`), sin Escape, sin click
  afuera. El usuario debe completar el saldoInicial para continuar.
- Hereda el tema visual del sistema (sin colores oscuros custom).
- Input numérico para saldoInicial. Al confirmar, llama a `abrir()` del
  SesionContext y luego `clearJustLoggedIn()` para que no vuelva a aparecer.

#### Modal de apertura de caja — `App.tsx`

- +`<ModalAbrirCaja />` dentro de `AppLayout`, al final del return.
  Se renderiza condicionalmente (el componente maneja su propia lógica de
  visibilidad via `useSesion()` y `useAuth()`).

#### Cierre de caja — `ConfiguracionPage.tsx`

- +Botón "Cerrar Caja" visible solo si hay sesión activa (`sesion !== null`).
- +Modal de confirmación (shadcn Dialog) con input para `saldoReal`
  (cuánto dinero hay físicamente en caja).
- Al confirmar: llama a `cerrarSesion(saldoReal, 0)` y luego `cerrar()` del
  SesionContext para limpiar la sesión. El modal de apertura reaparece.

#### Flag de login reciente — `AuthContext.tsx`

- +Estado `justLoggedIn` (boolean, default `false`).
- `login()` pone `justLoggedIn = true` al completar exitosamente.
- `logout()` pone `justLoggedIn = false`.
- +`clearJustLoggedIn()` — pone el flag en `false`. Lo usa `ModalAbrirCaja`
  después de abrir caja para que el modal no vuelva a aparecer.
- Todo expuesto en el provider: `{ user, token, login, logout, isAuthenticated,
  loading, error, justLoggedIn, clearJustLoggedIn }`.

#### Redirección al login — `AuthContext.tsx`

- `loading` ahora inicia en `true` (antes `false`). Sin esto, si no hay token en
  localStorage el usuario entraba directamente al sistema sin autenticación.
- `useEffect` pone `loading = false` al terminar de restaurar token/user de localStorage.
- `ProtectedRoute` espera a que `loading` sea `false` antes de decidir si redirige o no.

#### Manejo de sesión existente al iniciar — `SesionContext.tsx`

- `cargar()` extraída como función del contexto (no local del useEffect) para poder
  re-utilizarla.
- Nuevo `recargar()` que re-ejecuta `getSesionActiva()` — lo usa `ModalAbrirCaja`
  cuando el backend responde que ya existe una sesión abierta.
- Catch ahora distingue entre errores: si es 400 con mensaje "No hay" → es normal
  (no hay sesión), otros errores (red, auth, 500) se loguean aparte.
- **Pendiente (no definitivo)**: detectar si hay sesión abierta revisando el contenido
  del mensaje de error no es elegante. Falta que el backend devuelva un código
  específico (ej. 204 sin body cuando no hay sesión, o un campo booleano en la
  respuesta de `GET /api/caja/v1/sesion-activa`).

#### Modal de apertura de caja — `ModalAbrirCaja.tsx`

- Si el backend responde "Ya existe una sesión de caja abierta", el modal se cierra
  automáticamente y re-fetch la sesión activa via `cargar()`.
- **Temporal**: se agregó botón "Cerrar" (`handleCerrar` → `clearJustLoggedIn()`). El
  modal originalmente no debería poder cerrarse — el usuario debe abrir caja para
  continuar. El botón es de desarrollo hasta resolver por qué `GET
  /api/caja/v1/sesion-activa` no carga la sesión existente al iniciar.

- **useEffect** que llama a `cargar()` cuando `justLoggedIn` cambia a `true`.
  Esto fuerza un re-fetch de `getSesionActiva()` inmediatamente después del login,
  asegurando que `sesion` se actualice correctamente si ya había una sesión abierta
  antes de que el usuario iniciara sesión.

#### Error del backend usa campo `error` no `message`

- El backend responde con `{ error: "..." }` (campo `error`), no con `{ message: "..." }`.
- Se cambiaron todas las referencias de `err.response?.data?.message` a `err.response?.data?.error` en:
  - `SesionContext.tsx` (catch de `getSesionActiva`)
  - `ModalAbrirCaja.tsx` (catch de `abrir`)
  - `ConfiguracionPage.tsx` (catch de `getSesionActiva` y `cerrarSesion`)
- Sin este cambio, `data.message` era `undefined` y los mensajes de error no se detectaban correctamente.

#### Cambio de HTTP status en el backend — `CajaService.java`

- `GET /api/caja/v1/sesion-activa` sin sesión → `404 NOT_FOUND` (antes `400` con `BadRequestException`)
- `POST /api/caja/v1/abrir` con sesión ya abierta → `409 CONFLICT` (antes `400` con `BadRequestException`)
- Esto permite al frontend distinguir los casos por `err.response?.status` en vez de parsear strings de error.
- Se cambiaron las dos ocurrencias de `BadRequestException` a `ResponseStatusException(HttpStatus.NOT_FOUND/CONFLICT)`.

#### Botón verde "Abrir Caja" — `ConfiguracionPage.tsx`

- Agregado botón verde "Abrir Caja" junto a "Cerrar Caja".
- Incluye input numérico para saldo inicial.
- Llamada a `abrir()` desde `useSesion` + `clearJustLoggedIn()` al éxito.
- Manejo de estados: `cargandoApertura`, `errorApertura`, `saldoInicial`.

#### Cierre de caja actualiza `justLoggedIn` — `ConfiguracionPage.tsx`

- `confirmarCierre()` ahora llama a `cerrar()` (de `SesionContext`) y `clearJustLoggedIn()` (de `AuthContext`) después de `cerrarSesion()`.
- `justLoggedIn = false` → `ModalAbrirCaja` no aparece al cerrar la caja.
- Se agregó `useAuth` import a `ConfiguracionPage.tsx`.

#### Servicio de ventas — validación de sesión — `ventaLocalService.ts`

- `cobrarTicket()` retorna `{ exito: false, mensaje: "No hay una sesión de caja abierta..." }` si `idSesion` es `undefined` o `null`.
- Validación al inicio de la función, antes de generar el UUID o el payload.

#### Deshabilitar venta sin sesión — `VentaPage.tsx`, `FooterVenta.tsx`

- `VentaPage.tsx`: `cobrar()` retorna alert si `!sesion` antes de llamar a `cobrarTicket`.
- `VentaPage.tsx`: pasa `sesion` como prop a `FooterVenta`.
- `FooterVenta.tsx`: botón "F12 - Cobrar" tiene `disabled={!sesion}`.
- Doble protección: `VentaPage.cobrar()` y `ventaLocalService.cobrarTicket()` ambos verifican la sesión.

#### `SesionContext.tsx` simplificado — eliminado `haySesion`

- Se eliminó el estado `haySesion`, `recargar()` y `setHaySesion`.
- Ahora solo usa `sesion: SesionActiva | null` como fuente única de verdad.
- `cargar()` llama `getSesionActiva()`: 200 → setea `sesion`; 404 → `sesion = null`; otro error → log y `sesion = null`.
- Si `sesion !== null` → sesión abierta; si `sesion === null` → sesión cerrada.

#### Modal de carga — `ModalAbrirCaja.tsx`

- Cuando `loading = true` muestra un diálogo "Cargando..." con "Verificando sesión de caja".
- `sesion !== null` → no muestra nada (sesión ya abierta).
- `!isAuthenticated || !justLoggedIn` → no muestra nada.
- Solo muestra el formulario de apertura si `!loading && !sesion && isAuthenticated && justLoggedIn`.
- `useEffect` llama `cargar()` cuando `justLoggedIn` cambia a `true`.
- `cargar()` reemplaza a `recargar()` (eliminada).

---

## 2026-08-28

---

#### PaginatedResponse — Reubicado a archivo propio
- **Archivo**: `types/response/paginatedResponse.ts` (nuevo)
- **Por qué**: `PaginatedResponse<T>` es un tipo genérico que no pertenece a
  `productoResponse.ts`. Se movió a su propio archivo para que pueda ser
  reutilizado por otros módulos (compras, ventas, etc.).
- **Qué cambió**:
  - Se creó `types/response/paginatedResponse.ts` con la interfaz `PaginatedResponse<T>`.
  - Se eliminó `PaginatedResponse` de `types/response/productoResponse.ts`.
  - Se actualizó la importación en `services/productoService.ts`.

#### compraService — CompraFiltros extendido
- **Archivo**: `services/compraService.ts`
- **Por qué**: el endpoint `GET /api/compras/v1` ahora soporta filtros
  por proveedor, tipo comprobante, rango de fechas y ordenamiento.
- **Qué cambió**:
  - `CompraFiltros` ahora incluye: `page`, `size`, `proveedor`,
    `tipoComprobante`, `desde`, `hasta`, `sortTotal`.
  - `getCompras()` envía todos los campos como query params opcionales.

#### useCompras — Filtros integrados
- **Archivo**: `hooks/useCompras.tsx`
- **Qué cambió**:
  - Nuevos estados de filtros: `proveedorId`, `tipoComprobante`,
    `fechaDesde`, `fechaHasta`, `periodo`, `sortTotal`.
  - Carga proveedores al montar (`getProveedores()`).
  - Cálculo automático de fechas desde/hasta según el período seleccionado
    (hoy, ayer, esta semana, este mes, últimos 30 días).
  - Reset a página 0 cuando cambian filtros.

#### HistorialCompras — Barra de filtros
- **Archivo**: `components/compra/HistorialCompras.tsx`
- **Por qué**: el historial de compras necesitaba poder filtrar por
  proveedor, tipo de comprobante, rango de fechas y ordenar por total.
  Para un comercio real es indispensable encontrar compras específicas.
- **Qué cambió**:
  - Barra de filtros `bg-slate-100` con `flex gap-2 flex-wrap`
    (patrón idéntico a TablaProductos).
  - Select de proveedor (dinámico, carga del backend).
  - Select de tipo de comprobante (fijo: Remito, Factura, Ticket, Boleta).
  - Select de ordenamiento por total (Mayor/Menor precio).
  - Select de período (patrón VistaGeneral): Hoy, Ayer, Esta semana,
    Este mes, Últimos 30 días, Personalizado.
  - Inputs de fecha Desde/Hasta (solo visibles con período "Personalizado").
  - Botón Restablecer (solo visible cuando hay filtros activos).
  - Modal de detalle: al hacer click o Enter en una fila, se abre un
    Dialog con la info de la compra (proveedor, fecha, comprobante,
    observaciones) y una tabla de productos (nombre, cantidad, costo,
    subtotal) + total. Solo lectura.
  - Botón eliminar: columna "Acción" con icono `Trash2` rojo en cada fila.
    `window.confirm()` antes de eliminar. Al eliminar, el stock se revierte
    automáticamente en el backend. Usa `useAuth` para obtener el `idUsuario`.

#### compraService — eliminarCompra con idUsuario
- **Archivo**: `services/compraService.ts`
- **Qué cambió**: `eliminarCompra(id)` → `eliminarCompra(id, idUsuario)`.
  Ahora envía `idUsuario` en el header para que el backend registre el
  movimiento de reversión de stock.

#### CompraPage — refreshKey para historial
- **Archivo**: `components/compra/CompraPage.tsx`
- **Qué cambió**: administra `refreshKey` que se incrementa cuando se crea
  una compra (vía `onCompraCreada` de NuevaCompra) y se pasa a HistorialCompras.

#### NuevaCompra — callback onCompraCreada
- **Archivo**: `components/compra/NuevaCompra.tsx`
- **Qué cambió**: nuevo prop `onCompraCreada?: () => void` que se llama
  después de registrar exitosamente una compra, permitiendo que el padre
  (CompraPage) refresque el historial.

#### Header — Campo fecha inmutable
- **Archivo**: `components/compra/Header.tsx`
- **Por qué**: el backend usa `@CreationTimestamp` en `createdAt` de la
  entidad `Compra`, siempre poniendo la fecha/hora actual del servidor.
  El campo de fecha en el formulario no tiene efecto real, así que se
  deshabilitó para evitar confusión.
- **Qué cambió**: el `<Input type="date">` ahora tiene `disabled` y
  muestra la fecha de hoy en gris. El input original se comentó (no se
  borró) por si en el futuro se necesita permitir fechas personalizadas.

#### ItemsTable — Botón eliminar producto
- **Archivo**: `components/compra/ItemsTable.tsx`
- **Por qué**: no existía forma de quitar un producto de la tabla de items
  de una compra en curso.
- **Qué cambió**:
  - Columna "Acción" con botón `Trash2` (icono rojo) en cada fila.
  - Al hacer clic, filtra el item por índice y llama a `setItems` con el
    array actualizado. El total se recalcula automáticamente en NuevaCompra.

#### Botón eliminar en modal de modificación
- **Archivos**: `productoService.ts`, `hooks/useModificarProducto.tsx`, `components/producto/TablaProductos.tsx`
- **Por qué**: no existía forma de eliminar un producto desde la interfaz.
  El usuario necesitaba un botón en el modal de modificación para borrar
  productos.
- **Qué cambió**:
  - `productoService.ts`: nueva función `eliminarProducto(id)` que llama
    `DELETE /api/productos/v1/{id}`.
  - `useModificarProducto.tsx`: nueva función `eliminar()` que muestra
    `window.confirm()`, llama a `eliminarProducto()`, refresca la tabla
    y cierra el modal. Nuevo prop `onClose` para cerrar el modal desde el hook.
    Nuevo estado `modalDeleting`.
  - `TablaProductos.tsx`: botón rojo "Eliminar" (icono `Trash2`) en el
    `DialogFooter` del modal, deshabilitado durante saving/deleting.

#### compraService — Nuevo service para compras
- **Archivo**: `services/compraService.ts` (nuevo)
- **Por qué**: no existía un service para conectarse al endpoint
  `POST /api/compras/v1`.
- **Qué tiene**:
  - Interfaz `DetalleCompraRequest` con `idProducto`, `precioUnitario`,
    `cantidad`, `margen`, `precioVenta`, `fechaVencimiento`, `numeroLote`.
  - Interfaz `CompraRequest` con `detalle`, `idProveedor`, `tipoComprobante`,
    `nroComprobante`, `observaciones`, `idSesion`.
  - Interfaz `CompraResponse` con `id`, `fecha`, `total`, `detalle`,
    `proveedor`, etc.
  - Función `crearCompra(usuarioId, request)` → `POST /api/compras/v1` con
    header `idUsuario`.

#### NuevaCompra — Conectado al backend
- **Archivo**: `components/compra/NuevaCompra.tsx`
- **Por qué**: el `handleSendToBackend` solo hacía `console.log` y reseteaba
  el formulario sin enviar nada al backend.
- **Qué cambió**:
  - Se importó `useAuth` y `crearCompra`.
  - Se agregaron estados `loading` y `error`.
  - `handleSendToBackend` ahora:
    1. Valida que haya items y un usuario logueado.
    2. Mapea `compra.items` → `detalle` renombrando campos
       (`productoId`→`idProducto`, `costo`→`precioUnitario`) y enviando
       `margen` y `precioVenta`.
    3. Llama a `crearCompra(user.id, request)`.
    4. Resetea + alert("Compra registrada exitosamente").
    5. En catch: `setError(err.response?.data?.error || "Error...")`.
  - Tipo `Compra.items` ahora incluye `precioVenta: number`.

#### Footer — Loading state
- **Archivo**: `components/compra/Footer.tsx`
- **Por qué**: durante el request al backend, el usuario podía hacer clic
  múltiples veces en "Guardar Compra".
- **Qué cambió**: se agregó prop `loading?: boolean`. El botón se deshabilita
  y muestra "Guardando..." durante el request.

#### ItemsTable — precioVenta en CompraItem
- **Archivo**: `components/compra/ItemsTable.tsx`
- **Por qué**: el tipo `CompraItem` no tenía `precioVenta`, lo que causaba
  un error de TypeScript cuando `NuevaCompra` intentaba pasar los items
  (que ahora incluyen `precioVenta`).
- **Qué cambió**: `CompraItem` ahora incluye `precioVenta: number`.

#### TablaProductos — Fix columnas y modal
- **Archivo**: `components/producto/TablaProductos.tsx`
- Se agregaron columnas "Costo" y "Cantidad" (stock via `getStockBatch()`).
- Modal de modificación completo con todos los campos + `useModificarProducto()`.
- `colSpan` del empty state ajustado de 5 a 7.

#### Header de Compra — Select de proveedores
- **Archivo**: `components/compra/Header.tsx`
- Se reemplazó el `<Input>` por un `<Select>` controlado con proveedores del
  backend. UUID del proveedor se guarda en `compra.proveedor`.

#### AgregarProductoCompra — Buscador conectado al backend
- **Archivo**: `components/compra/AgregarProductoCompra.tsx`
- Se eliminó `PRODUCTOS_MOCK`, `localStorage` y la interfaz local `Producto`.
- Ahora usa `useProductos()` del backend con debounce de 500ms.
- `productoId` cambiado de `number` a `string` (UUID).

---

### Pendiente: Fix `useModificarProducto.tsx` — variable `user` no declarada

- **Estado (2026-10-13)**: ✅ resuelto — `hooks/useModificarProducto.tsx:45` hoy declara
  `const { user } = useAuth();`.

> `hooks/useModificarProducto.tsx:107` usa `user!.id` pero `useAuth()` nunca
> se llama. Falta `const { user } = useAuth();` + null check.

---

### Pendiente: Error de frontend al leer respuesta de error

- **Estado (2026-10-13)**: ⚠️ sigue abierto — `NuevaCompra.tsx:111` y
  `HistorialCompras.tsx:120` todavía leen `err.response?.data?.message`, pero el backend
  responde `{ error, timestamp }`. Los modales nuevos (`ModalProveedores`,
  `ModalCategorias`) ya leen `.error`.

> `NuevaCompra.tsx` lee `err.response?.data?.message` pero el backend
> devuelve `"error"` en el JSON. Corregir a `err.response?.data?.error`.

---

### Riesgos y correcciones pendientes del buscador de AgregarProductoCompra

- **Estado (2026-10-13)**: ⚠️ parcial — existe `searchProductos(q)` en
  `services/productoService.ts:32`, pero el autocompletado sigue usando `useProductos()`
  (20 por página). El resto de los puntos no se verificó.

> **1. Paginación limitada** — `useProductos()` trae 20 por página, el
> autocomplete muestra 7. Si hay >20 coincidencias, se pierden.
> **Fix**: usar `searchProductos(q)` o pasar `pageSize` alto.
>
> **2. Nulls en costo/margen** — `ProductoResponse.costo` y `.margen` son
> `number | null`. Se maneja con `?? 0` pero el usuario ve 0 sin contexto.
> **Fix**: placeholder o validación antes de agregar.
>
> **3. `loading` no se muestra** — No hay indicación visual durante la
> búsqueda (debounce 500ms + latencia backend).
> **Fix**: spinner en el panel de sugerencias.
>
> **4. Búsqueda diferente** — El original usaba `startsWith`, el backend
> usa `LIKE %q%` (coincidencia parcial).
> **Fix**: revisar comportamiento del backend.
>
> **5. Error preexistente** — `ConfiguracionPage.tsx:23` tiene variable
> `productos` no usada (TS6133).
> **Fix**: eliminar o usar la variable.

---

## 2026-08-27

---

#### Formulario de carga — Selects
- **Archivo**: `FormProducto.tsx`
- Los `<Select>` de categoría y proveedor ahora muestran "Seleccionar" como placeholder cuando no hay valor seleccionado (`value=""` + `<SelectValue placeholder="Seleccionar" />`).

#### Formulario de carga — Precio automático
- **Archivo**: `useCargarProducto.tsx`
- El `handleChange` ahora recalcula `precio` automáticamente cuando cambian `costo` o `margen`: `Math.round(costo * (1 + margen / 100) * 100) / 100`.
- Se eliminó el cálculo duplicado de precio en `FormProducto.tsx`.

#### Formulario de carga — Log al crear
- **Archivo**: `FormProducto.tsx`
- Después de llamar a `cargar()`, se hace `console.log("Producto creado:", values)` con los datos del formulario.

#### Tabla de productos — Refresh automático
- **Archivos**: `ProductoPage.tsx`, `FormProducto.tsx`, `TablaProductos.tsx`, `useProductos.tsx`
- `ProductoPage.tsx`: nuevo estado `refreshKey` que se incrementa después de crear un producto.
- `FormProducto.tsx`: nuevo prop `onCreated` que ejecuta `onRefresh?.()` del padre al crear.
- `TablaProductos.tsx`: recibe `refreshKey` y lo pasa a `useProductos()`. Cuando cambia, el hook re-ejecuta el fetch.
- `useProductos.tsx`: acepta `refreshKey` como parámetro y lo agrega al array de dependencias del `useEffect` que carga productos.
- `TablaProductos.tsx`: tiene `onRefresh` para pedir al padre que incremente `refreshKey` después de modificar un producto.

#### Tabla de productos — Modal de modificación
- **Archivos**: `TablaProductos.tsx`, `productoService.ts`
- `TablaProductos.tsx`: modal de modificación completo con todos los campos: barcode, nombre, costo, margen, precio (auto), categoría (select), proveedor (select), manejaLotes (checkbox). Estado controlado con `useState` para cada campo. Selects de categoría y proveedor cargados al abrir el modal. `modificarProducto()` al guardar, que hace PUT vía `productoService`. `onRefresh` como callback para avisar al padre que debe refrescar.
#### Tabla de productos — Columna Costo
- `TablaProductos.tsx`: se agregó columna "Costo" entre Nombre y Precio.
  Muestra `prod.costo` formateado como moneda.

#### Tabla de productos — Columna Cantidad (stock)
- `productoService.ts`: se agregó `getStockBatch(ids: string[])` que hace
  `POST /api/inventario/v1/stock/batch`. También se exportó la interfaz
  `StockResponse { idProducto: string; cantidad: number }`.
- `TablaProductos.tsx`:
  - Nuevo estado `stockMap: Map<string, number>`.
  - `useEffect` que llama a `getStockBatch()` con los IDs de la página
    actual cuando cambian `productos` o `refreshKey`.
  - Columna "Cantidad" que muestra `stockMap.get(prod.id) ?? "-"`.
  - `colSpan` del empty state ajustado de 6 a 7.

---

### Pendiente: Fix columna Cantidad en TablaProductos

- **Estado (2026-10-13)**: sin verificar — la columna existe en `TablaProductos.tsx` y lee
  `stockMap` vía `getStockBatch()`, pero no se corrió el flujo end-to-end para confirmar
  que muestre el stock.

> **Problema conocido**: la columna "Cantidad" de la tabla de productos no
> muestra el stock correctamente. El endpoint batch
> `POST /api/inventario/v1/stock/batch` está implementado en el backend y
> el frontend lo llama, pero la columna no muestra los valores esperados.
> Posibles causas a revisar:
>
> 1. El endpoint podría estar devolviendo una lista vacía o los IDs no
>    coinciden con los de la tabla `stock` (comparar `UUID_TO_BIN` con
>    lo que envía el frontend).
> 2. El `useEffect` de stock podría no estar disparándose correctamente
>    cuando cambia la lista de productos.
> 3. El `Map` de stock podría no estar matcheando los IDs (problema de
>    serialización UUID binario vs string).
> 4. Revisar en el navegador (DevTools > Network) si el request batch
>    llega bien y qué devuelve el backend.
>
> **Acción requerida**: revisar el flujo completo frontend → backend → DB
> para diagnosticar por qué el stock no se muestra.

---

## Anexo — Contradicciones de infraestructura de no usar zonas horarias

> El documento original vive en la raíz del proyecto como
> `problemaDateTimesZonaHoraria.md`; se incluye acá para que este changelog
> quede autocontenido.

Datos del sistema hoy (por si lo querés en el CHANGELOG): la API ya es naive (EventoSyncRequest.ocurridoEn: LocalDateTime), MySQL guarda todo como datetime(6) (ventas.fecha_cobro, sesiones_caja.fecha_apertura, created_at…), no hay config de zona en application.properties, y la zona la aporta el JVM de la máquina. O sea: la convención del sistema ya es "hora local sin offset" — este cambio alinea el front con ella, y las implicancias son estas:
1. La zona vive solo en la máquina que escribió. Un LocalDateTime sin offset no dice de qué reloj habla. Si el backend se muda a otra región o contenedor con otra TZ, todo lo histórico se reinterpreta en la nueva zona y los "días" de los informes y la ventana "anular solo hoy" se corren; no se puede recomputar porque el offset se descartó al guardar.
2. No es un instante. No identifica un punto del tiempo: no sirve para ordenar/comparar entre máquinas ni para calcular duraciones reales. Solo es correcto dentro de la misma zona.
3. Zona implícita en el contrato, sin validar. Nada documenta ni chequéa cuál es. Un equipo de caja con TZ o reloj mal configurados escribe 3 h corridos y nadie lo detecta: la venta entra, pero cae en "ayer", queda fuera de "anular solo hoy" y contamina los informes → fallo silencioso (justo lo que te pasó, en su forma visible).
4. Dos criterios de orden conviven. uuid v7 y secuencia: Date.now() son epoch-ms (zona-free, instante real) mientras que fecha_cobro/fecha_apertura son hora local: si dos dispositivos no están sincronizados, el desempate de eventos y el orden por fecha pueden discrepar.
5. Bloquea escalar a varios locales o servicios. Un contenedor en otra zona que lea la misma BD no puede interpretar esos datetime sin saber la zona del que los escribió. Habría que guardar offset o zone_id por local (hoy no se guarda ninguno).
6. Observabilidad rota. Correlacionar DB con logs de MySQL, nginx y Spring exige saber la TZ de cada uno; lo universal es UTC o offset explícito en la frontera.
7. DST. Argentina no tiene DST desde 2009, así que la asunción "local = zona fija" anda; en países con DST una hora local puede ser ambigua o inexistente y las comparaciones isAfter de validarFecha se rompen.
Cómo queda mitigado (reglas explícitas):
- Regla de operación: todos los dispositivos y el servidor con la misma zona horaria y NTP activado — es lo que hace que la tolerancia de 5 min de validarFecha tenga sentido.
- Documentar la convención en el contrato (el javadoc del DTO ya dice "Cuándo pasó en el local"; convendría fijar America/Argentina/Buenos_Aires).
- Al migrar la infraestructura (otra imagen/region): fijar time_zone en MySQL y TZ del JVM antes de abrir los datos.
- Frontera entre sistemas: preferir Z o offset explícito cuando el dato viaja; hora local naive solo en la capa de presentación. En SQLite local ya se hace así: se guardan instantes con Z y se convierte al mostrar.

