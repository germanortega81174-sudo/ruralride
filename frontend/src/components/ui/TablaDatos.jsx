/**
 * Tabla reutilizable. En pantallas pequeñas cada fila se muestra como tarjeta
 * usando el atributo data-label (diseño responsivo).
 * columnas: [{ clave, titulo, render?(fila) }]
 */
export default function TablaDatos({
  titulo,
  columnas,
  filas,
  claveFila,
  vacio = 'No hay registros.',
}) {
  if (!filas.length) return <p className="estado-vacio">{vacio}</p>;
  return (
    <div className="tabla-envoltura">
      <table className="tabla">
        <caption className={titulo ? 'tabla__titulo' : 'sr-only'}>
          {titulo || 'Tabla de datos'}
        </caption>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} scope="col">
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f[claveFila]}>
              {columnas.map((c) => (
                <td key={c.clave} data-label={c.titulo}>
                  {c.render ? c.render(f) : f[c.clave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
