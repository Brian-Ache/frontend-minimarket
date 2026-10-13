export interface ProveedorResponse {
  id: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  deletedAt?: string | null;
}
