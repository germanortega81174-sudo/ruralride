import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { Campo, Selector } from '../components/Campos.jsx';
import Alerta from '../components/Alerta.jsx';
import * as val from '../utils/validaciones.js';

const TIPOS = [
  { valor: 'CC', texto: 'Cédula de ciudadanía' },
  { valor: 'CE', texto: 'Cédula de extranjería' },
  { valor: 'TI', texto: 'Tarjeta de identidad' },
  { valor: 'PPT', texto: 'Permiso por protección temporal' },
];

const validar = (v) => ({
  tipo_documento: val.requerido(v.tipo_documento, 'El tipo de documento'),
  numero_documento: val.primeraFalla(
    val.requerido(v.numero_documento, 'El número de documento'),
    val.soloDigitos(v.numero_documento, 6, 15, 'El documento')
  ),
  nombre: val.primeraFalla(
    val.requerido(v.nombre, 'El nombre'),
    val.soloLetras(v.nombre, 'El nombre'),
    val.longitud(v.nombre, 2, 60, 'El nombre')
  ),
  apellido: val.primeraFalla(
    val.requerido(v.apellido, 'El apellido'),
    val.soloLetras(v.apellido, 'El apellido'),
    val.longitud(v.apellido, 2, 60, 'El apellido')
  ),
  telefono: val.primeraFalla(val.requerido(v.telefono, 'El celular'), val.celular(v.telefono)),
  correo: val.primeraFalla(
    val.requerido(v.correo, 'El correo'),
    val.correo(v.correo),
    val.longitud(v.correo, 6, 120, 'El correo')
  ),
  id_municipio: val.requerido(v.id_municipio, 'El municipio'),
  vereda_sector: val.longitud(v.vereda_sector, 3, 80, 'La vereda o sector'),
  password: val.primeraFalla(val.requerido(v.password, 'La contraseña'), val.password(v.password)),
  confirmar: val.primeraFalla(
    val.requerido(v.confirmar, 'La confirmación'),
    v.confirmar !== v.password ? 'Las contraseñas no coinciden.' : ''
  ),
  acepta: v.acepta ? '' : 'Debe aceptar el tratamiento de datos personales.',
});

export default function Registro() {
  const { db, registrarUsuario } = useData();
  const { iniciarSesionCon } = useAuth();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const form = useFormulario(
    {
      tipo_documento: 'CC',
      numero_documento: '',
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      id_municipio: '',
      vereda_sector: '',
      password: '',
      confirmar: '',
      acepta: false,
    },
    validar
  );
  const municipios = db.municipio.map((m) => ({
    valor: String(m.id_municipio),
    texto: `${m.nombre} (${m.departamento})`,
  }));

  const enviar = (v) => {
    try {
      const u = registrarUsuario({
        tipo_documento: v.tipo_documento,
        numero_documento: v.numero_documento.trim(),
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        telefono: v.telefono,
        correo: v.correo.trim().toLowerCase(),
        id_municipio: Number(v.id_municipio),
        vereda_sector: v.vereda_sector.trim() || null,
        _password: v.password,
      });
      iniciarSesionCon(u.id_usuario);
      navigate('/perfil', {
        state: { mensaje: `¡Bienvenido(a), ${u.nombre}! Su cuenta de pasajero fue creada.` },
      });
    } catch (e) {
      setErrorServidor(e.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="contenedor seccion seccion--media">
      <div className="panel">
        <h1>Crear cuenta</h1>
        <p className="texto-suave">
          Los campos marcados con <span className="campo__req">*</span> son obligatorios.
        </p>
        {errorServidor && (
          <Alerta tipo="error" onCerrar={() => setErrorServidor('')}>
            {errorServidor}
          </Alerta>
        )}
        <form onSubmit={form.handleSubmit(enviar)} noValidate>
          <fieldset className="grupo">
            <legend>Datos personales</legend>
            <div className="rejilla-2">
              <Selector
                id="tipo_documento"
                etiqueta="Tipo de documento"
                requerido
                form={form}
                opciones={TIPOS}
                error={form.error('tipo_documento')}
              />
              <Campo
                id="numero_documento"
                etiqueta="Número de documento"
                requerido
                inputMode="numeric"
                maxLength={15}
                form={form}
                error={form.error('numero_documento')}
              />
              <Campo
                id="nombre"
                etiqueta="Nombres"
                requerido
                autoComplete="given-name"
                maxLength={60}
                form={form}
                error={form.error('nombre')}
              />
              <Campo
                id="apellido"
                etiqueta="Apellidos"
                requerido
                autoComplete="family-name"
                maxLength={60}
                form={form}
                error={form.error('apellido')}
              />
            </div>
          </fieldset>
          <fieldset className="grupo">
            <legend>Contacto y ubicación</legend>
            <div className="rejilla-2">
              <Campo
                id="telefono"
                etiqueta="Celular"
                type="tel"
                requerido
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                ayuda="10 dígitos, por ejemplo 3101234567."
                form={form}
                error={form.error('telefono')}
              />
              <Campo
                id="correo"
                etiqueta="Correo electrónico"
                type="email"
                requerido
                autoComplete="email"
                maxLength={120}
                form={form}
                error={form.error('correo')}
              />
              <Selector
                id="id_municipio"
                etiqueta="Municipio"
                requerido
                form={form}
                opciones={municipios}
                error={form.error('id_municipio')}
              />
              <Campo
                id="vereda_sector"
                etiqueta="Vereda o sector"
                maxLength={80}
                ayuda="Opcional."
                form={form}
                error={form.error('vereda_sector')}
              />
            </div>
          </fieldset>
          <fieldset className="grupo">
            <legend>Seguridad</legend>
            <div className="rejilla-2">
              <Campo
                id="password"
                etiqueta="Contraseña"
                type="password"
                requerido
                autoComplete="new-password"
                ayuda="Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo."
                form={form}
                error={form.error('password')}
              />
              <Campo
                id="confirmar"
                etiqueta="Confirmar contraseña"
                type="password"
                requerido
                autoComplete="new-password"
                form={form}
                error={form.error('confirmar')}
              />
            </div>
            <div className={`campo campo--check ${form.error('acepta') ? 'campo--error' : ''}`}>
              <input
                type="checkbox"
                id="acepta"
                name="acepta"
                checked={form.valores.acepta}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                aria-invalid={!!form.error('acepta')}
                aria-describedby={form.error('acepta') ? 'acepta-error' : undefined}
              />
              <label htmlFor="acepta">
                Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012.
              </label>
              {form.error('acepta') && (
                <p id="acepta-error" className="campo__error" role="alert">
                  {form.error('acepta')}
                </p>
              )}
            </div>
          </fieldset>
          <button type="submit" className="boton boton--primario boton--bloque">
            Crear cuenta
          </button>
        </form>
        <p className="texto-centro">
          ¿Ya tiene cuenta? <Link to="/ingresar">Ingrese aquí</Link>
        </p>
      </div>
    </section>
  );
}
