import { useState, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductoVendido = {
  id: string;
  nombre: string;
  unidades: number;
  totalNum: number;
  costo: string;
  margen: string;
  categoria: string;
  proveedor: string;
};

type SortOrder = "desc" | "asc";

export default function VistaProductos() {
  // Estados de filtros
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [proveedor, setProveedor] = useState("todos");
  const [periodo, setPeriodo] = useState("este_mes");

  // Estado de ordenamiento
  const [sortField, setSortField] = useState<"unidades" | "totalNum">("unidades");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Dataset unificado
  const productosMock: ProductoVendido[] = [
    { id: "1", nombre: "Coca-Cola Original 2.25L", unidades: 342, totalNum: 1197000, costo: "$ 850", margen: "40%", categoria: "Bebidas", proveedor: "Femsa Argentina" },
    { id: "2", nombre: "Cerveza Quilmes Clásica 1L", unidades: 280, totalNum: 840000, costo: "$ 2.100", margen: "30%", categoria: "Bebidas Con Alcohol", proveedor: "Cervecería Quilmes" },
    { id: "3", nombre: "Pan Lactal Grande 500g", unidades: 210, totalNum: 588000, costo: "$ 1.960", margen: "30%", categoria: "Panadería", proveedor: "Bimbo Argentina" },
    { id: "4", nombre: "Leche Entera La Serenísima 1L", unidades: 195, totalNum: 273000, costo: "$ 1.050", margen: "25%", categoria: "Lácteos", proveedor: "Mastellone Hermanos" },
    { id: "5", nombre: "Galletitas Chocolinas 250g", unidades: 168, totalNum: 268800, costo: "$ 1.120", margen: "30%", categoria: "Almacén", proveedor: "Bagley" },
    { id: "6", nombre: "Cigarrillos Marlboro Red 20", unidades: 155, totalNum: 465000, costo: "$ 2.700", margen: "10%", categoria: "Cigarrillos", proveedor: "Massalin Particulares" },
    { id: "7", nombre: "Agua Mineral Villavicencio 1.5L", unidades: 140, totalNum: 168000, costo: "$ 840", margen: "30%", categoria: "Bebidas", proveedor: "Aguas Danone" },
    { id: "8", nombre: "Fernet Branca 750ml", unidades: 112, totalNum: 1232000, costo: "$ 7.700", margen: "30%", categoria: "Bebidas Con Alcohol", proveedor: "Fratelli Branca" },
    { id: "9", nombre: "Papel Higiénico Higienol 4u", unidades: 98, totalNum: 245000, costo: "$ 1.750", margen: "30%", categoria: "Limpieza", proveedor: "Softys Argentina" },
    { id: "10", nombre: "Aceite de Girasol Natura 900ml", unidades: 92, totalNum: 202400, costo: "$ 1.540", margen: "30%", categoria: "Almacén", proveedor: "AGD" },
    { id: "11", nombre: "Snack Papas Importadas 150g", unidades: 12, totalNum: 42000, costo: "$ 2.500", margen: "30%", categoria: "Snacks", proveedor: "PepsiCo" },
    { id: "12", nombre: "Salsa de Soja Gourmet 250ml", unidades: 8, totalNum: 19200, costo: "$ 1.800", margen: "25%", categoria: "Almacén", proveedor: "Dos Anclas" },
    { id: "13", nombre: "Lustramuebles Aerosol 360cc", unidades: 5, totalNum: 13500, costo: "$ 2.100", margen: "30%", categoria: "Limpieza", proveedor: "Unilever" },
    { id: "14", nombre: "Limpiavidrios Repuesto 500ml", unidades: 3, totalNum: 4500, costo: "$ 1.200", margen: "20%", categoria: "Limpieza", proveedor: "Clorox" },
    { id: "15", nombre: "Tinta para Calzado Negra 60ml", unidades: 1, totalNum: 1800, costo: "$ 1.400", margen: "20%", categoria: "Perfumería", proveedor: "Alicorp" },
  ];

  // Cambiar sentido u orden de columna
  const toggleSort = (field: "unidades" | "totalNum") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtrar y ordenar
  const productosFiltradosYOrdenados = useMemo(() => {
    return productosMock
      .filter((prod) => {
        const coincideTexto = prod.nombre.toLowerCase().includes(search.toLowerCase());
        const coincideCat = categoria === "todas" || prod.categoria === categoria;
        const coincideProv = proveedor === "todos" || prod.proveedor === proveedor;
        return coincideTexto && coincideCat && coincideProv;
      })
      .sort((a, b) => {
        const factor = sortOrder === "desc" ? -1 : 1;
        return (a[sortField] - b[sortField]) * factor;
      });
  }, [search, categoria, proveedor, sortField, sortOrder]);

  const hayFiltrosActivos = search || categoria !== "todas" || proveedor !== "todos" || periodo !== "este_mes";

  return (
    <div className="space-y-4">

      {/* 🔍 BARRA DE FILTROS SUPERIOR */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar producto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
              />
            </div>

            {/* Selects */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              
              {/* Filtro Período */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
                <Label htmlFor="periodo" className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Período:
                </Label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger id="periodo" className="h-9 text-xs w-[140px] bg-white border-slate-200 font-medium text-slate-700">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="esta_semana">Esta Semana</SelectItem>
                    <SelectItem value="este_mes">Este Mes</SelectItem>
                    <SelectItem value="ultimos_30">Últimos 30 días</SelectItem>
                    <SelectItem value="anio_actual">Año 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Categoría */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Label htmlFor="categoria" className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Categoría:
                </Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger id="categoria" className="h-9 text-xs w-[150px] bg-white border-slate-200">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                    <SelectItem value="Bebidas Con Alcohol">Bebidas Con Alcohol</SelectItem>
                    <SelectItem value="Almacén">Almacén</SelectItem>
                    <SelectItem value="Lácteos">Lácteos</SelectItem>
                    <SelectItem value="Limpieza">Limpieza</SelectItem>
                    <SelectItem value="Panadería">Panadería</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Proveedor */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Label htmlFor="proveedor" className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Proveedor:
                </Label>
                <Select value={proveedor} onValueChange={setProveedor}>
                  <SelectTrigger id="proveedor" className="h-9 text-xs w-[160px] bg-white border-slate-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Femsa Argentina">Femsa Argentina</SelectItem>
                    <SelectItem value="Cervecería Quilmes">Cervecería Quilmes</SelectItem>
                    <SelectItem value="Bimbo Argentina">Bimbo Argentina</SelectItem>
                    <SelectItem value="Mastellone Hermanos">Mastellone Hermanos</SelectItem>
                    <SelectItem value="Bagley">Bagley</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resetear */}
              {hayFiltrosActivos && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoria("todas");
                    setProveedor("todos");
                    setPeriodo("este_mes");
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium px-2 py-1 whitespace-nowrap"
                >
                  Resetear
                </button>
              )}

            </div>

          </div>
        </CardContent>
      </Card>

      {/* TABLA UNIFICADA DE PRODUCTOS VENDIDOS */}
      <Card className="max-h-[70vh] border-slate-200 shadow-xs bg-white flex flex-col">
        <CardHeader className="p-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">
                  Rendimiento de Productos Vendidos
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Haz clic en las cabeceras para ordenar por ventas ascendentes o descendentes.
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="text-[11px] border-slate-200 text-slate-600 bg-slate-50">
              {productosFiltradosYOrdenados.length} productos
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold text-slate-600">#</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Producto</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Categoría</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Proveedor</TableHead>
                
                {/* Columna Unidades */}
                <TableHead className="text-right text-xs font-semibold text-slate-600">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("unidades")}
                    className="h-8 p-0 hover:bg-transparent text-xs font-semibold text-slate-600"
                  >
                    Unidades Vendidas
                    {sortField === "unidades" ? (
                      sortOrder === "desc" ? <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600" /> : <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    )}
                  </Button>
                </TableHead>

                {/* Columna Total */}
                <TableHead className="text-right text-xs font-semibold text-slate-600">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("totalNum")}
                    className="h-8 p-0 hover:bg-transparent text-xs font-semibold text-slate-600"
                  >
                    Total Recaudado
                    {sortField === "totalNum" ? (
                      sortOrder === "desc" ? <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600" /> : <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    )}
                  </Button>
                </TableHead>

                <TableHead className="text-right text-xs font-semibold text-slate-600">Margen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltradosYOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-slate-400">
                    No se encontraron productos con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltradosYOrdenados.map((prod, index) => {
                  const esBajaRotacion = prod.unidades < 10;

                  return (
                    <TableRow key={prod.id} className="hover:bg-slate-100/80 transition-colors">
                      <TableCell className="text-center font-bold text-xs text-slate-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{prod.nombre}</span>
                          {esBajaRotacion && (
                            <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-700 bg-amber-50 px-1 py-0">
                              Baja salida
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{prod.categoria}</TableCell>
                      <TableCell className="text-xs text-slate-500">{prod.proveedor}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-900">
                        {prod.unidades} u.
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-slate-700">
                        $ {prod.totalNum.toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                          <ArrowUpRight className="w-3 h-3" />
                          {prod.margen}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}