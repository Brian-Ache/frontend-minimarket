import api from "@/lib/api";

export type RolInvitacion = "ADMIN" | "EMPLEADO";

export interface InvitarUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  username?: string;
  rol?: RolInvitacion;
}

export interface UsuarioResponse {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: string;
  estado: string;
}

/**
 * Alta por invitación (único camino de alta del sistema): crea la cuenta en estado
 * PENDIENTE y le manda un mail a la persona para que defina su propia contraseña.
 * Requiere rol ADMIN (el SUPERADMIN también pasa por hasRole('ADMIN')).
 * Solo se invita por debajo del propio nivel: SUPERADMIN → ADMIN|EMPLEADO, ADMIN → EMPLEADO.
 */
export async function invitarUsuario(request: InvitarUsuarioRequest): Promise<UsuarioResponse> {
  const { data } = await api.post<UsuarioResponse>("/api/users/v1/invitaciones", request);
  return data;
}
