export default function BarraBusqueda() {
  return (
    <div style={{ display: "flex", marginBottom: "10px" }}>
      <input
        placeholder="Código del producto"
        style={{ flex: 1, padding: "10px" }}
      />
      <button style={{ marginLeft: "10px" }}>
        ENTER - Agregar Producto
      </button>
    </div>
  );
}