import api from "@/lib/api";

export interface InvitacionInfo {
  nombre: string;
  apellido: string;
  email: string;
  usernameSugerido: string;
}

/** GET público: no consume el token, sirve para validar el enlace antes de llenar el form. */
export async function consultarInvitacion(token: string): Promise<InvitacionInfo> {
  const { data } = await api.get<InvitacionInfo>("/api/auth/v1/invitacion", {
    params: { token },
  });
  return data;
}

export interface AceptarInvitacionPayload {
  token: string;
  password: string;
  username?: string;
}

/**
 * Cierra el alta: define la contraseña (min 8, max 72 bytes) y pasa la cuenta a ACTIVO.
 * No devuelve sesión: después hay que loguearse normal.
 */
export async function aceptarInvitacion(payload: AceptarInvitacionPayload): Promise<void> {
  await api.post("/api/auth/v1/invitacion/aceptar", payload);
}
