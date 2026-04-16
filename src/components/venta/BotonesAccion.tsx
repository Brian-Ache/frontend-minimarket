export default function BotonesAccion() {
  return (
    <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
      <button>INS Varios</button>
      <button>CTRL+P Art. Común</button>
      <button>F10 Buscar</button>
      <button>F11 Mayoreo</button>
      <button>F7 Entradas</button>
      <button>F8 Salidas</button>
      <button style={{ color: "red" }}>DEL Borrar Art.</button>
    </div>
  );
}