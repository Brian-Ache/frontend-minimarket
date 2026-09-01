import api from "@/lib/api";

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

export async function crearCompra(usuarioId: string, request: CompraRequest): Promise<CompraResponse> {
  const { data } = await api.post<CompraResponse>("/api/compras/v1", request, {
    headers: { idUsuario: usuarioId },
  });
  return data;
}
