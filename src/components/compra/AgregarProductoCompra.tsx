//consulta a la bf 1: busca y filtra productos
//consulta a la bd 2: antes de agregar el producto a la compra compara el nombre del prodcutos con el nombre del producto en la base de datos.(esto porque el usuario podria modificar el nombre del prodcucto en el input despues de haberlo seleccionado. si el nombre no coincide con alguno de la base de datos, no se agrea el producto a la compra, si el nombre coincide se agrega el producto a la compra, que luego se encaga de ahcer el inser a la base de datos)

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // Icono para el botón

//una interface es: un contrato que define la forma de un objeto, en este caso el objeto que representa un producto a agregar a la compra, con sus propiedades y tipos de datos. Esto ayuda a TypeScript a verificar que estamos usando el objeto correctamente y nos da autocompletado en el código.
interface AgregarProductoProps {
  onAgregar: (item: any) => void;
}

interface Producto {
  id: number;
  nombre: string;
  costo: number;
  margen: number;
}

// Mock de productos (esto vendría de la base de datos)
const PRODUCTOS_MOCK = [
  { id: 1, nombre: "Coca Cola 1.5L", costo: 1200, margen: 30 },
  { id: 2, nombre: "Coca Cola 600ml", costo: 800, margen: 30 },
  { id: 3, nombre: "Yerba Mate Playadito 1kg", costo: 3500, margen: 25 },
  { id: 4, nombre: "Pan Lactal Grande", costo: 2200, margen: 20 },
  { id: 5, nombre: "Leche Entera La Serenísima", costo: 1100, margen: 15 },
  { id: 6, nombre: "Galletitas Oreo", costo: 950, margen: 35 },
  { id: 7, nombre: "Fideos Tallarin Lucchetti", costo: 1050, margen: 20 },
  { id: 8, nombre: "Arroz Gallo Oro", costo: 1300, margen: 25 },
  { id: 9, nombre: "Aceite Cocinero 1L", costo: 1800, margen: 30 },
  { id: 10, nombre: "Café La Virginia 250g", costo: 900, margen: 40 },
];

//los productos que viene de la base, vienen con los campos id, nombre, cantidad, costo, margen y precioVenta. El formulario local tiene el campo buscar producto(busca en la bd)y cuando selecciona el producto, se completan todos los campos del formulario con los datos del producto seleccionado. El usuario puede modificar la cantidad, el costo y el margen, y el precio de venta se calcula automáticamente. Al hacer clic en el botón agregar, se envía el objeto con los datos del producto al componente padre para que lo agregue a la lista de items de la compra. Luego se resetea el formulario para agregar otro producto.

export default function AgregarProductoCompra({ onAgregar }: AgregarProductoProps) {

  //productos del localstorage
  const productosGuardados = localStorage.getItem("pos_productos");
  const productos: Producto[] = productosGuardados ? JSON.parse(productosGuardados) : PRODUCTOS_MOCK;

  const [busqueda, setBusqueda] = useState("");
  //le indico el tipo a sugerencias como un array de objetos con las mismas propiedades que los productos del mock, para que TypeScript sepa qué tipo de datos manejar y me brinde autocompletado y validación en el código.
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  //Estado para rastrear el índice seleccionado en el buscador con las flechas (-1 significa ninguno)
  const [indexSugerencia, setIndexSugerencia] = useState<number>(-1);

  // Referencia específica para el input de búsqueda
  const inputBusquedaRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    productoId: 0,
    nombre: "", // Para mostrar en la tabla después
    cantidad: 0,
    costo: 0,
    margen: 0,
    precioVenta: 0
  });

  //useRef es un hook de React que permite crear una referencia mutable a un elemento del DOM o a cualquier valor que quieras mantener entre renders. En este caso, se usa para referenciar el contenedor del buscador de productos, lo que podría ser útil para manejar eventos de clic fuera del componente y cerrar las sugerencias, por ejemplo.
  const contenedorRef = useRef<HTMLDivElement | null>(null); 

  ////////////////////////////////////////////////
  // Filtrar productos mientras escribe
  ////////////////////////////////////////////////
  useEffect(() => {
    // Si lo que escribió es idéntico al producto ya seleccionado,
    // significa que venimos de "seleccionarProducto" y NO queremos abrir el panel.
    const yaEstaSeleccionado = form.nombre.toLowerCase() === busqueda.toLowerCase();

    if (busqueda.length > 0 && !yaEstaSeleccionado) {
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().startsWith(busqueda.toLowerCase())
      ).slice(0, 7); // Limitamos a 7 items
      
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
      setIndexSugerencia(-1); // Reseteamos el índice al cambiar el texto
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setIndexSugerencia(-1);
    }
  }, [busqueda, form.nombre]);//si el texto del buscador o el nombre del producto seleccionado cambian, se ejecuta este efecto para actualizar las sugerencias y mostrar u ocultar el panel según corresponda.

  //////////////////////////////////////////////////////////77
  // Cerrar lista al hacer click afuera
  useEffect(() => {
    //mouseEvent y touchEvent son tipos de eventos que detectan cuando el usuario hace clic o toca fuera del componente(que en este caso es el contenedor del buscador)
    const clickAfuera = (e: MouseEvent | TouchEvent) => {
      //as node trata el evento com un nodo del DOM
      const target = e.target as Node | null;
      //si el contenedor existe y el target del evento no está dentro del contenedor, entonces se cierran las sugerencias
      if (contenedorRef.current && target && !contenedorRef.current.contains(target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  ///////////////////////////////////////////////////////777
  // Seleccionar producto de la lista, completar el formulario y cerrar sugerencias
  const seleccionarProducto = (prod: Producto) => {
    setForm({
      ...form,
      productoId: prod.id,
      nombre: prod.nombre,
      costo: prod.costo,
      margen: prod.margen,
      //deberia redondear de 50 en 50 pesos
      precioVenta: Math.ceil(prod.costo * (1 + prod.margen / 100) / 50) * 50
    });
    setBusqueda(prod.nombre);
    setMostrarSugerencias(false);
    setIndexSugerencia(-1);// Reseteamos el índice al seleccionar un producto para evitar confusiones si el usuario vuelve a abrir las sugerencias después.
  };

  //////////////////////////////////////////////////////////////////////////////////7
  ////////////////////////////////////////////////////////////////////////////////////
  //Manejador de eventos del teclado para el input(FLECHAS ARRIBA/ABAJO, ENTER y ESCAPE)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarSugerencias || sugerencias.length === 0) return;

    if (e.key === "ArrowDown") {
      // Flecha Abajo: Incrementa el índice, si llega al final vuelve al principio (ciclo loops)
      e.preventDefault(); // Evita que el cursor se mueva al final del texto en el input
      setIndexSugerencia(prev => (prev < sugerencias.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      // Flecha Arriba: Decrementa el índice, si llega al principio va al final
      e.preventDefault();
      setIndexSugerencia(prev => (prev > 0 ? prev - 1 : sugerencias.length - 1));
    } else if (e.key === "Enter") {
      // Enter: Si hay una sugerencia seleccionada, la elige
      if (indexSugerencia >= 0 && indexSugerencia < sugerencias.length) {
        e.preventDefault(); // Evita disparar el submit del formulario general
        seleccionarProducto(sugerencias[indexSugerencia]);
      }
    } else if (e.key === "Escape") {
      // Escape: Cierra el panel de sugerencias
      setMostrarSugerencias(false);
      setIndexSugerencia(-1);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 2. Funciones manejadoras de cambios(precio de venta y margen )
  //esta funcion se ejecuta si el usuario cambia el costo del producto o el margen y recalcule el precio de venta automaticamente
  const handleCostoMargenChange = (campo: "costo" | "margen", valor: number) => {
    setForm(prev => {
      // Obtenemos los valores actualizados al momento
      const nuevoCosto = campo === "costo" ? valor : prev.costo;
      const nuevoMargen = campo === "margen" ? valor : prev.margen;

      // Si no hay costo, no podemos calcular precio de venta válido
      if (nuevoCosto <= 0) {
        return { ...prev, [campo]: valor, precioVenta: 0 };
      }

      // Calculamos el precio de venta y lo redondeamos de 50 en 50
      const calculado = nuevoCosto * (1 + nuevoMargen / 100);
      const precioRedondeado = Math.ceil(calculado / 50) * 50;

      return {
        ...prev,
        [campo]: valor,
        precioVenta: precioRedondeado
      };
    });
  };
  //esta funcion se ejecuta si el usuario cambia el precio de venta directamente, y recalcula el margen hacia atrás para mostrarlo en el formulario
  const handlePrecioVentaChange = (nuevoPrecio: number) => {
    setForm(prev => {
      // Si el costo es 0 o menor, no podemos calcular un margen real
      if (prev.costo <= 0) {
        return { ...prev, precioVenta: nuevoPrecio, margen: 0 };
      }

      // Calculamos el margen hacia atrás basado en el nuevo precio que escribió el usuario
      const margenCalculado = ((nuevoPrecio / prev.costo) - 1) * 100;
      
      // Redondeamos el margen a 2 decimales para que no quede un número infinito (Ej: 33.3333333%)
      const margenRedondeado = Number(margenCalculado.toFixed(2));

      return {
        ...prev,
        precioVenta: nuevoPrecio,
        margen: margenRedondeado
      };
    });
  };

  //esta funcion se ejecuta al hacer click en el boton de agregar producto
  const handleAgregar = () => {
    if (form.costo <= 0 || form.cantidad <= 0) return;
    
    onAgregar(form);
    
    setForm({
      productoId: 0,
      nombre: "",
      cantidad: 1,
      costo: 0,
      margen: 0,
      precioVenta: 0
    });
    setBusqueda("");
    setMostrarSugerencias(false);
    setIndexSugerencia(-1);// Reseteamos el índice al agregar el producto para evitar confusiones si el usuario vuelve a abrir las sugerencias después.
    
    //Devolvemos el foco al buscador automáticamente 
    //para que el usuario pueda seguir agregando productos sin tener que hacer click de nuevo en el input, mejorando la fluidez de la experiencia de usuario.
    if (inputBusquedaRef.current) {//current es la referencia al elemento del DOM del input de búsqueda, y si existe, le damos foco para que el usuario pueda seguir escribiendo sin interrupciones.
      inputBusquedaRef.current.focus();//.focus() es un método que pone el cursor dentro del input y lo activa
    };
    //console.log("Producto agregado:", form);
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-8 gap-2 items-end bg-slate-50 p-3 rounded-lg border-dashed border-2">
      
      {/* 🔎 Producto - Buscador con lista desplegable de un solo click */}
      <div className="md:col-span-2 relative" ref={contenedorRef}>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Producto</label>
        <Input 
          ref={inputBusquedaRef} //le asignamos una refecncia para trbahar el DOM
          placeholder="Escriba el nombre del producto" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}//SI EL USUARIO USA LAS FLECHAS O ENTER, SE MANEJA EN ESTA FUNCION PARA NAVEGAR Y SELECCIONAR SUGERENCIAS
          autoComplete="off"
        />
        {/* Mostrar sugerencias solo si hay texto y productos que coincidan */}
        {mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute z-50 w-full mt-1 overflow-hidden rounded-md border bg-white shadow-lg">
            {/* Mapear las sugerencias y mostrar cada producto como un botón en la lista
            y tambien el index del producto para comparar con el index seleccionado y aplicar estilos condicionales*/}
            {sugerencias.map((prod, index) => (
              <button
                key={prod.id}
                type="button"
                // 🎨 MODIFICADO: Agregamos una clase condicional (bg-slate-100) si el índice coincide con el seleccionado
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${index === indexSugerencia ? "bg-slate-200 font-medium" : "hover:bg-slate-100"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  seleccionarProducto(prod);
                }}
              >
                {prod.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Cantidad</label>
        <Input 
          type="number" 
          value={form.cantidad === 0 ? "" : form.cantidad}
          onChange={(e) => {
            const val = e.target.value;
            setForm({ ...form, cantidad: val === "" ? 0 : Number(val) });
          }}
          onBlur={() => {
            if (form.cantidad <= 0) setForm({ ...form, cantidad: 1 });
          }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Costo ($)</label>
        <Input 
          type="number" 
          value={form.costo === 0 ? "" : form.costo} 
          onChange={(e) => handleCostoMargenChange("costo", Number(e.target.value))} 
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Margen %</label>
        <Input 
          type="number" 
          value={form.margen === 0 ? "" : form.margen}
          onChange={(e) => handleCostoMargenChange("margen", Number(e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">P. Venta</label>
        <Input 
          type="number" 
          className="bg-green-50 font-bold text-green-700"
          value={form.precioVenta === 0 ? "" : form.precioVenta}
          onChange={(e) => handlePrecioVentaChange(Number(e.target.value))}
        />
      </div>

      {/* ➕ Botón Agregar */}
      <div className="md:col-span-1">
        <Button 
          onClick={handleAgregar}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Añadir
        </Button>
      </div>

    </div>
  );
}