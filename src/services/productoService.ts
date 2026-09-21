import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/response/paginatedResponse";
import type { ProductoResponse } from "@/types/response/productoResponse";
import type { CategoriaResponse } from "@/types/response/categoriaResponse";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";
import type { ProductoFiltros } from "@/types/request/productoFiltrosRequest";
import type { CargaProductoRequest } from "@/types/request/CargaProductoRequest";


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
  const { data } = await api.get<PaginatedResponse<CategoriaResponse>>("/api/categorias/v1");
  return data.content;
}

export async function getProveedores(): Promise<ProveedorResponse[]> {
  const { data } = await api.get<PaginatedResponse<ProveedorResponse>>("/api/proveedores/v1");
  return data.content;
}

export async function crearProducto(producto: CargaProductoRequest, idUsuario: string): Promise<ProductoResponse> {
  const { data } = await api.post<ProductoResponse>(
    "/api/productos/v1",
    producto,
    {
      headers: { idUsuario },
    }
  );
  return data;
}

//modifica caualquier campo del producto menos el stock
export async function modificarProducto(id: string, producto: CargaProductoRequest): Promise<ProductoResponse> {
  const { data } = await api.put<ProductoResponse>(`/api/productos/v1/${id}`, producto);
  return data;
}

//elimina un producto por su id (soft delete)
export async function eliminarProducto(id: string): Promise<void> {
  await api.delete(`/api/productos/v1/${id}`);
}

//modifica el stock de un producto cambia el valor viejo por el nuevo valor
export async function controlarStock(idProducto: string, stockReal: number, idUsuario: string): Promise<void> {
  await api.post("/api/inventario/v1/controlar", { idProducto, stockReal, tipo: "AJUSTE" }, { headers: { idUsuario } });
}

export interface StockResponse {
  idProducto: string;
  cantidad: number;
}

export async function getStockBatch(ids: string[]): Promise<StockResponse[]> {
  if (ids.length === 0) return [];
  const { data } = await api.post<StockResponse[]>("/api/inventario/v1/stock/batch", ids);
  return data;
}
