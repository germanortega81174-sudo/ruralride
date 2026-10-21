import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alerta from './Alerta.jsx';

/** Restringe una vista a usuarios con sesión y, opcionalmente, con un rol. */
export default function RutaProtegida({ rol, children }) {
  const { sesion } = useAuth();
  const location = useLocation();
  if (!sesion) return <Navigate to="/ingresar" replace state={{ desde: location.pathname }} />;
  if (rol && !sesion[rol]) {
    return (
      <section className="contenedor seccion">
        <Alerta tipo="aviso" titulo="Acceso restringido">
          Esta sección es solo para usuarios con el rol de {rol}.
        </Alerta>
      </section>
    );
  }
  return children;
}
