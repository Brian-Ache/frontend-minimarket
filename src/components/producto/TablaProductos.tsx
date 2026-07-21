import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  margen: number;
  precio: number;
  categoria: string;
  proveedor: string;
  cantidad: number;
};

// 👉 mock temporal
export const productosMock: Producto[] = [
  { id: 1, codigo: "7790001001", nombre: "Coca Cola Sabor Original 2.25L", margen: 30, precio: 3200, categoria: "Bebidas", proveedor: "Femsa Argentina", cantidad: 48 },
  { id: 2, codigo: "7790001002", nombre: "Coca Cola Sin Azúcar 1.5L", margen: 30, precio: 2400, categoria: "Bebidas", proveedor: "Femsa Argentina", cantidad: 36 },
  { id: 3, codigo: "7790001003", nombre: "Sprite Lima Limón 2.25L", margen: 28, precio: 3000, categoria: "Bebidas", proveedor: "Femsa Argentina", cantidad: 24 },
  { id: 4, codigo: "7790001004", nombre: "Fanta Naranja 2L", margen: 28, precio: 2900, categoria: "Bebidas", proveedor: "Femsa Argentina", cantidad: 18 },
  { id: 5, codigo: "7790002001", nombre: "Pepsi Black 1.5L", margen: 32, precio: 2100, categoria: "Bebidas", proveedor: "Cervecería y Maltería Quilmes", cantidad: 30 },
  { id: 6, codigo: "7790002002", nombre: "Agua Mineral Villavicencio Sin Gas 1.5L", margen: 40, precio: 1200, categoria: "Bebidas", proveedor: "Aguas Danone", cantidad: 60 },
  { id: 7, codigo: "7790002003", nombre: "Agua Saborizada Levité Naranja 1.5L", margen: 35, precio: 1600, categoria: "Bebidas", proveedor: "Aguas Danone", cantidad: 42 },
  { id: 8, codigo: "7790002004", nombre: "Cerveza Quilmes Clásica 1L Retornable", margen: 25, precio: 2500, categoria: "Bebidas Con Alcohol", proveedor: "Cervecería y Maltería Quilmes", cantidad: 72 },
  { id: 9, codigo: "7790002005", nombre: "Cerveza Stella Artois Lata 473ml", margen: 30, precio: 1900, categoria: "Bebidas Con Alcohol", proveedor: "Cervecería y Maltería Quilmes", cantidad: 96 },
  { id: 10, codigo: "7790002006", nombre: "Fernet Branca 750ml", margen: 22, precio: 11500, categoria: "Bebidas Con Alcohol", proveedor: "Fratelli Branca", cantidad: 15 },

  { id: 11, codigo: "7790003001", nombre: "Leche Entera La Serenísima 1L Sachet", margen: 18, precio: 1350, categoria: "Lácteos", proveedor: "Mastellone Hermanos", cantidad: 40 },
  { id: 12, codigo: "7790003002", nombre: "Leche Descremada Ilolay 1L Tetra", margen: 20, precio: 1400, categoria: "Lácteos", proveedor: "Ilolay", cantidad: 35 },
  { id: 13, codigo: "7790003003", nombre: "Yogur Bebible Entero Milkaut Frutilla 1kg", margen: 25, precio: 2100, categoria: "Lácteos", proveedor: "Milkaut", cantidad: 20 },
  { id: 14, codigo: "7790003004", nombre: "Manteca La Serenísima 200g", margen: 22, precio: 2800, categoria: "Lácteos", proveedor: "Mastellone Hermanos", cantidad: 25 },
  { id: 15, codigo: "7790003005", nombre: "Crema de Leche Milkaut 200ml", margen: 24, precio: 2300, categoria: "Lácteos", proveedor: "Milkaut", cantidad: 18 },
  { id: 16, codigo: "7790003006", nombre: "Queso Crema Finlandia Clásico 300g", margen: 28, precio: 3600, categoria: "Lácteos", proveedor: "Mastellone Hermanos", cantidad: 14 },
  { id: 17, codigo: "7790003007", nombre: "Doble Crema Queso Cremoso por Kg", margen: 30, precio: 7800, categoria: "Fiambrería", proveedor: "Distribuidora Luro", cantidad: 8 },
  { id: 18, codigo: "7790003008", nombre: "Queso Tybo Barra Paladini por Kg", margen: 32, precio: 9200, categoria: "Fiambrería", proveedor: "Paladini", cantidad: 6 },
  { id: 19, codigo: "7790003009", nombre: "Jamón Cocido Cocido Paladini por Kg", margen: 35, precio: 10500, categoria: "Fiambrería", proveedor: "Paladini", cantidad: 5 },
  { id: 20, codigo: "7790003010", nombre: "Paleta Sangucheira Cabaña Argentina por Kg", margen: 35, precio: 6400, categoria: "Fiambrería", proveedor: "Distribuidora Luro", cantidad: 7 },

  { id: 21, codigo: "7790004001", nombre: "Pan Lactal Blanco Mesa 560g", margen: 30, precio: 2600, categoria: "Panadería", proveedor: "Bimbo Argentina", cantidad: 22 },
  { id: 22, codigo: "7790004002", nombre: "Pan para Hamburguesas Bimbo 4 u.", margen: 28, precio: 1900, categoria: "Panadería", proveedor: "Bimbo Argentina", cantidad: 30 },
  { id: 23, codigo: "7790004003", nombre: "Tostadas Riera Clásicas 200g", margen: 32, precio: 1450, categoria: "Panadería", proveedor: "Riera", cantidad: 40 },
  { id: 24, codigo: "7790004004", nombre: "Galletitas Chocolinas 170g", margen: 35, precio: 1250, categoria: "Almacén", proveedor: "Bagley", cantidad: 80 },
  { id: 25, codigo: "7790004005", nombre: "Galletitas Criollitas 3x100g", margen: 28, precio: 1600, categoria: "Almacén", proveedor: "Bagley", cantidad: 50 },
  { id: 26, codigo: "7790004006", nombre: "Galletitas Oreo Original 118g", margen: 35, precio: 1400, categoria: "Almacén", proveedor: "Mondelēz International", cantidad: 65 },
  { id: 27, codigo: "7790004007", nombre: "Galletitas Traviata 101g", margen: 30, precio: 850, categoria: "Almacén", proveedor: "Bagley", cantidad: 45 },
  { id: 28, codigo: "7790004008", nombre: "Bizcochos Don Satúr Grasos 200g", margen: 40, precio: 1100, categoria: "Almacén", proveedor: "Don Satúr", cantidad: 100 },
  { id: 29, codigo: "7790004009", nombre: "Galletitas Pepitos 119g", margen: 33, precio: 1350, categoria: "Almacén", proveedor: "Mondelēz International", cantidad: 55 },
  { id: 30, codigo: "7790004010", nombre: "Galletitas Sonrisas 108g", margen: 35, precio: 1150, categoria: "Almacén", proveedor: "Bagley", cantidad: 40 },

  { id: 31, codigo: "7790005001", nombre: "Aceite de Girasol Natura 900ml", margen: 20, precio: 2200, categoria: "Almacén", proveedor: "AGD (Aceitera General Deheza)", cantidad: 36 },
  { id: 32, codigo: "7790005002", nombre: "Aceite de Oliva Cañuelas 500ml", margen: 28, precio: 6800, categoria: "Almacén", proveedor: "Molinos Río de la Plata", cantidad: 12 },
  { id: 33, codigo: "7790005003", nombre: "Arroz Lucchetti Parboil 1kg", margen: 30, precio: 2100, categoria: "Almacén", proveedor: "Molinos Río de la Plata", cantidad: 40 },
  { id: 34, codigo: "7790005004", nombre: "Fideos Matarazzo Tallarín 500g", margen: 32, precio: 1300, categoria: "Almacén", proveedor: "Molinos Río de la Plata", cantidad: 60 },
  { id: 35, codigo: "7790005005", nombre: "Fideos Lucchetti Moñitos 500g", margen: 30, precio: 1200, categoria: "Almacén", proveedor: "Molinos Río de la Plata", cantidad: 50 },
  { id: 36, codigo: "7790005006", nombre: "Puré de Tomate Noel 520g Tetra", margen: 35, precio: 800, categoria: "Almacén", proveedor: "Arcor", cantidad: 70 },
  { id: 37, codigo: "7790005007", nombre: "Harina de Trigo Favorita 0000 1kg", margen: 25, precio: 1100, categoria: "Almacén", proveedor: "Molinos Río de la Plata", cantidad: 45 },
  { id: 38, codigo: "7790005008", nombre: "Harina Leudante Pureza 1kg", margen: 28, precio: 1400, categoria: "Almacén", proveedor: "Molinos Cañuelas", cantidad: 35 },
  { id: 39, codigo: "7790005009", nombre: "Azúcar Ledesma Clasica 1kg", margen: 18, precio: 1250, categoria: "Almacén", proveedor: "Ledesma", cantidad: 80 },
  { id: 40, codigo: "7790005010", nombre: "Sal Fina Celusal 500g Parillera", margen: 35, precio: 950, categoria: "Almacén", proveedor: "Celusal", cantidad: 30 },

  { id: 41, codigo: "7790006001", nombre: "Yerba Mate Playadito 500g", margen: 22, precio: 2900, categoria: "Almacén", proveedor: "Cooperativa Liebig", cantidad: 50 },
  { id: 42, codigo: "7790006002", nombre: "Yerba Mate Taragüí Con Palo 500g", margen: 22, precio: 2700, categoria: "Almacén", proveedor: "Las Marías", cantidad: 40 },
  { id: 43, codigo: "7790006003", nombre: "Yerba Mate Mañanita 500g", margen: 25, precio: 2400, categoria: "Almacén", proveedor: "Las Marías", cantidad: 30 },
  { id: 44, codigo: "7790006004", nombre: "Café Instantáneo Dolca Suave 170g", margen: 30, precio: 5400, categoria: "Almacén", proveedor: "Nestlé Argentina", cantidad: 15 },
  { id: 45, codigo: "7790006005", nombre: "Café Molido La Virginia Clásico 250g", margen: 28, precio: 4200, categoria: "Almacén", proveedor: "La Virginia", cantidad: 20 },
  { id: 46, codigo: "7790006006", nombre: "Té Taragüí Saquitos 25 u.", margen: 35, precio: 900, categoria: "Almacén", proveedor: "Las Marías", cantidad: 35 },
  { id: 47, codigo: "7790006007", nombre: "Mate Cocido Taragüí Saquitos 25 u.", margen: 35, precio: 880, categoria: "Almacén", proveedor: "Las Marías", cantidad: 30 },
  { id: 48, codigo: "7790006008", nombre: "Cacao en Polvo Nesquik 300g", margen: 30, precio: 2800, categoria: "Almacén", proveedor: "Nestlé Argentina", cantidad: 25 },
  { id: 49, codigo: "7790006009", nombre: "Mermelada Arcor Frutilla 390g Frasco", margen: 32, precio: 2200, categoria: "Almacén", proveedor: "Arcor", cantidad: 18 },
  { id: 50, codigo: "7790006010", nombre: "Dulce de Leche La Serenísima Estilo Colonial 400g", margen: 28, precio: 2600, categoria: "Almacén", proveedor: "Mastellone Hermanos", cantidad: 24 },

  { id: 51, codigo: "7790007001", nombre: "Mayonesa Natura Doypack 500g", margen: 30, precio: 1850, categoria: "Almacén", proveedor: "AGD (Aceitera General Deheza)", cantidad: 45 },
  { id: 52, codigo: "7790007002", nombre: "Ketchup Hellmanns Doypack 250g", margen: 32, precio: 1500, categoria: "Almacén", proveedor: "Unilever Argentina", cantidad: 28 },
  { id: 53, codigo: "7790007003", nombre: "Mostaza Savora Original Doypack 250g", margen: 35, precio: 1200, categoria: "Almacén", proveedor: "Unilever Argentina", cantidad: 32 },
  { id: 54, codigo: "7790007004", nombre: "Salsa de Soja Dos Anclas 200ml", margen: 40, precio: 1750, categoria: "Almacén", proveedor: "Dos Anclas", cantidad: 12 },
  { id: 55, codigo: "7790007005", nombre: "Vinagre de Alcohol Menoyo 500ml", margen: 38, precio: 850, categoria: "Almacén", proveedor: "Menoyo", cantidad: 20 },

  { id: 56, codigo: "7790008001", nombre: "Papel Higiénico Higienol Rinde Rendidor 4 Rullos", margen: 30, precio: 2900, categoria: "Limpieza", proveedor: "Softys Argentina", cantidad: 30 },
  { id: 57, codigo: "7790008002", nombre: "Rollos de Cocina Sussex 3 Rollos 200 Paños", margen: 32, precio: 2500, categoria: "Limpieza", proveedor: "Grandes Marcas", cantidad: 25 },
  { id: 58, codigo: "7790008003", nombre: "Detergente Magistral Multiuso Limón 300ml", margen: 28, precio: 2100, categoria: "Limpieza", proveedor: "Procter & Gamble", cantidad: 35 },
  { id: 59, codigo: "7790008004", nombre: "Lavandina Ayudín Clásica 1L", margen: 35, precio: 1100, categoria: "Limpieza", proveedor: "Clorox Argentina", cantidad: 50 },
  { id: 60, codigo: "7790008005", nombre: "Limpiador de Pisos Poett Primavera 900ml", margen: 35, precio: 1400, categoria: "Limpieza", proveedor: "Clorox Argentina", cantidad: 40 },
  { id: 61, codigo: "7790008006", nombre: "Jabón En Polvo Ala Multiacción 800g", margen: 25, precio: 2800, categoria: "Limpieza", proveedor: "Unilever Argentina", cantidad: 20 },
  { id: 62, codigo: "7790008007", nombre: "Suavizante para Ropa Vivere Clásico 900ml", margen: 28, precio: 2400, categoria: "Limpieza", proveedor: "Unilever Argentina", cantidad: 18 },
  { id: 63, codigo: "7790008008", nombre: "Jabón de Glicerina Lapeche 3x90g", margen: 35, precio: 1650, categoria: "Perfumería", proveedor: "Alicorp", cantidad: 15 },
  { id: 64, codigo: "7790008009", nombre: "Shampoo Sedal Restauración 340ml", margen: 30, precio: 3100, categoria: "Perfumería", proveedor: "Unilever Argentina", cantidad: 22 },
  { id: 65, codigo: "7790008010", nombre: "Acondicionador Sedal Restauración 340ml", margen: 30, precio: 3100, categoria: "Perfumería", proveedor: "Unilever Argentina", cantidad: 18 },

  { id: 66, codigo: "7790009001", nombre: "Desodorante Axe Black Aerosol 150ml", margen: 32, precio: 3400, categoria: "Perfumería", proveedor: "Unilever Argentina", cantidad: 24 },
  { id: 67, codigo: "7790009002", nombre: "Desodorante Rexona Odorono Crema 60g", margen: 35, precio: 2200, categoria: "Perfumería", proveedor: "Unilever Argentina", cantidad: 16 },
  { id: 68, codigo: "7790009003", nombre: "Crema Dental Colgate Total 12 90g", margen: 28, precio: 2600, categoria: "Perfumería", proveedor: "Colgate-Palmolive", cantidad: 30 },
  { id: 69, codigo: "7790009004", nombre: "Jabon de Tocador Rexona Fresh 3x90g", margen: 30, precio: 1950, categoria: "Perfumería", proveedor: "Unilever Argentina", cantidad: 25 },
  { id: 70, codigo: "7790009005", nombre: "Protectores Diarios Nosotras 20 u.", margen: 35, precio: 1800, categoria: "Perfumería", proveedor: "Essity", cantidad: 20 },

  { id: 71, codigo: "7790010001", nombre: "AlfaJor Jorgito Negro 60g", margen: 45, precio: 800, categoria: "Golosinas", proveedor: "Jorgito", cantidad: 120 },
  { id: 72, codigo: "7790010002", nombre: "Alfajor Guaymallén Blanco 38g", margen: 50, precio: 450, categoria: "Golosinas", proveedor: "Guaymallén", cantidad: 150 },
  { id: 73, codigo: "7790010003", nombre: "Alfajor Havanna Mixto 60g", margen: 35, precio: 1800, categoria: "Golosinas", proveedor: "Havanna", cantidad: 40 },
  { id: 74, codigo: "7790010004", nombre: "Chocolate Tita 18g", margen: 45, precio: 400, categoria: "Golosinas", proveedor: "Mondelēz International", cantidad: 90 },
  { id: 75, codigo: "7790010005", nombre: "Chocolate Rhodesia 22g", margen: 45, precio: 450, categoria: "Golosinas", proveedor: "Mondelēz International", cantidad: 85 },
  { id: 76, codigo: "7790010006", nombre: "Oblea Bon o Bon Leche 15g", margen: 50, precio: 350, categoria: "Golosinas", proveedor: "Arcor", cantidad: 100 },
  { id: 77, codigo: "7790010007", nombre: "Caramelos Butter Toffes Arcor 100g", margen: 40, precio: 1200, categoria: "Golosinas", proveedor: "Arcor", cantidad: 30 },
  { id: 78, codigo: "7790010008", nombre: "Chicles Beldent Menta Fuerte 10 u.", margen: 45, precio: 650, categoria: "Golosinas", proveedor: "Mondelēz International", cantidad: 110 },
  { id: 79, codigo: "7790010009", nombre: "Chupetin Evolution Pops Arcor", margen: 55, precio: 250, categoria: "Golosinas", proveedor: "Arcor", cantidad: 200 },
  { id: 80, codigo: "7790010010", nombre: "Chocolate Cadbury Leche 80g", margen: 38, precio: 2300, categoria: "Golosinas", proveedor: "Mondelēz International", cantidad: 30 },

  { id: 81, codigo: "7790011001", nombre: "Papas Fritas Lays Clásicas 85g", margen: 35, precio: 1900, categoria: "Snacks", proveedor: "PepsiCo Alimentos", cantidad: 40 },
  { id: 82, codigo: "7790011002", nombre: "Papas Fritas Krachitos Corte Tradicional 90g", margen: 40, precio: 1400, categoria: "Snacks", proveedor: "Krachitos", cantidad: 35 },
  { id: 83, codigo: "7790011003", nombre: "Doritos Queso Nacho 90g", margen: 35, precio: 2100, categoria: "Snacks", proveedor: "PepsiCo Alimentos", cantidad: 25 },
  { id: 84, codigo: "7790011004", nombre: "Mani con Sal Pehuamar 120g", margen: 42, precio: 1100, categoria: "Snacks", proveedor: "PepsiCo Alimentos", cantidad: 50 },
  { id: 85, codigo: "7790011005", nombre: "Palitos Salados Saladix 90g", margen: 38, precio: 950, categoria: "Snacks", proveedor: "Arcor", cantidad: 60 },

  { id: 86, codigo: "7790012001", nombre: "Hamburguesas Paty Finitas 4 u.", margen: 25, precio: 3800, categoria: "Congelados", proveedor: "Marfrig Argentina", cantidad: 15 },
  { id: 87, codigo: "7790012002", nombre: "Papas Congeladas Mc Cain Tradicionales 720g", margen: 30, precio: 3400, categoria: "Congelados", proveedor: "McCain Argentina", cantidad: 12 },
  { id: 88, codigo: "7790012003", nombre: "Nuggets de Pollo Sadia 400g", margen: 28, precio: 3900, categoria: "Congelados", proveedor: "BRF Argentina", cantidad: 10 },
  { id: 89, codigo: "7790012004", nombre: "Tapas para Empanadas La Salteña Hoja 12 u.", margen: 32, precio: 1400, categoria: "Lácteos y Frescos", proveedor: "Molinos Río de la Plata", cantidad: 30 },
  { id: 90, codigo: "7790012005", nombre: "Pascualina Hojaldre La Salteña 2 u.", margen: 30, precio: 1650, categoria: "Lácteos y Frescos", proveedor: "Molinos Río de la Plata", cantidad: 25 },

  { id: 91, codigo: "7790013001", nombre: "Cigarrillos Marlboro Red Box 20", margen: 12, precio: 3200, categoria: "Cigarrillos", proveedor: "Massalin Particulares", cantidad: 100 },
  { id: 92, codigo: "7790013002", nombre: "Cigarrillos Philip Morris Box 20", margen: 12, precio: 2900, categoria: "Cigarrillos", proveedor: "Massalin Particulares", cantidad: 90 },
  { id: 93, codigo: "7790013003", nombre: "Encendedor BIC Grande", margen: 45, precio: 1200, categoria: "Kiosco", proveedor: "BIC Argentina", cantidad: 80 },
  { id: 94, codigo: "7790013004", nombre: "Pilas Duracell AA 2 u.", margen: 38, precio: 3200, categoria: "Kiosco", proveedor: "Duracell", cantidad: 25 },
  { id: 95, codigo: "7790013005", nombre: "Esponja de Bronce Virulana 1 u.", margen: 40, precio: 850, categoria: "Limpieza", proveedor: "Grandes Marcas", cantidad: 40 },
  { id: 96, codigo: "7790013006", nombre: "Bolsas de Residuos Asuncion 45x60 10 u.", margen: 42, precio: 1100, categoria: "Limpieza", proveedor: "Distribuidora Luro", cantidad: 35 },
  { id: 97, codigo: "7790013007", nombre: "Fósforos Tres Estrellas 220 u.", margen: 35, precio: 750, categoria: "Almacén", proveedor: "Tabacalera Sarandí", cantidad: 50 },
  { id: 98, codigo: "7790013008", nombre: "Alimento para Perros Dog Chow Adulto 1.5kg", margen: 25, precio: 5800, categoria: "Mascotas", proveedor: "Nestlé Purina", cantidad: 10 },
  { id: 99, codigo: "7790013009", nombre: "Alimento para Gatos Whiskas Carne 500g", margen: 28, precio: 3100, categoria: "Mascotas", proveedor: "Mars Argentina", cantidad: 14 },
  { id: 100, codigo: "7790013010", nombre: "Hielo en Cubos 3kg", margen: 50, precio: 2200, categoria: "Congelados", proveedor: "Hielo Local", cantidad: 20 },
];

//LOS PRODUCOS QUE TRAE DIRECTO DE LA BD DEBEN CONVINARSE CON LA TABLA PRODUCTOS Y DE LA TABLA CANTIDADXPRODUCTO
const productos2: Producto[] = productosMock; 
export default function TablaProductos() {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  // 🔥 1. Filtrado
  const filteredProducts = productos2.filter((p) =>
    p.nombre.toLowerCase().startsWith(search.toLowerCase())
  );

  // 🔥 2. Producto seleccionado
  //si hay productos filtrados, el seleccionado es el que corresponde al selectedIndex, sino es null
  const selectedProduct = filteredProducts.length > 0 ? filteredProducts[selectedIndex]: null;

  // 🔥 3. Reset selección al filtrar
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // 🔥 4. Navegación teclado
  useEffect(() => {//
    const handleKeyDown = (e: KeyboardEvent) => {
      
      const isInputFocused = document.activeElement?.tagName === "INPUT";

      if (e.key === "ArrowDown" && !isInputFocused) {
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredProducts.length - 1)
        );
      }

      if (e.key === "ArrowUp" && !isInputFocused) {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Enter") {
        if (filteredProducts.length > 0) {
          setOpenModal(true);
        }
      }

      if (e.key === "Escape") {
        setOpenModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredProducts]);

  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      
      {/* Filtros */}
      <div className="p-2 flex gap-2 bg-slate-100">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        

        {/* Selector de Proveedor */}
        <div className="grid gap-2">
          <Label htmlFor="proveedor" className="text-slate-600">Proveedor</Label>
          {/*si hay un producto seleccionado, muestra su proveedor, de lo contrario muestra el placeholder*/}
          <Select defaultValue={selectedProduct?.proveedor}>
            <SelectTrigger id="proveedor">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Coca">Coca Cola</SelectItem>
              <SelectItem value="Pepsi">Pepsi</SelectItem>
              <SelectItem value="Local">Distribuidora Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <select defaultValue={selectedProduct?.categoria}>
          <option value="">Todas las categorías</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Alimentos">Alimentos</option>
      </select>
      {/*<Input placeholder="Proveedor..." />*/}
      
      {/* Tabla de productos */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-200 sticky top-0">
            <tr>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-right">Precio Venta</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-left">Proveedor</th>
              <th className="p-2 text-left">Cantidad</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((prod, index) => (
              <tr
                key={prod.id}
                className={`
                  border-t cursor-pointer
                  ${index === selectedIndex ? "bg-blue-100" : "hover:bg-slate-50"}
                `}
              > 
                <td className="p-2">{prod.codigo}</td>
                <td className="p-2">{prod.nombre}</td>
                <td className="p-2 text-right">${prod.precio}</td>
                <td className="p-2">{prod.categoria}</td>
                <td className="p-2">{prod.proveedor}</td>
                <td className="p-2">{prod.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*MODAL PARA MOFIDICAR PRODUCTO*/}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Modificar Producto</DialogTitle>
          <DialogDescription>
            Ajusta los detalles del producto seleccionado.
          </DialogDescription>
        </DialogHeader>

        {selectedProduct && (
          <div className="grid gap-6 py-4">
            {/* Nombre - Ocupa todo el ancho */}
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-slate-600">Nombre del Producto</Label>
              <Input id="nombre" defaultValue={selectedProduct.nombre} className="focus-visible:ring-blue-500" />
            </div>

            {/* Dos columnas para números */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="margen" className="text-slate-600">Margen (%)</Label>
                <Input id="margen" type="number" defaultValue={selectedProduct.margen} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio" className="text-slate-600">Precio Venta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                  <Input id="precio" type="number" defaultValue={selectedProduct.precio} className="pl-7" />
                </div>
              </div>
            </div>

            {/* Dos columnas para Categoría y Proveedor */}
            <div className="grid grid-cols-2 gap-4">
      {/* Selector de Categoría */}
      <div className="grid gap-2">
        <Label htmlFor="categoria" className="text-slate-600">Categoría</Label>
        <Select defaultValue={selectedProduct?.categoria}>
          <SelectTrigger id="categoria">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bebidas">Bebidas</SelectItem>
            <SelectItem value="Alimentos">Alimentos</SelectItem>
            <SelectItem value="Limpieza">Limpieza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Proveedor */}
      <div className="grid gap-2">
        <Label htmlFor="proveedor" className="text-slate-600">Proveedor</Label>
        <Select defaultValue={selectedProduct?.proveedor}>
          <SelectTrigger id="proveedor">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Coca">Coca Cola</SelectItem>
            <SelectItem value="Pepsi">Pepsi</SelectItem>
            <SelectItem value="Local">Distribuidora Local</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>


    </div>
  );
}