// src/data/ticketsMock.ts

// Primero exportamos el tipo si lo tienes definido
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Ticket {
  id: number;
  productos: Producto[];
}

// Exportamos la constante con los datos hardcodeados
export const TICKETS_INICIALES: Ticket[] = [
  {
    id: 1,
    productos: [
      { id: 1, nombre: "Coca Cola 1.5L", precio: 2500, cantidad: 2 },
      { id: 2, nombre: "Papas Fritas 200g", precio: 1800, cantidad: 1 },
      { id: 3, nombre: "Chicles Menta", precio: 500, cantidad: 3 },
      { id: 4, nombre: "Alfajor de Chocolate", precio: 1200, cantidad: 1 },
      { id: 5, nombre: "Agua Mineral 500ml", precio: 900, cantidad: 2 },
    ],
  },
  {
    id: 2,
    productos: [
      { id: 6, nombre: "Pan Lactal", precio: 3200, cantidad: 1 },
      { id: 7, nombre: "Mermelada de Frutilla", precio: 2100, cantidad: 1 },
      { id: 8, nombre: "Manteca 200g", precio: 1500, cantidad: 1 },
    ],
  },
  {
    id: 3,
    productos: [
      { id: 9, nombre: "Cerveza Lata 473ml", precio: 1800, cantidad: 6 },
      { id: 10, nombre: "Carbón 4kg", precio: 4500, cantidad: 1 },
    ],
  },
  {
    id: 4,
    productos: [
      { id: 11, nombre: "Leche Entera 1L", precio: 1300, cantidad: 4 },
      { id: 12, nombre: "Yogur con Cereales", precio: 1100, cantidad: 2 },
      { id: 13, nombre: "Queso Crema 300g", precio: 2800, cantidad: 1 },
      { id: 14, nombre: "Galletitas Dulces", precio: 950, cantidad: 3 },
    ],
  },
  {
    id: 5,
    productos: [
      { id: 15, nombre: "Cigarrillos Box", precio: 3500, cantidad: 1 },
    ],
  },
];