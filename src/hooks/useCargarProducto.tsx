/**
 * useCargarProducto — Hook que encapsula la lógica del formulario de carga de productos.
 *
 * Qué hace:
 * 1. Mantiene el estado del formulario (barcode, nombre, precio, costo, margen,
 *    manejaLotes, idCategoria, idProveedor) con valores iniciales vacíos.
 * 2. Calcula automáticamente el precio de venta cuando cambian costo o margen:
 *    precio = ceil((costo + costo * margen / 100) / 50) * 50.
 * 3. Expone `handleChange(field, value)` para actualizar cualquier campo del formulario
 *    de forma genérica y dinámica.
 * 4. Expone `cargar()` que hace POST a `/api/productos/v1` con los datos del formulario
 *    y el id del usuario logueado (del AuthContext) en el header `idUsuario`.
 * 5. Limpia el formulario al éxito y retorna el producto creado.
 * 6. Maneja errores y estado de carga.
 *
 * Propósito en el proyecto:
 * Centraliza toda la lógica de creación de productos en un hook reutilizable.
 * `FormProducto.tsx` solo se encarga del renderizado, mientras el hook gestiona
 * el estado, la validación implícita y la comunicación con el backend.
 * Separa las preocupaciones de UI (componente) de la lógica de negocio (hook),
 * siguiendo el principio de responsabilidad única.
 *
 * Dependencias: useAuth (para obtener el id del usuario logueado en el header),
 *               useProductoService (crearProducto).
 */

import { useState } from "react";
// Importa el contexto de autenticación para saber qué usuario está usando la app.
import { useAuth } from "@/context/AuthContext";
// Importa la función del servicio que hace la petición HTTP POST al backend.
import { crearProducto } from "@/services/productoService";
// Importa el tipo/interfaz de TypeScript que define la estructura obligatoria del formulario.
import type { CargaProductoRequest } from "@/types/request/CargaProductoRequest";

// Define el estado inicial del formulario con valores limpios por defecto.
const initialState: CargaProductoRequest = {
  barcode: "",
  nombre: "",
  precio: 0,
  manejaLotes: false,
  costo: 0,
  margen: 0,
  idCategoria: null,
  idProveedor: null,
};

// Declara la función del Hook personalizado.
export default function useCargarProducto() {
  // Extrae los datos del usuario actualmente logueado en la aplicación.
  const { user } = useAuth();
  
  // Estado que almacena los datos actuales que el usuario escribe en el formulario.
  const [form, setForm] = useState<CargaProductoRequest>(initialState);
  // Estado booleano para controlar si la petición al backend está en proceso (para deshabilitar botones o mostrar spinners).
  const [loading, setLoading] = useState(false);
  // Estado para capturar y mostrar mensajes de error si la petición falla.
  const [error, setError] = useState<string | null>(null);

  // Función genérica para actualizar cualquier campo del formulario de forma dinámica.
  // Recibe la propiedad a modificar ('field') y el nuevo valor ('value').
  const handleChange = (field: keyof CargaProductoRequest, value: string | number | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "costo" || field === "margen") {
        const costo = field === "costo" ? Number(value) : prev.costo;
        const margen = field === "margen" ? Number(value) : prev.margen;
        const precioVenta = costo + (costo * margen / 100);
        updated.precio = Math.ceil(precioVenta / 50) * 50;
      }
      return updated;
    });
  };

  // Función asíncrona que se ejecuta al presionar el botón de enviar el formulario.
  const cargar = async () => {
    setLoading(true); // Activa el estado de carga (bloquea la interfaz).
    setError(null);    // Limpia cualquier error de intentos anteriores.
    try {
      // Llama al servicio enviando los datos del formulario y asegurando que existe el ID de usuario ('user!.id').
      // 'await' pausa la ejecución aquí hasta que el backend responda con éxito.
      const result = await crearProducto(form, user!.id);
      
      // Si la petición fue exitosa, limpia el formulario devolviéndolo a su estado inicial.
      setForm(initialState); 
      
      // Retorna el producto creado que devolvió el backend por si el componente lo necesita.
      return result;
    } catch (err: any) {
      // Si ocurre un error, intenta buscar el mensaje específico que envió el backend.
      // Si no lo encuentra, usa un mensaje genérico por defecto.
      const msg = err.response?.data?.message || "Error al crear producto";
      setError(msg); // Guarda el mensaje de error en el estado para mostrarlo en pantalla.
      throw err;     // Lanza el error nuevamente por si el componente quiere manejarlo con otro try/catch.
    } finally {
      // Este bloque siempre se ejecuta al final, funcione o falle la petición.
      // Apaga el estado de carga (desbloquea la interfaz).
      setLoading(false);
    }
  };

  // El hook expone (retorna) estos elementos para que cualquier componente los consuma fácilmente.
  return { 
    form,         // Los datos actuales del formulario.
    handleChange, // La función para actualizar los inputs.
    cargar,       // La función para enviar el formulario al servidor.
    loading,      // El estado actual de la petición (true/false).
    error,        // El mensaje de error si algo sale mal.
    reset: () => setForm(initialState) // Una función extra para limpiar el formulario manualmente si se requiere.
  };
}