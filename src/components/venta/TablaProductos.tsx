export default function TablaProductos() {
  return (
    <table width="100%" border={1} cellPadding="8">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Cant</th>
          <th>Importe</th>
          <th>Existencia</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>123</td>
          <td>Producto</td>
          <td>$10</td>
          <td>1</td>
          <td>$10</td>
          <td>50</td>
        </tr>
      </tbody>
    </table>
  );
}