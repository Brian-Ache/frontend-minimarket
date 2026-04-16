import BarraBusqueda from "./BarraBusqueda";
import BotonesAccion from "./BotonesAccion";
import Tickets from "./Tickets";
import AccionesVenta from "./AccionesVenta";
import Cobro from "./Cobro";
import FooterVenta from "./FooterVenta";

export default function VentaPage() {
  return (
    <div style={{ padding: "10px" }}>
      <BarraBusqueda />
      <BotonesAccion />
      <Tickets />
      <AccionesVenta />
      <Cobro />
      <FooterVenta />
    </div>
  );
}