/**
 * 💡 ¿QUÉ ES UN CUSTOM HOOK Y CÓMO FUNCIONA ESTE EN PARTICULAR?
 * * 🧠 TEORÍA GENERAL:
 * 1. Un Custom Hook es una función de JavaScript que extrae lógica compleja para hacerla 
 * reutilizable o para limpiar el componente principal (manteniendo la UI separada de la lógica).
 * 2. Su nombre SIEMPRE debe empezar con "use" (regla estricta de React) para poder usar 
 * otros hooks nativos en su interior (como useState, useEffect, etc.).
 * 3. NO TIENE MAGIA PROPIA: Es una extensión del componente que lo llama. Se ejecuta en su mismo
 * ciclo de renderizado (siempre arriba de todo, antes del return).
 * 4. FLEXIBILIDAD EN PARÁMETROS: 
 * - Si se llama SIN parámetros: Es un hook de propósito general y autónomo (ej: leer el estado del internet).
 * - Si se llama CON parámetros: Actúa como un "control remoto". Esos parámetros e información dependen 
 * estrictamente del componente PADRE que lo invoca para poder leer su estado y modificarlo desde afuera.
 * * ⌨️ CASO ESPECÍFICO ('useVentaShortcuts'):
 * Este hook centraliza todos los eventos del teclado ('keydown') para la pantalla de ventas.
 * * - CANAL DE LECTURA: Monitorea 'tickets', 'productosDelTicket' e 'isModalOpen' en tiempo real. 
 * Al depender del padre, si el padre se actualiza con nuevos datos, este hook se entera instantáneamente.
 * - CANAL DE ACCIÓN: Al presionar teclas de función (F5, F6, F7, F8, F10, Ctrl+P, Flechas ↓/↑), 
 * atrapa el evento y dispara los "callbacks" recibidos (ej: openBuscar(), eliminarProducto()). 
 * Esto modifica el estado del padre (abre modales, borra ítems) sin que el usuario use el mouse.
 * - SEGURIDAD: Usa 'isModalOpen' para pausar los atajos globales si hay un buscador activo, 
 * evitando que escribir texto normal dispare acciones locas por detrás.
 */


import { useEffect } from "react";

// ... interfaces Producto y Ticket se mantienen igual

interface ShortcutParams {
  tickets: any[];
  activeTicket: number;
  productosDelTicket: any[];
  productoSeleccionadoId: number | null;
  onSeleccionarProducto: (id: number | null) => void;
  onFocusBarcode: () => void;
  eliminarProducto: (id: number) => void;
  eliminarTicket: (id: number) => void;
  isModalOpen: boolean;
  
  //Añadimos los disparadores para los modales desde el teclado
  openBuscar: () => void;
  openComun: () => void;
  openEntrada: () => void;
  openSalida: () => void;

  openNavegarTickets: () => void;
  openAgregarNuevoTicket: () => void;
}

export function useVentaShortcuts({
  tickets,
  activeTicket,
  productosDelTicket,
  productoSeleccionadoId,
  onSeleccionarProducto,
  onFocusBarcode,
  eliminarProducto,
  eliminarTicket,
  isModalOpen,
  openBuscar,
  openComun,
  openEntrada,
  openSalida,
  openNavegarTickets,
  openAgregarNuevoTicket
}: ShortcutParams) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // -----------------------------------------------------------------
      //Atajos complejos (Funcionan siempre)
      // -----------------------------------------------------------------
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        openComun();
        return;
      } 

      // -----------------------------------------------------------------
      //Tecla de escape / Limpiar selección de tabla
      // -----------------------------------------------------------------
      if (e.key === "Escape") {
        e.preventDefault();
        onSeleccionarProducto(null);
        onFocusBarcode();
        return;
      }

      // -----------------------------------------------------------------
      //Congelar si hay algún modal interactivo en pantalla
      // -----------------------------------------------------------------
      if (isModalOpen) return;
      if (e.key === "Tab") return; // Permitimos que el TAB rompa el foco de forma nativa para accesibilidad

      const target = e.target as HTMLElement;
      //isInputFocused' es TRUE solo si el usuario está escribiendo 
      // en un input de texto que NO sea el buscador principal de código de barras.
      //ya que quiero que pueda seguir navegando auque el focus este en el barcode
      const isInputFocused = (target.tagName === "INPUT" || target.tagName === "TEXTAREA") 
                             && target.id !== "barcode-input";

      // -----------------------------------------------------------------
      //PRIORIDAD 4: Atajos de teclas de función simples (F7, F8, F10)
      // -----------------------------------------------------------------
      
      if (e.key === "F5") {
        e.preventDefault(); // Detiene la recarga del navegador
        openNavegarTickets(); //Abre de forma segura el modal de cambiar tickets
        return;
      }

      if (e.key === "F6") {
        e.preventDefault();
        openAgregarNuevoTicket(); //Abre el modal de agregar ticket
        return;
      }
      
      if (e.key === "F10") {
        e.preventDefault();
        openBuscar();
        return;
      }

      if (e.key === "F7") {
        e.preventDefault();
        openEntrada();
        return;
      }

      if (e.key === "F8") {
        e.preventDefault();
        openSalida();
        return;
      }

      // -----------------------------------------------------------------
      //Tecla Supr/Delete
      // -----------------------------------------------------------------
      if (e.key === "Delete") {
        //Si está editando otro input (ej. observaciones), no borramos el producto
        if (isInputFocused) return;
        // FOCO VIRTUAL
        //el producto tiene tickets borra el producto del ticket
        if (productoSeleccionadoId !== null) {
          e.preventDefault();
          eliminarProducto(productoSeleccionadoId);
        } else {//si el ticket esta vacio borra el ticket
          const ticketActivo = tickets.find((t) => t.id === activeTicket);
          if (ticketActivo && ticketActivo.productos.length === 0 && tickets.length > 1) {
            e.preventDefault();
            eliminarTicket(activeTicket);
            onFocusBarcode();
          }
        }
        return;
      }

      // -----------------------------------------------------------------
      //Navegación de la tabla (ArrowUp / ArrowDown) de la tabla de productos del ticket
      // -----------------------------------------------------------------
      if (productosDelTicket.length === 0) return;
      const currentIndex = productosDelTicket.findIndex((p) => p.id === productoSeleccionadoId);

      if (e.key === "ArrowDown") {
        //Si está escribiendo en otro input, congelamos la navegación de la tabla
        if (isInputFocused) return;

        e.preventDefault(); // Evita el scroll por defecto de la página
        
        // FOCO VIRTUAL: Incrementamos el índice visualmente sin quitar jamás el foco real del input.
        const nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, productosDelTicket.length - 1);
        
        onSeleccionarProducto(productosDelTicket[nextIndex].id);
        onFocusBarcode(); // Clava el cursor en la barra de código de barras
        return;
      }

      if (e.key === "ArrowUp") {
        //Si está escribiendo en otro input, congelamos la navegación de la tabla
        if (isInputFocused) return;

        e.preventDefault();
        
        // FOCO VIRTUAL: Decrementamos el índice visual hasta el tope superior (0).
        // Si ya está en la primera fila (0), la selección visual se congela ahí y el foco 
        // no "sube" a ningún lado porque físicamente ya se encuentra en el barcode.
        if (currentIndex > 0) {
          onSeleccionarProducto(productosDelTicket[currentIndex - 1].id);
        }
        
        onFocusBarcode(); // Mantiene el cursor listo para recibir lecturas de la pistola láser
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);

  }, [
    tickets, 
    activeTicket, 
    productosDelTicket, 
    productoSeleccionadoId, 
    onSeleccionarProducto, 
    onFocusBarcode, 
    eliminarProducto, 
    eliminarTicket, 
    isModalOpen, 
    openBuscar, 
    openComun, 
    openEntrada, 
    openSalida,
    openNavegarTickets,
    openAgregarNuevoTicket
  ]);
}