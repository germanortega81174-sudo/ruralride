import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import { Selector } from '@/components/ui/Campos.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import Insignia from '@/components/ui/Insignia.jsx';
import { Estrellas } from '@/components/ui/Estrellas.jsx';
import { duracion, fechaHora, pesos } from '@/utils/formato.js';

/** RF03.2 y RF03.3 – Detalle del viaje y solicitud de cupo. */
export default function DetalleViajePage() {
  const { id } = useParams();
  const { db, detalleViaje, solicitarCupo, reputacion } = useData();
  const { sesion } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const base = db.viaje.find((v) => v.id_viaje === Number(id));
  const form = useFormulario({ cupos: '1' }, (v) => ({
    cupos: v.cupos ? '' : 'Seleccione cuántos cupos necesita.',
  }));
  if (!base)
    return (
      <section className="contenedor seccion">
        <Alerta tipo="aviso">
          El viaje no existe. <Link to="/viajes">Ver viajes</Link>
        </Alerta>
      </section>
    );

  const v = detalleViaje(base);
  const rep = reputacion(v.conductor.id_conductor);
  const maxCupos = Math.min(6, v.cupos_disponibles);
  const opciones = Array.from({ length: Math.max(0, maxCupos) }, (_, i) => ({
    valor: String(i + 1),
    texto: `${i + 1} cupo${i ? 's' : ''} – ${pesos((i + 1) * v.costo_por_cupo)}`,
  }));
  const yaSolicito =
    sesion?.pasajero &&
    db.solicitud.find(
      (s) => s.id_pasajero === sesion.pasajero.id_pasajero && s.id_viaje === v.id_viaje
    );

  const enviar = (f) => {
    try {
      solicitarCupo(sesion.pasajero.id_pasajero, v.id_viaje, Number(f.cupos));
      navigate('/mis-viajes', {
        state: {
          mensaje:
            'Solicitud enviada. El conductor la revisará y recibirá su código de reserva al ser aprobada.',
        },
      });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="contenedor seccion">
      <nav aria-label="Ruta de navegación" className="migas">
        <Link to="/viajes">Buscar viajes</Link> <span aria-hidden="true">/</span>{' '}
        <span aria-current="page">Viaje {v.id_viaje}</span>
      </nav>
      <div className="rejilla-principal">
        <article className="panel">
          <p className="texto-suave">
            {fechaHora(v.fecha_hora_salida)} · <Insignia estado={v.estado} />
          </p>
          <h1>
            {v.origen} → {v.destino}
          </h1>
          <dl className="detalles">
            <div>
              <dt>Punto de encuentro</dt>
              <dd>{v.ruta.punto_encuentro}</dd>
            </div>
            <div>
              <dt>Distancia</dt>
              <dd>{v.ruta.distancia_km} km</dd>
            </div>
            <div>
              <dt>Duración estimada</dt>
              <dd>{duracion(v.ruta.tiempo_estimado_min)}</dd>
            </div>
            <div>
              <dt>Aporte por cupo</dt>
              <dd>{pesos(v.costo_por_cupo)}</dd>
            </div>
            <div>
              <dt>Cupos disponibles</dt>
              <dd>
                {v.cupos_disponibles} de {v.cupos_ofrecidos}
              </dd>
            </div>
            <div>
              <dt>Vehículo</dt>
              <dd>
                {v.vehiculo.tipo.toLowerCase()} {v.vehiculo.marca} {v.vehiculo.linea}{' '}
                {v.vehiculo.color.toLowerCase()} · placa {v.vehiculo.placa}
              </dd>
            </div>
          </dl>
          <div className="conductor-caja">
            <span className="avatar avatar--grande" aria-hidden="true">
              {v.nombreConductor
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <h2 className="h3">{v.nombreConductor}</h2>
              <Estrellas valor={rep.promedio} total={rep.total} />
              <p className="texto-suave">
                Conductor validado por la comunidad · {v.conductor.anios_experiencia} años de
                experiencia
              </p>
            </div>
          </div>
        </article>

        <aside className="panel" aria-labelledby="titulo-solicitud">
          <h2 id="titulo-solicitud" className="h3">
            Solicitar cupo
          </h2>
          {error && (
            <Alerta tipo="error" onCerrar={() => setError('')}>
              {error}
            </Alerta>
          )}
          {!sesion ? (
            <>
              <p>Ingrese para solicitar un cupo en este viaje.</p>
              <Link
                to="/ingresar"
                state={{ desde: `/viajes/${v.id_viaje}` }}
                className="boton boton--primario boton--bloque"
              >
                Ingresar
              </Link>
            </>
          ) : !sesion.pasajero ? (
            <Alerta tipo="aviso">Su cuenta no tiene el rol de pasajero.</Alerta>
          ) : yaSolicito ? (
            <Alerta tipo="info">
              Ya tiene una solicitud para este viaje (estado: {yaSolicito.estado.toLowerCase()}).{' '}
              <Link to="/mis-viajes">Ver mis viajes</Link>
            </Alerta>
          ) : v.conductor.id_usuario === sesion.usuario.id_usuario ? (
            <Alerta tipo="aviso">Este es su propio viaje.</Alerta>
          ) : v.cupos_disponibles <= 0 ? (
            <Alerta tipo="aviso">Este viaje ya no tiene cupos disponibles.</Alerta>
          ) : (
            <form onSubmit={form.handleSubmit(enviar)} noValidate>
              <Selector
                id="cupos"
                etiqueta="Cupos"
                requerido
                form={form}
                opciones={opciones}
                vacio="Seleccione…"
                error={form.error('cupos')}
                ayuda="Máximo 6 cupos por solicitud."
              />
              <p className="total">
                Total a pagar al conductor:{' '}
                <strong>{pesos(Number(form.valores.cupos || 0) * v.costo_por_cupo)}</strong>
              </p>
              <button type="submit" className="boton boton--primario boton--bloque">
                Enviar solicitud
              </button>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
