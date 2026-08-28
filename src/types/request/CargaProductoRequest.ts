export interface CargaProductoRequest {
  barcode: string;
  nombre: string;
  precio: number;
  manejaLotes: boolean;
  costo: number;
  margen: number;
  idCategoria: string | null;
  idProveedor: string | null;
}