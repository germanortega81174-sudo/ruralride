import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import Logo from '@/components/layout/Logo.jsx';
import { IconoCerrar, IconoMenu } from '@/components/ui/Iconos.jsx';

/** Encabezado con menú de navegación según el rol del usuario. En pantallas pequeñas se vuelve un menú desplegable. */
export default function Encabezado() {
  const { sesion, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  const enlaces = [{ to: '/viajes', texto: 'Buscar viajes' }];
  if (sesion?.pasajero) enlaces.push({ to: '/mis-viajes', texto: 'Mis viajes' });
  if (sesion?.conductor) enlaces.push({ to: '/conductor', texto: 'Panel conductor' });
  if (sesion?.administrador) enlaces.push({ to: '/admin/validaciones', texto: 'Validaciones' });

  const salir = () => {
    setAbierto(false);
    logout();
    navigate('/');
  };

  return (
    <header className="encabezado">
      <div className="contenedor encabezado__barra">
        <Link to="/" className="encabezado__marca" aria-label="RuralRide, ir al inicio">
          <Logo />
        </Link>
        <button
          className="encabezado__toggle"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <IconoCerrar /> : <IconoMenu />}
          <span className="sr-only">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
        <nav
          id="menu-principal"
          className={`menu ${abierto ? 'menu--abierto' : ''}`}
          aria-label="Navegación principal"
          onClick={(e) => {
            if (e.target.closest('a, button')) setAbierto(false);
          }}
        >
          <ul className="menu__lista">
            {enlaces.map((e) => (
              <li key={e.to}>
                <NavLink to={e.to} className="menu__enlace">
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="menu__cuenta">
            {sesion ? (
              <>
                <NavLink to="/perfil" className="menu__enlace menu__usuario">
                  <span className="avatar" aria-hidden="true">
                    {sesion.usuario.nombre[0]}
                    {sesion.usuario.apellido[0]}
                  </span>
                  {sesion.usuario.nombre.split(' ')[0]}
                </NavLink>
                <button className="boton boton--fantasma boton--chico" onClick={salir}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink to="/ingresar" className="menu__enlace">
                  Ingresar
                </NavLink>
                <Link to="/registro" className="boton boton--primario boton--chico">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
