import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Layers, Search } from "lucide-react";

// Tipado de datos de rendimiento por proveedor
type RendimientoProveedor = {
  id: number;
  proveedor: string;
  categoriaPrincipal: string;
  skusActivos: number;
  totalComprado: number;
  totalVendido: number;
  margenPromedio: number;
  participacion: number; // Porcentaje de ventas totales
};

const mockProveedores: RendimientoProveedor[] = [
  { id: 1, proveedor: "Femsa Argentina", categoriaPrincipal: "Bebidas", skusActivos: 18, totalComprado: 1250000, totalVendido: 1750000, margenPromedio: 29.5, participacion: 28 },
  { id: 2, proveedor: "Cervecería y Maltería Quilmes", categoriaPrincipal: "Bebidas Con Alcohol", skusActivos: 24, totalComprado: 980000, totalVendido: 1380000, margenPromedio: 28.0, participacion: 22 },
  { id: 3, proveedor: "Molinos Río de la Plata", categoriaPrincipal: "Almacén", skusActivos: 35, totalComprado: 620000, totalVendido: 890000, margenPromedio: 30.2, participacion: 14 },
  { id: 4, proveedor: "Mastellone Hermanos", categoriaPrincipal: "Lácteos", skusActivos: 12, totalComprado: 510000, totalVendido: 650000, margenPromedio: 21.5, participacion: 10 },
  { id: 5, proveedor: "Unilever Argentina", categoriaPrincipal: "Limpieza", skusActivos: 40, totalComprado: 410000, totalVendido: 580000, margenPromedio: 29.3, participacion: 9 },
  { id: 6, proveedor: "Mondelēz International", categoriaPrincipal: "Golosinas", skusActivos: 28, totalComprado: 320000, totalVendido: 490000, margenPromedio: 34.6, participacion: 8 },
  { id: 7, proveedor: "Arcor", categoriaPrincipal: "Golosinas", skusActivos: 45, totalComprado: 290000, totalVendido: 440000, margenPromedio: 34.0, participacion: 7 },
  { id: 8, proveedor: "Distribuidora Luro", categoriaPrincipal: "Fiambrería", skusActivos: 15, totalComprado: 180000, totalVendido: 250000, margenPromedio: 28.0, participacion: 4 },
];

export default function VistaProveedores() {
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todas");

  // Filtrado reactivo por texto y categoría
  const proveedoresFiltrados = mockProveedores.filter((p) => {
    const coincideTexto = p.proveedor.toLowerCase().includes(search.toLowerCase());
    const coincideCategoria = categoriaFilter === "todas" || p.categoriaPrincipal === categoriaFilter;
    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="space-y-6">


      {/* CONTENEDOR PRINCIPAL TABLA + FILTROS */}
      <Card className="border-slate-200 shadow-xs bg-white">
        
        {/* BARRA DE FILTROS SUPERIOR (Mismo criterio que tu módulo TablaProductos) */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          
          <div className="relative flex-1 w-full sm:w-auto max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white text-xs h-9 border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Label htmlFor="cat-filter" className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Rubro principal:
            </Label>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger id="cat-filter" className="w-[180px] h-9 text-xs bg-white border-slate-200">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Bebidas Con Alcohol">Bebidas Con Alcohol</SelectItem>
                <SelectItem value="Almacén">Almacén</SelectItem>
                <SelectItem value="Lácteos">Lácteos</SelectItem>
                <SelectItem value="Limpieza">Limpieza</SelectItem>
                <SelectItem value="Golosinas">Golosinas</SelectItem>
                <SelectItem value="Fiambrería">Fiambrería</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TABLA DE RENDIMIENTO */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100/70">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-700">Proveedor / Distribuidor</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Rubro Principal</TableHead>
                  <TableHead className="text-center text-xs font-semibold text-slate-700">SKUs</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-700">Total Vendido</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-700">Margen Prom.</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-700">Participación</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {proveedoresFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                      No se encontraron proveedores con ese filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  proveedoresFiltrados.map((prov) => (
                    <TableRow key={prov.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-semibold text-xs text-slate-900">
                        {prov.proveedor}
                      </TableCell>
                      
                      <TableCell className="text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {prov.categoriaPrincipal}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center text-xs font-medium text-slate-600">
                        {prov.skusActivos}
                      </TableCell>

                      <TableCell className="text-right text-xs font-bold text-slate-800">
                        $ {prov.totalVendido.toLocaleString("es-AR")}
                      </TableCell>

                      <TableCell className="text-right text-xs">
                        <Badge variant="outline" className="text-[11px] font-semibold border-indigo-200 text-indigo-700 bg-indigo-50/50">
                          {prov.margenPromedio}%
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right text-xs font-semibold text-slate-700">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${prov.participacion * 2.5}%` }}
                            />
                          </div>
                          <span>{prov.participacion}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}