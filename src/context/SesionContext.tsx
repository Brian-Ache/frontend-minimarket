import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getSesionActiva,
  abrirSesion,
  cerrarSesion,
} from "@/services/cajaService";
import { useAuth } from "@/context/AuthContext";
import { getStoredUser } from "@/lib/authSession";
import { flushColaEventos } from "@/services/venta/syncService";
import {
  marcarSesionLocalCerrada,
  SQLITE_READY_EVENT,
  tieneEventosPendientesDeSesion,
} from "@/services/venta/sqliteService";
import {
  abrirSesionLocal,
  cachearSesionRemota,
  cerrarSesionLocal,
  getSesionLocal,
  type SesionLocal,
} from "@/services/venta/cajaLocalService";

interface SesionContextType {
  sesion: SesionLocal | null;
  idSesion: string | null;
  loading: boolean;
  abrir: (saldoInicial: number) => Promise<void>;
  cerrarCaja: (
    saldoReal: number,
    montoRetirado?: number,
    observaciones?: string
  ) => Promise<void>;
  cargar: () => Promise<void>;
}

const SesionContext = createContext<SesionContextType | null>(null);

function estaOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function esErrorDeRed(err: unknown): boolean {
  const conRespuesta = err as { response?: unknown };
  if (conRespuesta?.response) return false;
  return true;
}

function statusDeError(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [sesion, setSesion] = useState<SesionLocal | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);

    try {
      // [Offline] Primero el turno local: es lo único que existe si no hay red
      // o si la app se reinició después de abrir la caja sin conexión.
      const local = await getSesionLocal();
      setSesion(local);

      if (!estaOnline() || !token) return;

      // Si quedó un ABRIR_SESION/CERRAR_SESION pendiente, mandarlo antes de
      // preguntar: así el backend conoce el turno local.
      try {
        await flushColaEventos();
      } catch (error) {
        console.warn("[Sesión] No se pudo vaciar la cola antes de cargar:", error);
      }

      try {
        const remota = await getSesionActiva();

        // Dos dispositivos offline pueden haber abierto cajas distintas. Si la
        // local tiene eventos sin sincronizar, no se descarta: se perderían ventas.
        if (
          local &&
          local.id !== remota.id &&
          (await tieneEventosPendientesDeSesion(local.id))
        ) {
          console.warn(
            "[Sesión] Se conserva la sesión local: todavía tiene eventos pendientes."
          );
          setSesion(local);
          return;
        }

        setSesion(await cachearSesionRemota(remota));
      } catch (err) {
        if (esErrorDeRed(err)) {
          // Sin red: la sesión local (si existe) sigue siendo válida.
          if (local) setSesion(local);
          return;
        }

        const status = statusDeError(err);
        if (status === 400 || status === 404) {
          const actual = local ?? (await getSesionLocal());
          if (actual && (await tieneEventosPendientesDeSesion(actual.id))) {
            setSesion(actual);
          } else {
            if (actual) await marcarSesionLocalCerrada(actual.id);
            setSesion(null);
          }
          return;
        }

        console.error("[Sesión] Error al cargar sesión:", err);
        if (local) setSesion(local);
      }
    } catch (err) {
      console.error("[Sesión] Error al cargar la sesión local:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Las tablas de SQLite se crean en un efecto de App, que corre después de
  // este. Al terminar, se reintenta la carga para recuperar el turno local.
  useEffect(() => {
    const alistar = () => void cargar();
    window.addEventListener(SQLITE_READY_EVENT, alistar);
    return () => window.removeEventListener(SQLITE_READY_EVENT, alistar);
  }, [cargar]);

  const abrir = useCallback(
    async (saldoInicial: number) => {
      if (sesion) {
        throw new Error("Ya hay una caja abierta. Debés cerrarla primero.");
      }

      // El estado puede no haber terminado de cargar; SQLite es la fuente de
      // verdad para no abrir una segunda caja y pisar el turno local.
      const local = await getSesionLocal();
      if (local) {
        setSesion(local);
        throw new Error("Ya hay una caja abierta. Debés cerrarla primero.");
      }

      // El usuario puede no estar todavía en el estado de AuthContext al
      // recargar, pero sí en localStorage. Sin id no se puede armar el evento.
      const idUsuario = user?.id ?? getStoredUser()?.id;
      if (!idUsuario) {
        throw new Error("No hay un usuario autenticado para abrir la caja.");
      }

      // Sin red no se intenta el POST: se abre directo en SQLite y se encola.
      if (!estaOnline()) {
        setSesion(await abrirSesionLocal(saldoInicial, idUsuario));
        return;
      }

      try {
        const remota = await abrirSesion(saldoInicial);

        // Cachear permite seguir vendiendo si se corta la conexión o se
        // reinicia la app. Si SQLite falla, la sesión remota igual es válida.
        try {
          setSesion(await cachearSesionRemota(remota));
        } catch (error) {
          console.error("[Sesión] No se pudo cachear la sesión remota:", error);
          setSesion({ ...remota, origen: "ONLINE" });
        }
      } catch (err) {
        // Backend inalcanzable: abrir localmente. Un 400/403 real se propaga.
        if (esErrorDeRed(err)) {
          setSesion(await abrirSesionLocal(saldoInicial, idUsuario));
          return;
        }
        throw err;
      }
    },
    [sesion, user]
  );

  const cerrarCaja = useCallback(
    async (
      saldoReal: number,
      montoRetirado = 0,
      observaciones?: string
    ) => {
      const actual = sesion ?? (await getSesionLocal());
      if (!actual) {
        throw new Error("No hay una caja abierta para cerrar.");
      }

      const idUsuario = user?.id ?? actual.idUsuarioApertura;

      // Sin red: cerrar local y encolar CERRAR_SESION.
      if (!estaOnline()) {
        await cerrarSesionLocal(
          actual,
          saldoReal,
          montoRetirado,
          observaciones,
          idUsuario
        );
        setSesion(null);
        return;
      }

      try {
        // El ABRIR_SESION offline tiene que existir en el backend antes del
        // corte; si no, el turno no se encuentra.
        await flushColaEventos();

        // POST /corte cierra la sesión activa del backend, no una por id. Si
        // otra terminal abrió una caja distinta, no hay que cerrarle el turno:
        // el cierre local se encola y se resolverá cuando esa caja se cierre.
        const remota = await getSesionActiva();
        if (remota.id !== actual.id) {
          if (actual.origen === "OFFLINE") {
            await cerrarSesionLocal(
              actual,
              saldoReal,
              montoRetirado,
              observaciones,
              idUsuario
            );
          } else {
            await marcarSesionLocalCerrada(actual.id);
          }
          setSesion(null);
          return;
        }

        await cerrarSesion(saldoReal, montoRetirado, observaciones);
        await marcarSesionLocalCerrada(actual.id);
        setSesion(null);
      } catch (err) {
        // Se cortó la conexión justo ahora: cerrar local y encolar.
        if (esErrorDeRed(err)) {
          await cerrarSesionLocal(
            actual,
            saldoReal,
            montoRetirado,
            observaciones,
            idUsuario
          );
          setSesion(null);
          return;
        }

        const status = statusDeError(err);

        // Si el backend no encuentra el turno y era una apertura local, el
        // cierre también se encola: el sync lo procesa después del ABRIR.
        if (status === 400 || status === 404) {
          if (actual.origen === "OFFLINE") {
            await cerrarSesionLocal(
              actual,
              saldoReal,
              montoRetirado,
              observaciones,
              idUsuario
            );
          } else {
            await marcarSesionLocalCerrada(actual.id);
          }
          setSesion(null);
          return;
        }

        throw err;
      }
    },
    [sesion, user]
  );

  return (
    <SesionContext.Provider
      value={{
        sesion,
        idSesion: sesion?.id ?? null,
        loading,
        abrir,
        cerrarCaja,
        cargar,
      }}
    >
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const context = useContext(SesionContext);
  if (!context) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return context;
}
