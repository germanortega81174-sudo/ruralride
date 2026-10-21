import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function PiePagina() {
  return (
    <footer className="pie">
      <div className="contenedor pie__contenido">
        <div>
          <Logo claro />
          <p className="pie__lema">Transporte solidario entre veredas y cabeceras municipales.</p>
        </div>
        <nav aria-label="Enlaces del pie de página">
          <ul className="pie__enlaces">
            <li>
              <Link to="/viajes">Buscar viajes</Link>
            </li>
            <li>
              <Link to="/registro">Crear cuenta</Link>
            </li>
            <li>
              <Link to="/ingresar">Ingresar</Link>
            </li>
          </ul>
        </nav>
        <p className="pie__legal">Prototipo académico – SENA ADSO 3336056 · 2026</p>
      </div>
    </footer>
  );
}
