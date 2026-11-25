import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/response/paginatedResponse";

export interface DetalleVenta {
  idProducto: string | null;
  nombre: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  tipo: string | null;
  costoUnitario: number | null;
}

export interface Venta {
  id: string;
  fecha: string;
  total: number;
  cobrada: boolean | null;
  fechaCobro: string | null;
  metodoPago: string | null;
  montoRecibido: number | null;
  origen: string | null;
  requiereRevision: boolean;
  detalles: DetalleVenta[];
}

/** Ventas en un rango de fechas (ISO naive local, sin Z). El alcance lo decide el backend. */
export async function getVentasPorFecha(
  desde: string,
  hasta: string,
  page = 0,
  size = 100
): Promise<Venta[]> {
  const { data } = await api.get<PaginatedResponse<Venta>>("/api/ventas/v1/fecha", {
    params: { desde, hasta, page, size },
  });
  return data.content;
}

/** Todas las ventas del rango, paginando de a 100 (techo del backend). */
export async function getVentasPorFechaCompleto(
  desde: string,
  hasta: string
): Promise<Venta[]> {
  const size = 100;
  const todas: Venta[] = [];
  let page = 0;

  while (true) {
    const { data } = await api.get<PaginatedResponse<Venta>>("/api/ventas/v1/fecha", {
      params: { desde, hasta, page, size },
    });

    todas.push(...data.content);

    if (data.content.length === 0 || page + 1 >= data.totalPages) break;
    page++;
  }

  return todas;
}

export async function anularVenta(id: string): Promise<void> {
  await api.delete(`/api/ventas/v1/${id}`);
}

/** Desglose de ventas por método de pago de un día. fecha: YYYY-MM-DD local. */
export interface ResumenVentas {
  fecha: string;
  cantidadVentas: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
}

export async function getResumenDiarioVentas(fecha: string): Promise<ResumenVentas> {
  const { data } = await api.get<ResumenVentas>("/api/ventas/v1/resumen/diario", {
    params: { fecha },
  });
  return data;
}
