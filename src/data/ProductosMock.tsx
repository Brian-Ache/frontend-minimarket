export interface ProductoBase {
  id: number;
  nombre: string;
  precio: number;
}

export const PRODUCTOS_DB: ProductoBase[] = [
  { id: 1, nombre: "Coca Cola 1.5L", precio: 2500 },
  { id: 2, nombre: "Papas Fritas 200g", precio: 1800 },
  { id: 3, nombre: "Chicles Menta", precio: 500 },
  { id: 4, nombre: "Alfajor de Chocolate", precio: 1200 },
  { id: 5, nombre: "Agua Mineral 500ml", precio: 900 },
  { id: 6, nombre: "Pan Lactal", precio: 3200 },
  { id: 7, nombre: "Mermelada de Frutilla", precio: 2100 },
  { id: 8, nombre: "Manteca 200g", precio: 1500 },
  { id: 9, nombre: "Cerveza Lata 473ml", precio: 1800 },
  { id: 10, nombre: "Leche Entera 1L", precio: 1300 }
];