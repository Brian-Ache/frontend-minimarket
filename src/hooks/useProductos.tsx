/**
 * useProductos — Hook que centraliza la logica de productos, filtros, busqueda y paginacion.
 *
 * Que hace:
 * 1. Usa getProductos() del servicio para traer productos paginados del backend.
 * 2. Aplica debounce (retardo) a la busqueda por texto para no pegarle al backend en cada tecla.
 * 3. Mantiene el estado de: productos, loading, error, filtros y paginacion.
 * 4. Carga las categorias y proveedores disponibles para los selects del filtro.
 *
 * Que es debounce:
 * Cada vez que el usuario escribe una letra, en vez de hacer la peticion al backend
 * inmediatamente, espera 500ms a ver si sigue escribiendo. Si en esos 500ms el usuario
 * escribio otra letra, se cancela la anterior y se reinicia el contador. Asi solo se hace
 * la peticion cuando el usuario deja de escribir, evitando saturar al backend.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { getProductos, getCategorias, getProveedores } from "@/services/productoService";
import type { ProductoResponse } from "@/types/producto";
import type { CategoriaResponse } from "@/types/categorias";
import type { ProveedorResponse } from "@/types/proveedores";

const DEBOUNCE_MS = 500;
const DEFAULT_PAGE_SIZE = 20;

export function useProductos() {
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);
  const [proveedorId, setProveedorId] = useState<string | undefined>(undefined);

  // Paginacion
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Selects dinamicos
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);

  // Ref para el timer de debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductos({
        page: currentPage,
        size: pageSize,
        categoria: categoriaId,
        proveedor: proveedorId,
        q: search || undefined,
      });
      setProductos(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, categoriaId, proveedorId, search]);

  // Cargar categorias y proveedores al montar
  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
    getProveedores().then(setProveedores).catch(() => {});
  }, []);

  // Efecto 1: Cuando cambian los filtros (search, categoria, proveedor), resetear a página 0
useEffect(() => {
  setCurrentPage(0);
}, [search, categoriaId, proveedorId]);

// Efecto 2: Cuando cambia la página o los filtros, buscar productos
useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    fetchProductos();
  }, DEBOUNCE_MS);

  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, [search, categoriaId, proveedorId, currentPage, fetchProductos]);

  return {
    productos,
    loading,
    error,
    search,
    setSearch,
    categoriaId,
    setCategoriaId,
    proveedorId,
    setProveedorId,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    categorias,
    proveedores,
  };
}
