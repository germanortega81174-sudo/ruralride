/** Mensaje para cuando una lista o búsqueda no tiene resultados, con una acción opcional. */
export default function EstadoVacio({ children, accion }) {
  return (
    <div className="estado-vacio" role="status">
      <p>{children}</p>
      {accion}
    </div>
  );
}
