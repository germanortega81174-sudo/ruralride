import { Link } from 'react-router-dom';

/**
 * Ruta de navegación ("migas de pan"). El último elemento es la página actual.
 * elementos: [{ texto, to? }]
 */
export default function Migas({ elementos }) {
  return (
    <nav aria-label="Ruta de navegación" className="migas">
      <ol className="migas__lista">
        {elementos.map((elemento, indice) => {
          const esActual = indice === elementos.length - 1;
          return (
            <li key={elemento.texto} className="migas__item">
              {esActual || !elemento.to ? (
                <span aria-current={esActual ? 'page' : undefined}>{elemento.texto}</span>
              ) : (
                <Link to={elemento.to}>{elemento.texto}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
