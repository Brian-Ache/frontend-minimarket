/**
 * useModificarProducto — Hook que encapsula todo el estado y la lógica del modal de modificación de productos.
 *
 * Qué hace:
 * 1. Mantiene el estado controlado de todos los campos del formulario de modificación:
 *    barcode, nombre, costo, margen, precio (auto-calculado), categoría, proveedor, manejaLotes y cantidad (stock).
 * 2. Carga las categorías y proveedores disponibles para los selects del modal.
 * 3. Inicializa los campos del formulario cuando se abre el modal con un producto seleccionado,
 *    incluyendo el stock actual (stockInicial).
 * 4. Expose `guardar()` que:
 *    - Llama a `modificarProducto()` (PUT /api/productos/v1/{id}) para actualizar los datos del producto.
 *    - Si la cantidad modificada difiere del stock inicial, llama a `controlarStock()`
 *      (POST /api/inventario/v1/controlar) para registrar el ajuste de stock como movimiento AJUSTE.
 *    - Notifica al padre vía `onRefresh` para que actualice la tabla.
 *    - Maneja errores y estado de carga.
 *
 * Propósito en el proyecto:
 * Extrae toda la lógica del modal de modificación de `TablaProductos.tsx` para mantener el componente
 * limpio y reutilizable. Centraliza el flujo de modificación de producto + ajuste de stock en un solo
 * hook, evitando duplicación de estado y lógica entre componentes.
 *
 * Dependencias: useAuth (para obtener el id del usuario logueado en el header),
 *               useProductoService (modificarProducto, controlarStock, getCategorias, getProveedores).
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { modificarProducto, controlarStock } from "@/services/productoService";
import { getCategorias, getProveedores } from "@/services/productoService";
import type { ProductoResponse } from "@/types/response/productoResponse";
import type { CargaProductoRequest } from "@/types/request/CargaProductoRequest";
import type { CategoriaResponse } from "@/types/response/categoriaResponse";
import type { ProveedorResponse } from "@/types/response/proveedorResponse";

interface UseModificarProductoProps {
  producto: ProductoResponse | null;
  stockInicial: number;
  onRefresh?: () => void;
}

export default function useModificarProducto({ producto, stockInicial, onRefresh }: UseModificarProductoProps) {

  // Extrae los datos del usuario actualmente logueado en la aplicación.
  const { user } = useAuth();
  const [modalBarcode, setModalBarcode] = useState("");
  const [modalNombre, setModalNombre] = useState("");
  const [modalCosto, setModalCosto] = useState(0);
  const [modalMargen, setModalMargen] = useState(0);
  const [modalManejaLotes, setModalManejaLotes] = useState(false);
  const [modalCategoriaId, setModalCategoriaId] = useState<string | null>(null);
  const [modalProveedorId, setModalProveedorId] = useState<string | null>(null);
  const [modalCantidad, setModalCantidad] = useState(0);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [modalCategorias, setModalCategorias] = useState<CategoriaResponse[]>([]);
  const [modalProveedores, setModalProveedores] = useState<ProveedorResponse[]>([]);

  const modalPrecio = Math.ceil((modalCosto + (modalCosto * modalMargen / 100)) / 50) * 50;

  useEffect(() => {
    getCategorias().then(setModalCategorias).catch(() => {});
    getProveedores().then(setModalProveedores).catch(() => {});
  }, []);

  useEffect(() => {
    if (producto) {
      setModalBarcode(producto.barcode);
      setModalNombre(producto.nombre);
      setModalCosto(producto.costo ?? 0);
      setModalMargen(producto.margen ?? 0);
      setModalManejaLotes(producto.manejaLotes);
      setModalCategoriaId(producto.categoria?.id ?? null);
      setModalProveedorId(producto.proveedor?.id ?? null);
      setModalCantidad(stockInicial);
      setModalError(null);
    }
  }, [producto, stockInicial]);

  const handleChange = (field: keyof CargaProductoRequest, value: string | number | boolean) => {
    if (field === "costo") setModalCosto(Number(value));
    else if (field === "margen") setModalMargen(Number(value));
    else if (field === "nombre") setModalNombre(value as string);
    else if (field === "barcode") setModalBarcode(value as string);
    else if (field === "manejaLotes") setModalManejaLotes(value as boolean);
    else if (field === "idCategoria") setModalCategoriaId(value as string);
    else if (field === "idProveedor") setModalProveedorId(value as string);
  };


  //guardar() hace: modificarProducto() (PUT) + si cantidad !== stockInicial → controlarStock() (POST /api/inventario/v1/controlar)
  const guardar = async () => {
    if (!producto) return;
    setModalSaving(true);
    setModalError(null);
    try {
      await modificarProducto(producto.id, {
        barcode: modalBarcode,
        nombre: modalNombre,
        precio: modalPrecio,
        manejaLotes: modalManejaLotes,
        costo: modalCosto,
        margen: modalMargen,
        idCategoria: modalCategoriaId,
        idProveedor: modalProveedorId,
      });

      if (modalCantidad !== stockInicial) {
        if (!user) { setModalError("No hay usuario autenticado"); return; }
        await controlarStock(producto.id, modalCantidad, user.id);
      }

      onRefresh?.();
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Error al modificar producto");
    } finally {
      setModalSaving(false);
    }
  };

  return {
    modalBarcode, setModalBarcode,
    modalNombre, setModalNombre,
    modalCosto, setModalCosto,
    modalMargen, setModalMargen,
    modalPrecio,
    modalManejaLotes, setModalManejaLotes,
    modalCategoriaId, setModalCategoriaId,
    modalProveedorId, setModalProveedorId,
    modalCantidad, setModalCantidad,
    modalCategorias, modalProveedores,
    modalSaving, modalError,
    handleChange,
    guardar,
  };
}