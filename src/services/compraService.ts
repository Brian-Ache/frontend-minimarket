import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/response/paginatedResponse";

export interface DetalleCompraRequest {
  idProducto: string;
  precioUnitario: number;
  cantidad: number;
  margen?: number | null;
  precioVenta?: number | null;
  fechaVencimiento?: string | null;
  numeroLote?: string | null;
}

export interface CompraRequest {
  detalle: DetalleCompraRequest[];
  idProveedor?: string | null;
  tipoComprobante?: string | null;
  nroComprobante?: string | null;
  observaciones?: string | null;
  idSesion?: string | null;
}

export interface CompraResponse {
  id: string;
  fecha: string;
  total: number;
  detalle: any[];
  proveedor: any | null;
  tipoComprobante: string | null;
  nroComprobante: string | null;
  observaciones: string | null;
}

export interface CompraFiltros {
  page?: number;
  size?: number;
  proveedor?: string;
  tipoComprobante?: string;
  desde?: string;
  hasta?: string;
  sortTotal?: "asc" | "desc";
}

export async function crearCompra(usuarioId: string, request: CompraRequest): Promise<CompraResponse> {
  const { data } = await api.post<CompraResponse>("/api/compras/v1", request, {
    headers: { idUsuario: usuarioId },
  });
  return data;
}

export async function getCompras(filtros: CompraFiltros = {}): Promise<PaginatedResponse<CompraResponse>> {
  const params = new URLSearchParams();
  if (filtros.page !== undefined) params.append("page", String(filtros.page));
  if (filtros.size !== undefined) params.append("size", String(filtros.size));
  if (filtros.proveedor) params.append("proveedor", filtros.proveedor);
  if (filtros.tipoComprobante) params.append("tipoComprobante", filtros.tipoComprobante);
  if (filtros.desde) params.append("desde", filtros.desde);
  if (filtros.hasta) params.append("hasta", filtros.hasta);
  if (filtros.sortTotal) params.append("sortTotal", filtros.sortTotal);
  const { data } = await api.get<PaginatedResponse<CompraResponse>>("/api/compras/v1", { params });
  return data;
}

export async function eliminarCompra(id: string, idUsuario: string): Promise<void> {
  await api.delete(`/api/compras/v1/${id}`, {
    headers: { idUsuario },
  });
}
