import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  consultarInvitacion,
  aceptarInvitacion,
  type InvitacionInfo,
} from "@/services/authService";

export default function PageInvitacion() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [info, setInfo] = useState<InvitacionInfo | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "invalido">("cargando");
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [activada, setActivada] = useState(false);

  useEffect(() => {
    if (!token) {
      setEstado("invalido");
      return;
    }
    consultarInvitacion(token)
      .then((data) => {
        setInfo(data);
        setUsername(data.usernameSugerido);
        setEstado("ok");
      })
      .catch((err) => {
        setErrorInfo(err.response?.data?.error || "La invitación ya no es válida");
        setEstado("invalido");
      });
  }, [token]);

  const bytes = (s: string) => new TextEncoder().encode(s).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (password.length < 8) {
      setErrorForm("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (bytes(password) > 72) {
      setErrorForm("La contraseña es demasiado larga (máximo 72 bytes)");
      return;
    }
    if (password !== confirmar) {
      setErrorForm("Las contraseñas no coinciden");
      return;
    }

    setEnviando(true);
    try {
      await aceptarInvitacion({
        token,
        password,
        ...(username.trim() ? { username: username.trim() } : {}),
      });
      setActivada(true);
    } catch (err: any) {
      setErrorForm(err.response?.data?.error || "No se pudo aceptar la invitación");
    } finally {
      setEnviando(false);
    }
  };

  if (estado === "cargando") {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-slate-500 text-sm">Cargando invitación...</p>
      </div>
    );
  }

  if (estado === "invalido") {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col gap-3 w-80 text-center">
          <h1 className="text-2xl font-bold">Invitación no válida</h1>
          <p className="text-red-500 text-sm">{errorInfo}</p>
          <p className="text-slate-500 text-xs">
            Puede haber vencido (72 h), ya haberse usado, o la cuenta cambió de estado.
            Pedile al administrador que la reenvíe.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Ir a iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (activada) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col gap-3 w-80 text-center">
          <h1 className="text-2xl font-bold">Cuenta activada</h1>
          <p className="text-slate-500 text-sm">
            Ya podés iniciar sesión con tu usuario y la contraseña que acabás de definir.
          </p>
          <Link to="/login">
            <Button className="w-full">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-center">Aceptar invitación</h1>
        <p className="text-slate-500 text-sm text-center">
          Hola {info?.nombre} {info?.apellido} — {info?.email}
          <br />
          Definí tu contraseña para activar tu cuenta.
        </p>

        {errorForm && (
          <p className="text-red-500 text-sm text-center">{errorForm}</p>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="username" className="text-slate-600">
            Nombre de usuario (opcional)
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="password" className="text-slate-600">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="confirmar" className="text-slate-600">
            Repetir contraseña
          </Label>
          <Input
            id="confirmar"
            type="password"
            placeholder="Repetí la contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={enviando}>
          {enviando ? "Activando..." : "Activar cuenta"}
        </Button>
      </form>
    </div>
  );
}
