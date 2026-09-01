import CompraHeader from "./Header";
import AgregarProductoCompra from "./AgregarProductoCompra";
import ItemsTable from "./ItemsTable";
import CompraFooter from "./Footer";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { crearCompra } from "@/services/compraService";

//ACA TENGO EL OBJETO COMPRA QUE SE VA A IR ACTUALIZANDO CON LOS DATOS DE LOS COMPONENTES HIJOS, Y AL FINAL SE VA A ENVIAR AL BACKEND PARA GUARDAR LA COMPRA
type Compra = {
  proveedor: string;//id del proveedor (UUID)
  fecha: string;
  tipoComprobante: string;
  nroComprobante: string;
  observaciones: string;
  items: {//cada item es un producto con su cantidad, costo y margen
    productoId: string;
    nombre: string;
    cantidad: number;
    costo: number;
    margen: number;
    precioVenta: number;
  }[];
  total: number;//total de la compra, calculado a partir de los items
}; 


export default function NuevaCompra(){
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //cargo la variable d con la fecha actual que obtengo de new Date(), y la formateo a yyyy-mm-dd para usarla como valor por defecto en el input de tipo date del header
  const d = new Date();
  const fechaLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  //ESTE ESTADO SE VA A IR ACTUALIZANDO CON LOS DATOS DE LOS COMPONENTES HIJOS, Y AL FINAL SE VA A ENVIAR AL BACKEND PARA GUARDAR LA COMPRA
  const [compra, setCompra] = useState<Compra>({
    proveedor: "",
    //POR DEFECTO LA FECHA ES LA ACTUAL, PERO SE PUEDE CAMBIAR SI SE QUIERE GUARDAR UNA COMPRA ANTIGUA, ASI QUE EL VALOR INICIAL ES VACIO Y SE SETEA DESDE EL HEADER CUANDO SE CARGA EL COMPONENTE
    fecha: fechaLocal,
    tipoComprobante: "",
    nroComprobante: "",
    observaciones: "",
    items: [],
    total: 0,
  });

  // Efecto para recalcular el total automáticamente cuando cambian los items
  useEffect(() => {
    const nuevoTotal = compra.items.reduce(
      (acc, item) => acc + item.cantidad * item.costo, 
      0
    );
    setCompra(prev => ({ ...prev, total: nuevoTotal }));
    console.log("Los items de la compra son: ", compra.items);
    console.log("El valor de la compra es de: ", nuevoTotal); 
  }, [compra.items]);

  // Función para agregar o actualizar productos desde el buscador/tabla
  const handleUpdateItems = (nuevosItems: Compra["items"]) => {
    setCompra(prev => ({ ...prev, items: nuevosItems }));
  };

  //cuando se ejecuta la funcion se deberia resetear el estado de compra a su valor inicial para limpiar el formulario.
  //El backend aumenta automaticamente el stock del producto
  const handleSendToBackend = async () => {
    if (compra.items.length === 0) {
      setError("No hay productos en la compra");
      return;
    }
    if (!user) {
      setError("No hay usuario autenticado");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await crearCompra(user.id, {
        detalle: compra.items.map(item => ({
          idProducto: item.productoId,
          precioUnitario: item.costo,
          cantidad: item.cantidad,
          margen: item.margen,
          precioVenta: item.precioVenta,
        })),
        idProveedor: compra.proveedor || null,
        tipoComprobante: compra.tipoComprobante || null,
        nroComprobante: compra.nroComprobante || null,
        observaciones: compra.observaciones || null,
      });

      alert("Compra registrada exitosamente");
      setCompra({
        proveedor: "",
        fecha: fechaLocal,
        tipoComprobante: "",
        nroComprobante: "",
        observaciones: "",
        items: [],
        total: 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar la compra");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-hidden">

      <div className="shrink-0">
        <CompraHeader 
          datos={{
            proveedor: compra.proveedor,
            fecha: compra.fecha,
            tipoComprobante: compra.tipoComprobante,
            nroComprobante: compra.nroComprobante,
            observaciones: compra.observaciones,
          }}
          onChange={(campo, valor) => setCompra(prev => ({ ...prev, [campo]: valor }))}
        />
      </div>

      <div className="shrink-0">
        {/* Aquí el buscador pasaría el producto seleccionado para agregarlo a la lista */}
        <AgregarProductoCompra onAgregar={(item) => {
          setCompra(prev => ({ ...prev, items: [...prev.items, item] }));
        }}/>
      </div>

      <div className="flex-1 min-h-0">
        <ItemsTable
        //items(es de tipo Compra["items"] tengo que indicar a items de que tipo es) es el array de productos que se muestra en la tabla, y setItems es la función que se pasa a la tabla para actualizar ese array cuando se editan cantidades, costos o se eliminan productos. La tabla llamará a setItems con el nuevo array de items cada vez que haya un cambio, y eso actualizará el estado de compra en este componente padre.
          items={compra.items}
          setItems={handleUpdateItems}
        />
      </div>

      <div className="shrink-0">
        <CompraFooter
          total={compra.total} 
          onSave={handleSendToBackend}
          loading={loading}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

    </div>
  );
}