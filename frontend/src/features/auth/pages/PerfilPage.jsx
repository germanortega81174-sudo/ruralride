import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/DataContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import CampoTexto from '@/components/ui/CampoTexto.jsx';
import CampoSelector from '@/components/ui/CampoSelector.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import Insignia from '@/components/ui/Insignia.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import * as val from '@/utils/validaciones.js';
import { fecha } from '@/utils/formato.js';

const CATEGORIAS = ['A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map((c) => ({ valor: c, texto: c }));

function FormDatos({ sesion }) {
  const { actualizarUsuario, actualizarPasajero } = useData();
  const [ok, setOk] = useState('');
  const u = sesion.usuario;
  const p = sesion.pasajero;
  const form = useFormulario(
    {
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono,
      vereda_sector: u.vereda_sector || '',
      contacto_emergencia_nombre: p?.contacto_emergencia_nombre || '',
      contacto_emergencia_telefono: p?.contacto_emergencia_telefono || '',
    },
    (v) => ({
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
      vereda_sector: val.longitud(v.vereda_sector, 3, 80, 'La vereda'),
      contacto_emergencia_nombre: val.primeraFalla(
        val.soloLetras(v.contacto_emergencia_nombre, 'El nombre'),
        val.longitud(v.contacto_emergencia_nombre, 3, 120, 'El nombre')
      ),
      contacto_emergencia_telefono: val.primeraFalla(
        v.contacto_emergencia_nombre && !v.contacto_emergencia_telefono
          ? 'Indique el teléfono del contacto.'
          : '',
        val.soloDigitos(v.contacto_emergencia_telefono, 10, 10, 'El teléfono')
      ),
    })
  );
  const guardar = (v) => {
    actualizarUsuario(u.id_usuario, {
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      telefono: v.telefono,
      vereda_sector: v.vereda_sector.trim() || null,
    });
    if (p)
      actualizarPasajero(u.id_usuario, {
        contacto_emergencia_nombre: v.contacto_emergencia_nombre || null,
        contacto_emergencia_telefono: v.contacto_emergencia_telefono || null,
      });
    setOk('Sus datos se actualizaron correctamente.');
  };
  return (
    <form
      className="panel"
      onSubmit={form.handleSubmit(guardar)}
      noValidate
      aria-labelledby="titulo-datos"
    >
      <h2 id="titulo-datos" className="h3">
        Datos personales
      </h2>
      {ok && (
        <Alerta tipo="exito" onCerrar={() => setOk('')}>
          {ok}
        </Alerta>
      )}
      <div className="rejilla-2">
        <CampoTexto
          id="nombre"
          etiqueta="Nombres"
          requerido
          maxLength={60}
          form={form}
          error={form.error('nombre')}
        />
        <CampoTexto
          id="apellido"
          etiqueta="Apellidos"
          requerido
          maxLength={60}
          form={form}
          error={form.error('apellido')}
        />
        <CampoTexto
          id="telefono"
          etiqueta="Celular"
          type="tel"
          inputMode="numeric"
          requerido
          maxLength={10}
          form={form}
          error={form.error('telefono')}
        />
        <CampoTexto
          id="vereda_sector"
          etiqueta="Vereda o sector"
          maxLength={80}
          form={form}
          error={form.error('vereda_sector')}
        />
      </div>
      {p && (
        <fieldset className="grupo">
          <legend>Contacto de emergencia</legend>
          <div className="rejilla-2">
            <CampoTexto
              id="contacto_emergencia_nombre"
              etiqueta="Nombre del contacto"
              maxLength={120}
              form={form}
              error={form.error('contacto_emergencia_nombre')}
            />
            <CampoTexto
              id="contacto_emergencia_telefono"
              etiqueta="Teléfono del contacto"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              form={form}
              error={form.error('contacto_emergencia_telefono')}
            />
          </div>
        </fieldset>
      )}
      <button type="submit" className="boton boton--primario">
        Guardar cambios
      </button>
    </form>
  );
}

function FormConductor({ sesion }) {
  const { hacerseConductor } = useData();
  const [error, setError] = useState('');
  const form = useFormulario(
    {
      numero_licencia: '',
      categoria_licencia: '',
      vencimiento_licencia: '',
      anios_experiencia: '',
    },
    (v) => ({
      numero_licencia: val.primeraFalla(
        val.requerido(v.numero_licencia, 'La licencia'),
        val.soloDigitos(v.numero_licencia, 6, 20, 'La licencia')
      ),
      categoria_licencia: val.requerido(v.categoria_licencia, 'La categoría'),
      vencimiento_licencia: val.primeraFalla(
        val.requerido(v.vencimiento_licencia, 'La fecha de vencimiento'),
        val.fechaFutura(v.vencimiento_licencia) && 'La licencia está vencida.'
      ),
      anios_experiencia: val.primeraFalla(
        val.requerido(v.anios_experiencia, 'La experiencia'),
        val.rango(v.anios_experiencia, 0, 60, 'La experiencia')
      ),
    })
  );
  const enviar = (v) => {
    try {
      hacerseConductor(sesion.usuario.id_usuario, {
        ...v,
        anios_experiencia: Number(v.anios_experiencia),
      });
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <form
      className="panel"
      onSubmit={form.handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-cond"
    >
      <h2 id="titulo-cond" className="h3">
        Quiero ser conductor solidario
      </h2>
      <p className="texto-suave">
        Su solicitud quedará PENDIENTE hasta que un líder comunitario la valide.
      </p>
      {error && (
        <Alerta tipo="error" onCerrar={() => setError('')}>
          {error}
        </Alerta>
      )}
      <div className="rejilla-2">
        <CampoTexto
          id="numero_licencia"
          etiqueta="Número de licencia"
          requerido
          inputMode="numeric"
          maxLength={20}
          form={form}
          error={form.error('numero_licencia')}
        />
        <CampoSelector
          id="categoria_licencia"
          etiqueta="Categoría"
          requerido
          form={form}
          opciones={CATEGORIAS}
          error={form.error('categoria_licencia')}
        />
        <CampoTexto
          id="vencimiento_licencia"
          etiqueta="Vencimiento de la licencia"
          type="date"
          requerido
          form={form}
          error={form.error('vencimiento_licencia')}
        />
        <CampoTexto
          id="anios_experiencia"
          etiqueta="Años de experiencia"
          type="number"
          min={0}
          max={60}
          requerido
          form={form}
          error={form.error('anios_experiencia')}
        />
      </div>
      <button type="submit" className="boton boton--secundario">
        Enviar solicitud
      </button>
    </form>
  );
}

export default function PerfilPage() {
  const { sesion } = useAuth();
  const { validacionVigente, municipio } = useData();
  const location = useLocation();
  const [bienvenida, setBienvenida] = useState(location.state?.mensaje || '');
  const u = sesion.usuario;
  const val_ = sesion.conductor ? validacionVigente(sesion.conductor.id_conductor) : null;
  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Mi perfil"
        subtitulo={`${u.correo} · ${municipio(u.id_municipio)?.nombre} · Miembro desde ${fecha(u.fecha_registro)}`}
      />
      {bienvenida && (
        <Alerta tipo="exito" onCerrar={() => setBienvenida('')}>
          {bienvenida}
        </Alerta>
      )}
      <ul className="roles" aria-label="Mis roles">
        {sesion.pasajero && <li className="rol">Pasajero</li>}
        {sesion.conductor && (
          <li className="rol">
            Conductor · validación <Insignia estado={val_?.estado || 'PENDIENTE'} />
          </li>
        )}
        {sesion.administrador && (
          <li className="rol">Administrador · {sesion.administrador.cargo}</li>
        )}
      </ul>
      <div className="rejilla-principal">
        <FormDatos key={u.id_usuario} sesion={sesion} />
        {!sesion.conductor && <FormConductor sesion={sesion} />}
      </div>
    </section>
  );
}
