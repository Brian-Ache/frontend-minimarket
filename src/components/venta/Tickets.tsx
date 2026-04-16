import TablaProductos from "./TablaProductos";

export default function Tickets() {
  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button>Ticket 1</button>
        <button>Ticket 2</button>
      </div>

      <TablaProductos />
    </div>
  );
}