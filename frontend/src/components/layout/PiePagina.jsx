import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '@/components/layout/Logo.jsx';
import DialogoConfirmacion from '@/components/ui/DialogoConfirmacion.jsx';
import { useData } from '@/context/DataContext.jsx';

export default function PiePagina() {
  const { restablecerDatos } = useData();
  const [confirmando, setConfirmando] = useState(false);

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
        <p className="pie__legal">
          Prototipo académico – SENA ADSO 3336056 · 2026 ·{' '}
          <button
            type="button"
            className="enlace-boton pie__restablecer"
            onClick={() => setConfirmando(true)}
          >
            Restablecer datos de prueba
          </button>
        </p>
        <DialogoConfirmacion
          abierto={confirmando}
          titulo="Restablecer datos de prueba"
          textoConfirmar="Restablecer"
          onConfirmar={() => {
            restablecerDatos();
            setConfirmando(false);
          }}
          onCancelar={() => setConfirmando(false)}
        >
          Se borran los cambios hechos en este navegador (registros, solicitudes, viajes) y se
          vuelve a los datos de prueba originales.
        </DialogoConfirmacion>
      </div>
    </footer>
  );
}
