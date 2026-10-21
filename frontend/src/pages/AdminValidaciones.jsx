import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { AreaTexto, Selector } from '../components/Campos.jsx';
import TablaDatos from '../components/TablaDatos.jsx';
import Insignia from '../components/Insignia.jsx';
import Alerta from '../components/Alerta.jsx';
import EncabezadoPagina from '../components/EncabezadoPagina.jsx';
import { fecha } from '../utils/formato.js';
import { longitud, primeraFalla, requerido } from '../utils/validaciones.js';

function FormResolver({ fila, onResuelto, onCancelar }) {
  const { sesion } = useAuth();
  const { resolverValidacion } = useData();
  const form = useFormulario({ estado: '', observaciones: '' }, (v) => ({
    estado: requerido(v.estado, 'La decisión'),
    observaciones: primeraFalla(
      v.estado === 'RECHAZADA' ? requerido(v.observaciones, 'Las observaciones') : '',
      longitud(v.observaciones, 10, 500, 'Las observaciones')
    ),
  }));
  const enviar = (v) => {
    resolverValidacion(
      fila.id_validacion,
      sesion.administrador.id_administrador,
      v.estado,
      v.observaciones.trim()
    );
    onResuelto(`La validación de ${fila.nombre} quedó ${v.estado.toLowerCase()}.`);
  };
  return (
    <form
      className="panel panel--nota"
      onSubmit={form.handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-resolver"
    >
      <h2 id="titulo-resolver" className="h3">
        Validar a {fila.nombre}
      </h2>
      <p className="texto-suave">
        Licencia {fila.conductor.numero_licencia} ({fila.conductor.categoria_licencia}), vence{' '}
        {fecha(fila.conductor.vencimiento_licencia)} · {fila.conductor.anios_experiencia} años de
        experiencia · {fila.vehiculos} vehículo(s)
      </p>
      <Selector
        id="estado"
        etiqueta="Decisión"
        requerido
        form={form}
        error={form.error('estado')}
        opciones={[
          { valor: 'APROBADA', texto: 'Aprobar' },
          { valor: 'RECHAZADA', texto: 'Rechazar' },
        ]}
      />
      <AreaTexto
        id="observaciones"
        etiqueta="Observaciones"
        requerido={form.valores.estado === 'RECHAZADA'}
        maxLength={500}
        form={form}
        error={form.error('observaciones')}
        ayuda="Referencias de la comunidad, revisión de documentos y del vehículo. Obligatorias si rechaza."
      />
      <div className="acciones">
        <button type="submit" className="boton boton--primario">
          Guardar decisión
        </button>
        <button type="button" className="boton boton--fantasma" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** RF04 – Validación comunitaria de conductores. */
export default function AdminValidaciones() {
  const { db, usuario } = useData();
  const [filtro, setFiltro] = useState('PENDIENTE');
  const [seleccion, setSeleccion] = useState(null);
  const [msg, setMsg] = useState('');
  const filas = db.validacion
    .map((v) => {
      const c = db.conductor.find((x) => x.id_conductor === v.id_conductor);
      const u = usuario(c.id_usuario);
      const a =
        v.id_administrador &&
        db.administrador.find((x) => x.id_administrador === v.id_administrador);
      return {
        ...v,
        conductor: c,
        nombre: `${u.nombre} ${u.apellido}`,
        admin: a ? usuario(a.id_usuario).nombre : '—',
        vehiculos: db.vehiculo.filter((x) => x.id_conductor === c.id_conductor).length,
      };
    })
    .filter((v) => filtro === 'TODAS' || v.estado === filtro)
    .sort((a, b) => b.fecha_solicitud.localeCompare(a.fecha_solicitud));

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Validación comunitaria"
        subtitulo="Apruebe o rechace a los conductores de su comunidad."
      />
      {msg && (
        <Alerta tipo="exito" onCerrar={() => setMsg('')}>
          {msg}
        </Alerta>
      )}
      <div className="filtros-chips" role="group" aria-label="Filtrar por estado">
        {['PENDIENTE', 'APROBADA', 'RECHAZADA', 'TODAS'].map((f) => (
          <button
            key={f}
            className={`chip ${filtro === f ? 'chip--activo' : ''}`}
            aria-pressed={filtro === f}
            onClick={() => setFiltro(f)}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <TablaDatos
        titulo="Validaciones"
        claveFila="id_validacion"
        filas={filas}
        vacio="No hay validaciones en este estado."
        columnas={[
          { clave: 'nombre', titulo: 'Conductor' },
          {
            clave: 'fecha_solicitud',
            titulo: 'Solicitada',
            render: (v) => fecha(v.fecha_solicitud),
          },
          { clave: 'estado', titulo: 'Estado', render: (v) => <Insignia estado={v.estado} /> },
          { clave: 'admin', titulo: 'Resuelta por' },
          {
            clave: 'observaciones',
            titulo: 'Observaciones',
            render: (v) => v.observaciones || '—',
          },
          {
            clave: 'acc',
            titulo: 'Acción',
            render: (v) =>
              v.estado === 'PENDIENTE' ? (
                <button
                  className="boton boton--secundario boton--chico"
                  onClick={() => {
                    setSeleccion(v);
                    setTimeout(() => document.getElementById('estado')?.focus(), 0);
                  }}
                >
                  Validar
                </button>
              ) : (
                '—'
              ),
          },
        ]}
      />
      {seleccion && (
        <FormResolver
          key={seleccion.id_validacion}
          fila={seleccion}
          onCancelar={() => setSeleccion(null)}
          onResuelto={(m) => {
            setMsg(m);
            setSeleccion(null);
          }}
        />
      )}
    </section>
  );
}
