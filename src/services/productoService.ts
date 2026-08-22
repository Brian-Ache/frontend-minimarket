import api from "@/lib/api";
import type { PaginatedResponse, ProductoFiltros, ProductoResponse } from "@/types/producto";
import type { CategoriaResponse } from "@/types/categorias";
import type { ProveedorResponse } from "@/types/proveedores";

export async function getProductos(filtros: ProductoFiltros = {}): Promise<PaginatedResponse<ProductoResponse>> {
  const params = new URLSearchParams();
  if (filtros.page !== undefined) params.append("page", String(filtros.page));
  if (filtros.size !== undefined) params.append("size", String(filtros.size));
  if (filtros.categoria) params.append("categoria", filtros.categoria);
  if (filtros.proveedor) params.append("proveedor", filtros.proveedor);
  if (filtros.q) params.append("q", filtros.q);

  const { data } = await api.get<PaginatedResponse<ProductoResponse>>("/api/productos/v1", { params });
  return data;
}

export async function getProductoById(id: string): Promise<ProductoResponse> {
  const { data } = await api.get<ProductoResponse>(`/api/productos/v1/${id}`);
  return data;
}

export async function getProductoByBarcode(barcode: string): Promise<ProductoResponse> {
  const { data } = await api.get<ProductoResponse>(`/api/productos/v1/barcode/${barcode}`);
  return data;
}

export async function searchProductos(q: string): Promise<ProductoResponse[]> {
  const { data } = await api.get<ProductoResponse[]>("/api/productos/v1/search", { params: { q } });
  return data;
}

export async function getCategorias(): Promise<CategoriaResponse[]> {
  const { data } = await api.get<CategoriaResponse[]>("/api/categorias/v1");
  return data;
}

export async function getProveedores(): Promise<ProveedorResponse[]> {
  const { data } = await api.get<ProveedorResponse[]>("/api/proveedores/v1");
  return data;
}
