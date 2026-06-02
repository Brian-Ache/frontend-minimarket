import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

// 1. Las funciones de utilidad puras pueden ir fuera
const fetchProductosDesdeDB = async () => {
  return [
    { id: 1, barcode: "779100000001", nombre: "Gaseosa Coca Cola x1.5Lt", costo: 1800, margen: 40, precio: 2520, categoria: "Bebidas", proveedor: "Coca Cola" },
    { id: 2, barcode: "779100000002", nombre: "Gaseosa Pepsi x2.25Lt", costo: 2100, margen: 35, precio: 2835, categoria: "Bebidas", proveedor: "PepsiCo" },
    { id: 3, barcode: "779100000003", nombre: "Agua Mineral Villavicencio x1.5Lt", costo: 900, margen: 45, precio: 1305, categoria: "Bebidas", proveedor: "Villavicencio" },
    { id: 4, barcode: "779100000004", nombre: "Agua Saborizada Levite Manzana x1.5Lt", costo: 1100, margen: 35, precio: 1485, categoria: "Bebidas", proveedor: "Levite" },
    { id: 5, barcode: "779100000005", nombre: "Jugo Cepita Naranja x1Lt", costo: 1200, margen: 40, precio: 1680, categoria: "Bebidas", proveedor: "Cepita" },
    { id: 6, barcode: "779100000006", nombre: "Leche La Serenisima x1Lt", costo: 1000, margen: 30, precio: 1300, categoria: "Lacteos", proveedor: "La Serenisima" },
    { id: 7, barcode: "779100000007", nombre: "Yogurt La Serenisima Frutilla x900gr", costo: 1900, margen: 35, precio: 2565, categoria: "Lacteos", proveedor: "La Serenisima" },
    { id: 8, barcode: "779100000008", nombre: "Manteca La Serenisima x200gr", costo: 1700, margen: 30, precio: 2210, categoria: "Lacteos", proveedor: "La Serenisima" },
    { id: 9, barcode: "779100000009", nombre: "Queso Cremoso La Paulina x1Kg", costo: 6200, margen: 25, precio: 7750, categoria: "Lacteos", proveedor: "La Paulina" },
    { id: 10, barcode: "779100000010", nombre: "Queso Crema Casancrem x290gr", costo: 2400, margen: 35, precio: 3240, categoria: "Lacteos", proveedor: "Casancrem" },

    { id: 11, barcode: "779100000011", nombre: "Pan Lactal Fargo x550gr", costo: 1600, margen: 30, precio: 2080, categoria: "Panificados", proveedor: "Fargo" },
    { id: 12, barcode: "779100000012", nombre: "Pan Hamburguesa Bimbo x4un", costo: 1400, margen: 35, precio: 1890, categoria: "Panificados", proveedor: "Bimbo" },
    { id: 13, barcode: "779100000013", nombre: "Facturas Don Satur x300gr", costo: 1200, margen: 40, precio: 1680, categoria: "Panificados", proveedor: "Don Satur" },
    { id: 14, barcode: "779100000014", nombre: "Galletitas Oreo x118gr", costo: 1300, margen: 45, precio: 1885, categoria: "Galletitas", proveedor: "Mondelez" },
    { id: 15, barcode: "779100000015", nombre: "Galletitas Chocolinas x170gr", costo: 1100, margen: 40, precio: 1540, categoria: "Galletitas", proveedor: "Bagley" },
    { id: 16, barcode: "779100000016", nombre: "Galletitas Criollitas x200gr", costo: 950, margen: 40, precio: 1330, categoria: "Galletitas", proveedor: "Bagley" },
    { id: 17, barcode: "779100000017", nombre: "Alfajor Guaymallen Chocolate x38gr", costo: 350, margen: 60, precio: 560, categoria: "Golosinas", proveedor: "Guaymallen" },
    { id: 18, barcode: "779100000018", nombre: "Chocolate Milka Leche x55gr", costo: 800, margen: 50, precio: 1200, categoria: "Golosinas", proveedor: "Milka" },
    { id: 19, barcode: "779100000019", nombre: "Caramelos Arcor Frutales x150gr", costo: 700, margen: 45, precio: 1015, categoria: "Golosinas", proveedor: "Arcor" },
    { id: 20, barcode: "779100000020", nombre: "Papas Fritas Lays Clasicas x150gr", costo: 1800, margen: 40, precio: 2520, categoria: "Snacks", proveedor: "PepsiCo" },

    { id: 21, barcode: "779100000021", nombre: "Palitos Saladix Queso x100gr", costo: 900, margen: 45, precio: 1305, categoria: "Snacks", proveedor: "PepsiCo" },
    { id: 22, barcode: "779100000022", nombre: "Mani Japones Croppers x120gr", costo: 850, margen: 40, precio: 1190, categoria: "Snacks", proveedor: "Croppers" },
    { id: 23, barcode: "779100000023", nombre: "Cafe Cabrales Torrado x250gr", costo: 3200, margen: 30, precio: 4160, categoria: "Almacen", proveedor: "Cabrales" },
    { id: 24, barcode: "779100000024", nombre: "Yerba Playadito x1Kg", costo: 3900, margen: 30, precio: 5070, categoria: "Almacen", proveedor: "Playadito" },
    { id: 25, barcode: "779100000025", nombre: "Azucar Ledesma x1Kg", costo: 950, margen: 35, precio: 1282, categoria: "Almacen", proveedor: "Ledesma" },
    { id: 26, barcode: "779100000026", nombre: "Harina Blancaflor 000 x1Kg", costo: 850, margen: 35, precio: 1147, categoria: "Almacen", proveedor: "Blancaflor" },
    { id: 27, barcode: "779100000027", nombre: "Arroz Gallo Oro x1Kg", costo: 1600, margen: 30, precio: 2080, categoria: "Almacen", proveedor: "Gallo" },
    { id: 28, barcode: "779100000028", nombre: "Fideos Matarazzo Tirabuzon x500gr", costo: 1100, margen: 35, precio: 1485, categoria: "Almacen", proveedor: "Matarazzo" },
    { id: 29, barcode: "779100000029", nombre: "Pure de Tomate Arcor x520gr", costo: 700, margen: 45, precio: 1015, categoria: "Almacen", proveedor: "Arcor" },
    { id: 30, barcode: "779100000030", nombre: "Atun La Campagnola x170gr", costo: 2200, margen: 35, precio: 2970, categoria: "Conservas", proveedor: "La Campagnola" },

    { id: 31, barcode: "779100000031", nombre: "Choclo Arcor x300gr", costo: 900, margen: 35, precio: 1215, categoria: "Conservas", proveedor: "Arcor" },
    { id: 32, barcode: "779100000032", nombre: "Arvejas Noel x300gr", costo: 850, margen: 35, precio: 1147, categoria: "Conservas", proveedor: "Noel" },
    { id: 33, barcode: "779100000033", nombre: "Mayonesa Hellmanns x500gr", costo: 1800, margen: 35, precio: 2430, categoria: "Aderezos", proveedor: "Hellmanns" },
    { id: 34, barcode: "779100000034", nombre: "Ketchup Heinz x397gr", costo: 1900, margen: 35, precio: 2565, categoria: "Aderezos", proveedor: "Heinz" },
    { id: 35, barcode: "779100000035", nombre: "Mostaza Savora x250gr", costo: 950, margen: 35, precio: 1282, categoria: "Aderezos", proveedor: "Savora" },
    { id: 36, barcode: "779100000036", nombre: "Aceite Cocinero Girasol x900ml", costo: 2600, margen: 30, precio: 3380, categoria: "Almacen", proveedor: "Cocinero" },
    { id: 37, barcode: "779100000037", nombre: "Vinagre Menoyo Alcohol x500ml", costo: 700, margen: 40, precio: 980, categoria: "Almacen", proveedor: "Menoyo" },
    { id: 38, barcode: "779100000038", nombre: "Sal Dos Anclas Fina x500gr", costo: 500, margen: 40, precio: 700, categoria: "Almacen", proveedor: "Dos Anclas" },
    { id: 39, barcode: "779100000039", nombre: "Te La Virginia x25Saquitos", costo: 1200, margen: 35, precio: 1620, categoria: "Infusiones", proveedor: "La Virginia" },
    { id: 40, barcode: "779100000040", nombre: "Mate Cocido Taragui x25Saquitos", costo: 1000, margen: 35, precio: 1350, categoria: "Infusiones", proveedor: "Taragui" },

    { id: 41, barcode: "779100000041", nombre: "Cerveza Quilmes x1Lt", costo: 1700, margen: 40, precio: 2380, categoria: "Bebidas", proveedor: "Quilmes" },
    { id: 42, barcode: "779100000042", nombre: "Cerveza Heineken x473ml", costo: 1500, margen: 45, precio: 2175, categoria: "Bebidas", proveedor: "Heineken" },
    { id: 43, barcode: "779100000043", nombre: "Energizante Speed x250ml", costo: 1300, margen: 45, precio: 1885, categoria: "Bebidas", proveedor: "Speed" },
    { id: 44, barcode: "779100000044", nombre: "Agua Tonica Schweppes x1.5Lt", costo: 1200, margen: 35, precio: 1620, categoria: "Bebidas", proveedor: "Schweppes" },
    { id: 45, barcode: "779100000045", nombre: "Gaseosa Sprite x2.25Lt", costo: 2100, margen: 35, precio: 2835, categoria: "Bebidas", proveedor: "Coca Cola" },
    { id: 46, barcode: "779100000046", nombre: "Jabon Ala Matic x800gr", costo: 2800, margen: 35, precio: 3780, categoria: "Limpieza", proveedor: "Ala" },
    { id: 47, barcode: "779100000047", nombre: "Lavandina Ayudin x1Lt", costo: 950, margen: 40, precio: 1330, categoria: "Limpieza", proveedor: "Ayudin" },
    { id: 48, barcode: "779100000048", nombre: "Detergente Magistral Limon x750ml", costo: 1200, margen: 40, precio: 1680, categoria: "Limpieza", proveedor: "Magistral" },
    { id: 49, barcode: "779100000049", nombre: "Suavizante Vivere x900ml", costo: 1400, margen: 35, precio: 1890, categoria: "Limpieza", proveedor: "Vivere" },
    { id: 50, barcode: "779100000050", nombre: "Papel Higienico Elite x4un", costo: 2200, margen: 35, precio: 2970, categoria: "Higiene", proveedor: "Elite" },

    { id: 51, barcode: "779100000051", nombre: "Servilletas Sussex x100un", costo: 750, margen: 40, precio: 1050, categoria: "Higiene", proveedor: "Sussex" },
    { id: 52, barcode: "779100000052", nombre: "Pañales Pampers G x16un", costo: 7200, margen: 25, precio: 9000, categoria: "Higiene", proveedor: "Pampers" },
    { id: 53, barcode: "779100000053", nombre: "Shampoo Sedal Ceramidas x340ml", costo: 2400, margen: 35, precio: 3240, categoria: "Higiene", proveedor: "Sedal" },
    { id: 54, barcode: "779100000054", nombre: "Acondicionador Pantene x400ml", costo: 2800, margen: 35, precio: 3780, categoria: "Higiene", proveedor: "Pantene" },
    { id: 55, barcode: "779100000055", nombre: "Jabon Dove Original x90gr", costo: 850, margen: 45, precio: 1232, categoria: "Higiene", proveedor: "Dove" },
    { id: 56, barcode: "779100000056", nombre: "Desodorante Rexona Aerosol x150ml", costo: 2300, margen: 35, precio: 3105, categoria: "Higiene", proveedor: "Rexona" },
    { id: 57, barcode: "779100000057", nombre: "Crema Dental Colgate Triple Accion x90gr", costo: 1600, margen: 35, precio: 2160, categoria: "Higiene", proveedor: "Colgate" },
    { id: 58, barcode: "779100000058", nombre: "Cepillo Dental Oral B x1un", costo: 1100, margen: 40, precio: 1540, categoria: "Higiene", proveedor: "Oral B" },
    { id: 59, barcode: "779100000059", nombre: "Algodon Estrella x100gr", costo: 700, margen: 40, precio: 980, categoria: "Farmacia", proveedor: "Estrella" },
    { id: 60, barcode: "779100000060", nombre: "Alcohol Etílico Porta x500ml", costo: 950, margen: 35, precio: 1282, categoria: "Farmacia", proveedor: "Porta" },

    { id: 61, barcode: "779100000061", nombre: "Curitas Johnson x20un", costo: 800, margen: 40, precio: 1120, categoria: "Farmacia", proveedor: "Johnson" },
    { id: 62, barcode: "779100000062", nombre: "Helado Grido Dulce de Leche x1Kg", costo: 4500, margen: 30, precio: 5850, categoria: "Congelados", proveedor: "Grido" },
    { id: 63, barcode: "779100000063", nombre: "Hamburguesas Paty Clasicas x4un", costo: 3900, margen: 30, precio: 5070, categoria: "Congelados", proveedor: "Paty" },
    { id: 64, barcode: "779100000064", nombre: "Salchichas Vienisima x6un", costo: 1700, margen: 35, precio: 2295, categoria: "Carniceria", proveedor: "Vienisima" },
    { id: 65, barcode: "779100000065", nombre: "Milanesas Granja del Sol Pollo x700gr", costo: 5200, margen: 25, precio: 6500, categoria: "Congelados", proveedor: "Granja del Sol" },
    { id: 66, barcode: "779100000066", nombre: "Pizza Prepizza Fargo x2un", costo: 1800, margen: 35, precio: 2430, categoria: "Congelados", proveedor: "Fargo" },
    { id: 67, barcode: "779100000067", nombre: "Empanadas La Salteña Jamon y Queso x12un", costo: 4300, margen: 30, precio: 5590, categoria: "Congelados", proveedor: "La Salteña" },
    { id: 68, barcode: "779100000068", nombre: "Huevos Blancos x12un", costo: 2800, margen: 30, precio: 3640, categoria: "Granja", proveedor: "Avicola Sur" },
    { id: 69, barcode: "779100000069", nombre: "Banana Ecuador x1Kg", costo: 1700, margen: 40, precio: 2380, categoria: "Verduleria", proveedor: "Distribuidora Norte" },
    { id: 70, barcode: "779100000070", nombre: "Manzana Roja x1Kg", costo: 1500, margen: 40, precio: 2100, categoria: "Verduleria", proveedor: "Distribuidora Norte" },

    { id: 71, barcode: "779100000071", nombre: "Papa Negra x1Kg", costo: 900, margen: 45, precio: 1305, categoria: "Verduleria", proveedor: "Mercado Central" },
    { id: 72, barcode: "779100000072", nombre: "Tomate Redondo x1Kg", costo: 1800, margen: 40, precio: 2520, categoria: "Verduleria", proveedor: "Mercado Central" },
    { id: 73, barcode: "779100000073", nombre: "Cebolla Blanca x1Kg", costo: 850, margen: 40, precio: 1190, categoria: "Verduleria", proveedor: "Mercado Central" },
    { id: 74, barcode: "779100000074", nombre: "Naranja Valencia x1Kg", costo: 1300, margen: 40, precio: 1820, categoria: "Verduleria", proveedor: "Distribuidora Norte" },
    { id: 75, barcode: "779100000075", nombre: "Galletitas Pepitos x118gr", costo: 1200, margen: 40, precio: 1680, categoria: "Galletitas", proveedor: "Bagley" },
    { id: 76, barcode: "779100000076", nombre: "Chocolate Bon o Bon x15gr", costo: 250, margen: 60, precio: 400, categoria: "Golosinas", proveedor: "Arcor" },
    { id: 77, barcode: "779100000077", nombre: "Chicles Beldent Menta x10un", costo: 500, margen: 50, precio: 750, categoria: "Golosinas", proveedor: "Beldent" },
    { id: 78, barcode: "779100000078", nombre: "Helado Palito Bombon Escoces x1un", costo: 900, margen: 45, precio: 1305, categoria: "Congelados", proveedor: "Frigor" },
    { id: 79, barcode: "779100000079", nombre: "Agua Mineral Eco de los Andes x500ml", costo: 600, margen: 45, precio: 870, categoria: "Bebidas", proveedor: "Eco de los Andes" },
    { id: 80, barcode: "779100000080", nombre: "Jugo Tang Naranja x18gr", costo: 180, margen: 70, precio: 306, categoria: "Almacen", proveedor: "Tang" },

    { id: 81, barcode: "779100000081", nombre: "Gelatina Exquisita Frutilla x40gr", costo: 450, margen: 50, precio: 675, categoria: "Postres", proveedor: "Exquisita" },
    { id: 82, barcode: "779100000082", nombre: "Flan Exquisita Vainilla x60gr", costo: 500, margen: 45, precio: 725, categoria: "Postres", proveedor: "Exquisita" },
    { id: 83, barcode: "779100000083", nombre: "Dulce de Leche Ilolay x400gr", costo: 1900, margen: 35, precio: 2565, categoria: "Lacteos", proveedor: "Ilolay" },
    { id: 84, barcode: "779100000084", nombre: "Mermelada Arcor Durazno x454gr", costo: 1500, margen: 35, precio: 2025, categoria: "Almacen", proveedor: "Arcor" },
    { id: 85, barcode: "779100000085", nombre: "Avena Quaker Instantanea x500gr", costo: 1700, margen: 30, precio: 2210, categoria: "Desayuno", proveedor: "Quaker" },
    { id: 86, barcode: "779100000086", nombre: "Cereal Zucaritas Kelloggs x240gr", costo: 2800, margen: 35, precio: 3780, categoria: "Desayuno", proveedor: "Kelloggs" },
    { id: 87, barcode: "779100000087", nombre: "Miel Abeja Dorada x500gr", costo: 2300, margen: 35, precio: 3105, categoria: "Desayuno", proveedor: "Abeja Dorada" },
    { id: 88, barcode: "779100000088", nombre: "Leche Chocolatada Cindor x1Lt", costo: 1900, margen: 35, precio: 2565, categoria: "Bebidas", proveedor: "La Serenisima" },
    { id: 89, barcode: "779100000089", nombre: "Gaseosa Fanta Naranja x2.25Lt", costo: 2100, margen: 35, precio: 2835, categoria: "Bebidas", proveedor: "Coca Cola" },
    { id: 90, barcode: "779100000090", nombre: "Jugo Baggio Multifruta x1Lt", costo: 1200, margen: 40, precio: 1680, categoria: "Bebidas", proveedor: "Baggio" },

    { id: 91, barcode: "779100000091", nombre: "Arroz Dos Hermanos x1Kg", costo: 1500, margen: 30, precio: 1950, categoria: "Almacen", proveedor: "Dos Hermanos" },
    { id: 92, barcode: "779100000092", nombre: "Lentejas Lucchetti x400gr", costo: 1100, margen: 35, precio: 1485, categoria: "Almacen", proveedor: "Lucchetti" },
    { id: 93, barcode: "779100000093", nombre: "Porotos Arcor x350gr", costo: 1000, margen: 35, precio: 1350, categoria: "Almacen", proveedor: "Arcor" },
    { id: 94, barcode: "779100000094", nombre: "Salsa Filetto Knorr x340gr", costo: 850, margen: 40, precio: 1190, categoria: "Almacen", proveedor: "Knorr" },
    { id: 95, barcode: "779100000095", nombre: "Caldo Knorr Gallina x12un", costo: 750, margen: 40, precio: 1050, categoria: "Almacen", proveedor: "Knorr" },
    { id: 96, barcode: "779100000096", nombre: "Picadillo Swift x90gr", costo: 950, margen: 35, precio: 1282, categoria: "Conservas", proveedor: "Swift" },
    { id: 97, barcode: "779100000097", nombre: "Sardinas La Campagnola x125gr", costo: 1400, margen: 35, precio: 1890, categoria: "Conservas", proveedor: "La Campagnola" },
    { id: 98, barcode: "779100000098", nombre: "Jugo Ades Soja Manzana x1Lt", costo: 1400, margen: 35, precio: 1890, categoria: "Bebidas", proveedor: "Ades" },
    { id: 99, barcode: "779100000099", nombre: "Gaseosa Manaos Cola x2.25Lt", costo: 1700, margen: 40, precio: 2380, categoria: "Bebidas", proveedor: "Manaos" },
    { id: 100, barcode: "779100000100", nombre: "Agua Mineral Bonaqua x2Lt", costo: 850, margen: 45, precio: 1232, categoria: "Bebidas", proveedor: "Bonaqua" },
    { id: 101, barcode: "779100000101", nombre: "gaseosa crush lima x2Lt", costo: 850, margen: 45, precio: 1232, categoria: "Bebidas", proveedor: "Bonaqua" },
    { id: 102, barcode: "779100000102", nombre: "gaseosa manaos lima x3Lt", costo: 850, margen: 45, precio: 1232, categoria: "Bebidas", proveedor: "Bonaqua" },
    { id: 103, barcode: "779100000103", nombre: "gaseosa CACOCA lima x1.5Lt", costo: 850, margen: 45, precio: 1232, categoria: "Bebidas", proveedor: "Bonaqua" }
  ];
};

export default function Configuracion() {
  // 2. ✅ LOS HOOKS DEBEN IR AQUÍ (Dentro del componente)
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);

  // 3. ✅ LAS FUNCIONES QUE USAN EL ESTADO TAMBIÉN VAN AQUÍ
  const sincronizarCatalogo = async () => {
    setCargando(true);
    try {
      console.log("Sincronizando...");
      const datosNuevos = await fetchProductosDesdeDB();
      localStorage.setItem('pos_productos', JSON.stringify(datosNuevos));
      setProductos(datosNuevos);
      console.log("Sincronización exitosa");
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      setCargando(false);
    }
  };

  // 4. Estrategia: Carga automática al montar el componente
  useEffect(() => {
    sincronizarCatalogo();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Configuración del POS</h1>
      <Button 
        className="m-2" 
        variant="secondary" 
        onClick={sincronizarCatalogo}
        disabled={cargando}
      >
        {cargando ? "Sincronizando..." : "Sincronizar"}
      </Button>
      
      <p className="mt-2 text-sm text-gray-500">
        Productos cargados[{productos.length}]: {productos.map(p => p.nombre).join(", ")}

      </p>
    </div>
  );
}