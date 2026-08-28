import type { CategoriaResponse } from "./categoriaResponse";
import type { ProveedorResponse } from "./proveedorResponse";

export interface ProductoResponse {
  id: string;
  nombre: string;
  barcode: string;
  precio: number;
  manejaLotes: boolean;
  costo: number | null;
  margen: number | null;
  categoria: CategoriaResponse | null;
  proveedor: ProveedorResponse | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
