import type { CategoriaResponse } from "./categorias";
import type { ProveedorResponse } from "./proveedores";

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

export interface ProductoFiltros {
  page?: number;
  size?: number;
  categoria?: string;
  proveedor?: string;
  q?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
