export default function EncabezadoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="encabezado-pagina">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="encabezado-pagina__sub">{subtitulo}</p>}
      </div>
      {children && <div className="encabezado-pagina__acciones">{children}</div>}
    </div>
  );
}
