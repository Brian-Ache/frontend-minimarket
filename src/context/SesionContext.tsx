import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSesionActiva, abrirSesion, type SesionActiva } from "@/services/cajaService";

interface SesionContextType {
  sesion: SesionActiva | null;
  idSesion: string | null;
  loading: boolean;
  abrir: (saldoInicial: number) => Promise<void>;
  cerrar: () => void;
  recargar: () => Promise<void>;
}

const SesionContext = createContext<SesionContextType | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionActiva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const activa = await getSesionActiva();
      setSesion(activa);
      console.log("[Sesión] Sesión activa cargada:", activa.id);
    } catch (err: any) {
      if (err.response?.status === 400 &&
          err.response?.data?.message?.includes("No hay")) {
        console.warn("[Sesión] No hay sesión de caja abierta");
      } else {
        console.error("[Sesión] Error al cargar sesión:", err);
      }
      setSesion(null);
    } finally {
      setLoading(false);
    }
  };

  const abrir = async (saldoInicial: number) => {
    const nueva = await abrirSesion(saldoInicial);
    setSesion(nueva);
  };

  const cerrar = () => {
    setSesion(null);
  };

  const recargar = async () => {
    await cargar();
  };

  return (
    <SesionContext.Provider value={{ sesion, idSesion: sesion?.id ?? null, loading, abrir, cerrar, recargar }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const context = useContext(SesionContext);
  if (!context) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return context;
}
