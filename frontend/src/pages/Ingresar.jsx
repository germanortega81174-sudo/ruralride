import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, PASSWORD_DEMO } from '../context/AuthContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { Campo } from '../components/Campos.jsx';
import Alerta from '../components/Alerta.jsx';
import { correo, primeraFalla, requerido } from '../utils/validaciones.js';

const CUENTAS_DEMO = [
  { correo: 'carlos.perez@gmail.com', rol: 'Pasajero' },
  { correo: 'juan.lopez@gmail.com', rol: 'Conductor' },
  { correo: 'rosa.gutierrez@gmail.com', rol: 'Conductora y pasajera' },
  { correo: 'luzmarina.pabon@ruralride.co', rol: 'Administradora' },
];

export default function Ingresar() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorServidor, setErrorServidor] = useState('');
  const form = useFormulario({ correo: '', password: '' }, (v) => ({
    correo: primeraFalla(requerido(v.correo, 'El correo'), correo(v.correo)),
    password: requerido(v.password, 'La contraseña'),
  }));

  const enviar = (v) => {
    try {
      const u = login(v.correo, v.password);
      navigate(location.state?.desde || '/', { replace: true, state: { bienvenida: u.nombre } });
    } catch (e) {
      setErrorServidor(e.message);
    }
  };

  const usarDemo = (c) => {
    form.setValor('correo', c);
    form.setValor('password', PASSWORD_DEMO);
  };

  return (
    <section className="contenedor seccion seccion--estrecha">
      <div className="panel">
        <h1>Ingresar</h1>
        <p className="texto-suave">Use el correo con el que se registró.</p>
        {errorServidor && (
          <Alerta tipo="error" onCerrar={() => setErrorServidor('')}>
            {errorServidor}
          </Alerta>
        )}
        <form onSubmit={form.handleSubmit(enviar)} noValidate>
          <Campo
            id="correo"
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            requerido
            form={form}
            error={form.error('correo')}
            maxLength={120}
          />
          <Campo
            id="password"
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            requerido
            form={form}
            error={form.error('password')}
          />
          <p className="texto-derecha">
            <Link to="/recuperar-contrasena">¿Olvidó su contraseña?</Link>
          </p>
          <button type="submit" className="boton boton--primario boton--bloque">
            Ingresar
          </button>
        </form>
        <p className="texto-centro">
          ¿No tiene cuenta? <Link to="/registro">Regístrese</Link>
        </p>
      </div>
      <aside className="panel panel--nota" aria-labelledby="demo-titulo">
        <h2 id="demo-titulo" className="h3">
          Cuentas de prueba
        </h2>
        <p className="texto-suave">
          Prototipo sin backend. Contraseña: <code>{PASSWORD_DEMO}</code>
        </p>
        <ul className="lista-demo">
          {CUENTAS_DEMO.map((c) => (
            <li key={c.correo}>
              <button type="button" className="enlace-boton" onClick={() => usarDemo(c.correo)}>
                {c.rol}: <span>{c.correo}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
