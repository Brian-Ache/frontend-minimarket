/**
 * useCompras — Hook que centraliza la lógica de compras con paginación y filtros.
 *
 * Qué hace:
 * 1. Usa getCompras() del servicio para traer compras paginadas del backend.
 * 2. Soporta filtros: proveedor, tipoComprobante, rango de fechas, ordenamiento por total.
 * 3. Mantiene el estado de: compras, loading, error, filtros y paginación.
 * 4. Carga los proveedores disponibles para el select del filtro.
 * 5. Soporta refreshKey para forzar recarga después de crear una compra.
 */

import { useState, useEffect, useCallback } from "react";
import { getCompras } from "@/services/compraService";
import { getProveedores } from "@/services/productoService";
import type { CompraResponse } from "@/services/compraService";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";

const DEFAULT_PAGE_SIZE = 20;

export function useCompras(refreshKey = 0) {
  const [compras, setCompras] = useState<CompraResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [proveedorId, setProveedorId] = useState<string | undefined>(undefined);
  const [tipoComprobante, setTipoComprobante] = useState<string | undefined>(undefined);
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [sortTotal, setSortTotal] = useState<"asc" | "desc" | undefined>(undefined);

  // Período (para el select de período)
  const [periodo, setPeriodo] = useState<string>("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Select de proveedores
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);

  // Opciones de tipo de comprobante
  const tipoComprobanteOpciones = ["REMITO", "FACTURA", "TICKET", "BOLETA"];

  // Cargar proveedores al montar
  useEffect(() => {
    getProveedores().then(setProveedores).catch(() => {});
  }, []);

  // Calcular fechas desde/hasta según el período seleccionado
  useEffect(() => {
    if (!periodo || periodo === "personalizado") return;

    const hoy = new Date();
    const inicioDia = (d: Date) => {
      const r = new Date(d);
      r.setHours(0, 0, 0, 0);
      return r.toISOString();
    };
    const finDia = (d: Date) => {
      const r = new Date(d);
      r.setHours(23, 59, 59, 999);
      return r.toISOString();
    };

    let desde = "";
    let hasta = "";

    switch (periodo) {
      case "hoy":
        desde = inicioDia(hoy);
        hasta = finDia(hoy);
        break;
      case "ayer": {
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        desde = inicioDia(ayer);
        hasta = finDia(ayer);
        break;
      }
      case "esta_semana": {
        const copia = new Date(hoy);
        const diaSemana = copia.getDay();
        const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
        const lunes = new Date(copia);
        lunes.setDate(copia.getDate() - diffLunes);
        desde = inicioDia(lunes);
        hasta = finDia(hoy);
        break;
      }
      case "este_mes": {
        const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        desde = inicioDia(primero);
        hasta = finDia(hoy);
        break;
      }
      case "ultimos_30": {
        const hace30 = new Date(hoy);
        hace30.setDate(hace30.getDate() - 30);
        desde = inicioDia(hace30);
        hasta = finDia(hoy);
        break;
      }
    }

    setFechaDesde(desde);
    setFechaHasta(hasta);
  }, [periodo]);

  const fetchCompras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompras({
        page: currentPage,
        size: pageSize,
        proveedor: proveedorId,
        tipoComprobante,
        desde: fechaDesde || undefined,
        hasta: fechaHasta || undefined,
        sortTotal,
      });
      setCompras(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar compras");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, proveedorId, tipoComprobante, fechaDesde, fechaHasta, sortTotal, refreshKey]);

  // Reset a página 0 cuando cambia refreshKey
  useEffect(() => {
    setCurrentPage(0);
  }, [refreshKey]);

  // Reset a página 0 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(0);
  }, [proveedorId, tipoComprobante, fechaDesde, fechaHasta, sortTotal]);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  return {
    compras,
    loading,
    error,
    // Filtros
    proveedorId, setProveedorId,
    tipoComprobante, setTipoComprobante,
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    periodo, setPeriodo,
    sortTotal, setSortTotal,
    proveedores,
    tipoComprobanteOpciones,
    // Paginación
    currentPage, setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
  };
}
