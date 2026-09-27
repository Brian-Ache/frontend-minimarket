import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSesionActiva, abrirSesion, type SesionActiva } from "@/services/cajaService";

interface SesionContextType {
  sesion: SesionActiva | null;
  haySesion: boolean;
  idSesion: string | null;
  loading: boolean;
  abrir: (saldoInicial: number) => Promise<void>;
  cerrar: () => void;
  recargar: () => Promise<void>;
}

const SesionContext = createContext<SesionContextType | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionActiva | null>(null);
  const [haySesion, setHaySesion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const activa = await getSesionActiva();
      setSesion(activa);
      setHaySesion(true);
      console.log("[Sesión] Sesión activa cargada:", activa.id);
    } catch (err: any) {
      if (err.response?.status === 400 &&
          err.response?.data?.error?.includes("No hay")) {
        console.warn("[Sesión] No hay sesión de caja abierta");
        setHaySesion(false);
      } else if (err.response?.status === 400 &&
                 err.response?.data?.error?.includes("Ya existe")) {
        console.warn("[Sesión] Ya existe una sesión de caja abierta");
        setHaySesion(true);
      } else {
        console.error("[Sesión] Error al cargar sesión:", err);
        setHaySesion(false);
      }
      setSesion(null);
    } finally {
      setLoading(false);
    }
  };

  const abrir = async (saldoInicial: number) => {
    const nueva = await abrirSesion(saldoInicial);
    setSesion(nueva);
    setHaySesion(true);
  };

  const cerrar = () => {
    setSesion(null);
    setHaySesion(false);
  };

  const recargar = async () => {
    await cargar();
  };

  return (
    <SesionContext.Provider value={{ sesion, haySesion, idSesion: sesion?.id ?? null, loading, abrir, cerrar, recargar }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const context = useContext(SesionContext);
  if (!context) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return context;
}
