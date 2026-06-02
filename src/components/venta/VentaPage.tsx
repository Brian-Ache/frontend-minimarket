import BarraBusqueda from "./Components/BarraBusqueda";
import BotonesAccion from "./Components/BotonesAccion";
import Tickets from "./Components/Tickets";
import FooterVenta from "./Components/FooterVenta";
import { useState, useEffect, useRef } from "react";
import { useVentaShortcuts } from "./Hooks/useVentaShortcuts";

// 1. Ya NO importamos TICKETS_INICIALES ni PRODUCTOS_DB
// Solo importamos los Tipos para que TypeScript no de error
interface Producto {
  id: number;
  barcode: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Ticket {
  id: number;
  nombre: string;
  productos: Producto[];
}

// 2. Definimos una estructura base para los tickets vacíos
const TICKETS_VACIOS: Ticket[] = [
  { id: 1,nombre: "carlos", productos: [] },
  { id: 2,nombre: "brian", productos: [] },
];

export default function VentaPage() {

  //calcula el total de los productos de un ticket
  const [total, setTotal] = useState(0);

  //El estado inicial de los tickets
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_VACIOS);
  const [activeTicket, setActiveTicket] = useState(1);

  // Buscamos el ticket activo en el estado
  const currentTicket = tickets.find(t => t.id === activeTicket);
  const productosDelTicket = currentTicket ? currentTicket.productos : [];

  // Estado para el producto seleccionado en la tabla
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number | null>(null);
 
  const barraBusquedaRef = useRef<HTMLInputElement | null>(null);

  //Centralizamos el estado de TODOS los modales en el Padre
  const [modales, setModales] = useState({
    buscar: false,
    comun: false,
    entrada: false,
    salida: false,
    navegar: false,
    agregarTicket: false, 
  });

  //VARIABLE PARA SABER SI HAY ALGUN MODAL ABIERTO Y CUAL ES
  // Variable de bloqueo calculada en tiempo real: si uno de los modales es true, la app se congela
  const isModalOpenVar = modales.buscar || modales.comun || modales.entrada || modales.salida || modales.navegar || modales.agregarTicket;

  // Funciones ayudantes para cambiar estados de modales de forma segura
  /*tipo puede ser "buscar", "comun", "entrada", "salida" o "navegar"
open es true para abrirlo y false para cerrarlo */

  /*COMO FUNCIONA PREV
  setModales(...): "React, voy a armar una caja de modales totalmente nueva".prev =>: "Primero, traeme la foto de cómo estaba la caja anterior (prev) para ver qué interruptores estaban prendidos o apagados".{ ...prev,: (Los tres puntitos significan Spread o "desparramar"). "Mirando la foto anterior, copiame e imitame TODOS los interruptores exactamente igual a como estaban. Si la ventana de 'entrada' estaba apagada, dejala apagada".[tipo]: open }: "Pero pará... a este interruptor en específico (por ejemplo, el de 'buscar'), no lo copies de la foto. A este ponelo en true (open)".*/
  /*El gran secreto de React: "Si no uso el set, la pantalla no se entera"React tiene una sola misión en tu aplicación: dibujar la pantalla basándose en tus datos.Para poder hacer eso de forma súper rápida, React necesita controlar cuándo cambian los datos. Cuando vos modificás un objeto directamente con un igual (modales.buscar = true), estás haciendo lo que en programación se llama mutar el estado.
  Si vas a modificar solo una parte de un objeto/array manteniendo el resto 👉 Usás prev y los tres puntitos (...prev).Si vas a borrar todo y poner un valor nuevo desde cero 👉 Pasás el valor nuevo directo, sin prev.*/
  //POR ESO NO PUEDO USAR modales.buscar = true (por ejemplo)
  const toggleModal = (tipo: keyof typeof modales, open: boolean) => {
    setModales(prev => ({ ...prev, [tipo]: open }));
    if (!open) {
      // Si se está cerrando cualquier modal, devolvemos foco al código de barras automáticamente
      setTimeout(() => onFocusBarcode(), 0);
    }
  };

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//FUNCIONES PRINCIPALES

//FUNCION PARA FOCUSEAR EL ELEMENTO "BARRA DE BUSQUEDA"
  const onFocusBarcode = () => {
    barraBusquedaRef.current?.focus();
  };

//FUNCION PARA CREAR TICKET(con el parametro nombre para que el usuario lo agregue)
  const crearNuevoTicket = (nombre: string) => {
    const nuevoId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const nuevoTicket: Ticket = { id: nuevoId,nombre: nombre, productos: [] };
    setTickets([...tickets, nuevoTicket]);//los puntos suspensivos hacen una copia del array actual y le agregan el nuevo ticket al final
    setActiveTicket(nuevoId);// Cambiamos al nuevo ticket automáticamente
  }

/*FUNCION PARA BORRAR EL TICKET ACTUAL
elimina el ticket atual y cambia al siguiente o al anterior si el actual es el último)*/
  const eliminarTicket = (id: number) => {
    //si el tickec tiene productos no se puede eliminar
    const ticketAEliminar = tickets.find(t => t.id === id);
    if (ticketAEliminar && ticketAEliminar.productos.length > 0) {
      return alert("No puedes eliminar un ticket con productos. Vacíalo primero.");
    }
    if(tickets.length === 1) return alert("No puedes eliminar el último ticket");
    setTickets(prev => prev.filter(t => t.id !== id));
    if (activeTicket === id) {
      const index = tickets.findIndex(t => t.id === id);
      const siguiente = tickets[index + 1] || tickets[index - 1];
      setActiveTicket(siguiente ? siguiente.id : 0);
    }
  }
  
//FUNCION PARA CAMBIAR DE TICKET ACTIVO
  const cambiarTicketActivo = (id: number)=>{
    console.log("Cambiando de ticket");
    setActiveTicket(id);
  }

//FUNCIONES PARA AGREGAR PRODUCTOS AL TICKET
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const agregarProductoPorCodigo = (codigo: string) => {
    const catalogoGuardado = localStorage.getItem('pos_productos');
    if (!catalogoGuardado) return alert("El catálogo está vacío. Sincroniza en Configuración.");

    const catalogo: any[] = JSON.parse(catalogoGuardado);
    const productoEncontrado = catalogo.find(p => p.barcode === codigo);

    if (!productoEncontrado) return alert("Producto no encontrado");

    inyectarProductoAlTicket(productoEncontrado);
  };
  
  // Función para agregar producto al ticket por nombre desde el modal de búsqueda
  //esta funcion es la que le pasamos como parametro al componente BotonesAccion para que despues se la pase a ModalBuscarProducto y cuando se seleccione un producto en el modal, se llame a esta función para agregar el producto al ticket actual
  const agregarProductoPorNombreAlTicket = (productoEncontrado: Producto) => {
    if (!productoEncontrado) return alert("Producto no encontrado");
    inyectarProductoAlTicket(productoEncontrado);
  };

  // Sub-función auxiliar para no duplicar la lógica inmutable de inyección y que la usen las funciones que quieren agregar un producto al ticket actual
  const inyectarProductoAlTicket = (producto: any) => {
    console.log("El id del producto agregado es:"+ producto.id);
    setTickets(prevTickets => 
      prevTickets.map(ticket => {
        if (ticket.id === activeTicket) {
          const existe = ticket.productos.find(p => p.id === producto.id);
          //si el producto ya existe en el ticket, solo se aumenta la cantidad, si no existe se agrega al array de productos del ticket con cantidad 1
          if (existe) {
            return {
              ...ticket,
              productos: ticket.productos.map(p => 
                p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
              )
            };
          }
          //si el producto no existe en el ticket, se agrega al array de productos del ticket con cantidad 1
          return {
            ...ticket,
            productos: [...ticket.productos, { ...producto, cantidad: 1 }]
          };
        }
        return ticket;
      })
    );

    //Forzamos a que el foco virtual seleccione el producto recién inyectado
    setProductoSeleccionadoId(producto.id);
    // Aseguramos que el cursor físico siga en la lectora por si quieren seguir disparando
    onFocusBarcode();
  };

// FUNCION PARA ELIMINAR UN PRODUCTO DEL TICKET ACTUAL
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

  
  // el producto debe estar en el ticket actual y se elimina completamente (no se resta cantidad, se elimina el producto del array)
  //se elimina el producto que este seleccionado en la tabla de productos del ticket
  //para selecionar un producto se le da click a la fila del producto en la tabla y se guarda el id del producto seleccionado en un estado local, luego se pasa ese id a esta función para eliminarlo del ticket 
  const eliminarProductoDeTicket = (idProductoABorrar: number) => {
  // 1. Buscamos el ticket activo actual para analizar sus productos actuales
  const ticketActivo = tickets.find(t => t.id === activeTicket);
  
  if (ticketActivo) {
    const productosActuales = ticketActivo.productos;
    // Encontramos la posición del producto que estamos a punto de borrar
    const indexABorrar = productosActuales.findIndex(p => p.id === idProductoABorrar);

    //CÁLCULO DEL NUEVO FOCO VIRTUAL (Antes de actualizar el estado):
    if (productosActuales.length > 1) {
      // Si el producto a borrar es el segundo (index 1), el foco saltará al que era el primero (index 0)
      // Si es cualquier otro, saltará al siguiente (indexABorrar + 1)
      const targetIndex = indexABorrar === 1 ? 0 : indexABorrar + 1;
      setProductoSeleccionadoId(productosActuales[targetIndex].id);
    } else {
      // Si era el único producto en el ticket, vaciamos el foco virtual
      setProductoSeleccionadoId(null);
    }
  }

  //recorre los tickets hasta encontrar el ticket que conincida con el ticekt activo
  const ticketsActualizados = tickets.map(ticket => {
    if (ticket.id !== activeTicket) {
      return ticket;
    }
    //si algun ticket coincide con el id del activo filtra sus productos
    //todos los productos que NO conincidan con idAborrar
    const productosFiltrados = ticket.productos.filter(
      producto => producto.id !== idProductoABorrar
    );

    //retorna el ticcket pero con la lista de productos modificados
    return {
      ...ticket,
      productos: productosFiltrados
    };
  });

  //actualiza la lista de tickets
  setTickets(ticketsActualizados);

  //cursor listo en el código de barras
  onFocusBarcode();
};

// FUNCION PARA CALCULAR EL TOTAL DEL TICEKT ACTUAL
////////////////////////////////////////////////////////
// Recalculamos el total cada vez que cambian los productos del ticket actual
// Hook para el cálculo del total (Mantiene la coherencia de los precios)
  useEffect(() => {
    const totalCalculado = currentTicket?.productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0) || 0;
    setTotal(totalCalculado);
  }, [currentTicket]);/*cada vez que cambia algo del ticket actual se ejecuta este useEffect*/

  //ENLACE DE CUSTOM HOOK PARA NAVEGAR LA TABLA DE PRODUCTOS DEL TICKET Y ATAJOS DE TECLADO
  useVentaShortcuts({
    tickets,
    activeTicket,
    productosDelTicket,
    productoSeleccionadoId,
    onSeleccionarProducto: setProductoSeleccionadoId,
    onFocusBarcode,
    eliminarProducto: eliminarProductoDeTicket,
    eliminarTicket: eliminarTicket,
    isModalOpen: isModalOpenVar,
    openBuscar: () => toggleModal("buscar", true),//f10
    openComun: () => toggleModal("comun", true),//ctr+p
    openEntrada: () => toggleModal("entrada", true),//f7
    openSalida: () => toggleModal("salida", true),//f8
    openNavegarTickets: () => toggleModal("navegar", true), //F5
    openAgregarNuevoTicket: () => toggleModal("agregarTicket", true), //f6
  });

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3 overflow-hidden">
      {/* Barra de búsqueda conectada a la función dinámica */}
      <BarraBusqueda onAgregar={agregarProductoPorCodigo} inputRef={barraBusquedaRef} />

      <BotonesAccion 
        productoSeleccionadoId={productoSeleccionadoId}
        onEliminar={eliminarProductoDeTicket}
        OnAgregarProductoAlTicket={agregarProductoPorNombreAlTicket}
        onFocusBarcode={onFocusBarcode}
        modales={modales}
        setModales={{
          buscar: (open) => toggleModal("buscar", open),
          comun: (open) => toggleModal("comun", open),
          entrada: (open) => toggleModal("entrada", open),
          salida: (open) => toggleModal("salida", open),
        }}
      />

      <div className="flex-1 overflow-hidden min-h-0">
        <Tickets
          tickets={tickets}
          activeTicket={activeTicket}
          setActiveTicket={setActiveTicket}
          productoSeleccionadoId={productoSeleccionadoId}
          onSeleccionarProducto={setProductoSeleccionadoId}
          onFocusBarcode={onFocusBarcode}
        />
      </div>
      <FooterVenta 
        tickets={tickets}
        total={total} 
        activeTicket={activeTicket} 
        agregar={crearNuevoTicket} 
        eliminar={eliminarTicket} 
        cambiar={cambiarTicketActivo} 
        //onSetIsModalOpen={(open) => toggleModal("buscar", open)} // Puedes simplificar o adaptar según use el footer
        onFocusBarcode={onFocusBarcode}
        openModalNavegarTickets={modales.navegar} //Le pasamos el estado real
        setOpenModalNavegarTickets={(open) => toggleModal("navegar", open)} // Modificador unificado
      />
    </div>
  );
}