import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/DataContext.jsx';
import TablaDatos from '@/components/ui/TablaDatos.jsx';
import Insignia from '@/components/ui/Insignia.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import SubmenuConductor from '@/features/viajes/components/SubmenuConductor.jsx';
import { Estrellas } from '@/components/ui/Estrellas.jsx';
import { fechaHora } from '@/utils/formato.js';

/** RF02 y RF03.4 – Resumen del conductor y gestión de solicitudes recibidas. */
export default function PanelConductorPage() {
  const { sesion } = useAuth();
  const { db, detalleViaje, responderSolicitud, validacionVigente, reputacion, usuario } =
    useData();
  const location = useLocation();
  const [msg, setMsg] = useState(
    location.state?.mensaje ? { tipo: 'exito', texto: location.state.mensaje } : null
  );
  const [rechazando, setRechazando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [errMotivo, setErrMotivo] = useState('');
  const c = sesion.conductor;
  const val = validacionVigente(c.id_conductor);
  const rep = reputacion(c.id_conductor);
  const misRutas = db.ruta.filter((r) => r.id_conductor === c.id_conductor).map((r) => r.id_ruta);
  const misViajes = db.viaje.filter((v) => misRutas.includes(v.id_ruta)).map(detalleViaje);
  const proximos = misViajes
    .filter((v) => v.estado === 'PROGRAMADO')
    .sort((a, b) => a.fecha_hora_salida.localeCompare(b.fecha_hora_salida));
  const pendientes = db.solicitud
    .filter((s) => s.estado === 'PENDIENTE' && misViajes.some((v) => v.id_viaje === s.id_viaje))
    .map((s) => {
      const p = db.pasajero.find((x) => x.id_pasajero === s.id_pasajero);
      return {
        ...s,
        viaje: misViajes.find((v) => v.id_viaje === s.id_viaje),
        pasajero: usuario(p.id_usuario),
        pas: p,
      };
    });

  const aprobar = (s) => {
    try {
      responderSolicitud(s.id_solicitud, 'APROBADA');
      setMsg({
        tipo: 'exito',
        texto: `Solicitud de ${s.pasajero.nombre} aprobada. Se generó la reserva RR${String(s.id_solicitud).padStart(6, '0')}.`,
      });
    } catch (e) {
      setMsg({ tipo: 'error', texto: e.message });
    }
  };
  const confirmarRechazo = (e) => {
    e.preventDefault();
    if (motivo.trim().length < 5) {
      setErrMotivo('Escriba el motivo del rechazo (mínimo 5 caracteres).');
      document.getElementById('motivo')?.focus();
      return;
    }
    responderSolicitud(rechazando.id_solicitud, 'RECHAZADA', motivo.trim());
    setMsg({ tipo: 'exito', texto: `Solicitud de ${rechazando.pasajero.nombre} rechazada.` });
    setRechazando(null);
    setMotivo('');
    setErrMotivo('');
  };

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Panel del conductor"
        subtitulo={`Hola, ${sesion.usuario.nombre}. Gestione sus viajes y solicitudes.`}
      >
        <Link to="/conductor/publicar" className="boton boton--primario">
          Publicar viaje
        </Link>
      </EncabezadoPagina>
      <SubmenuConductor />
      {val?.estado !== 'APROBADA' && (
        <Alerta
          tipo={val?.estado === 'RECHAZADA' ? 'error' : 'aviso'}
          titulo={`Validación comunitaria ${val?.estado?.toLowerCase()}`}
        >
          {val?.estado === 'RECHAZADA'
            ? `Motivo: ${val.observaciones}`
            : 'Podrá publicar viajes cuando un líder comunitario apruebe su validación.'}
        </Alerta>
      )}
      {msg && (
        <Alerta tipo={msg.tipo} onCerrar={() => setMsg(null)}>
          {msg.texto}
        </Alerta>
      )}

      <ul className="indicadores" aria-label="Resumen">
        <li className="indicador">
          <span className="indicador__valor">
            <Insignia estado={val?.estado || 'PENDIENTE'} />
          </span>
          <span className="indicador__texto">Validación</span>
        </li>
        <li className="indicador">
          <span className="indicador__valor">{proximos.length}</span>
          <span className="indicador__texto">Viajes programados</span>
        </li>
        <li className="indicador">
          <span className="indicador__valor">{pendientes.length}</span>
          <span className="indicador__texto">Solicitudes por responder</span>
        </li>
        <li className="indicador">
          <span className="indicador__valor">
            <Estrellas valor={rep.promedio} total={rep.total} />
          </span>
          <span className="indicador__texto">Reputación</span>
        </li>
      </ul>

      <h2 className="h3">Solicitudes por responder</h2>
      <TablaDatos
        titulo="Solicitudes pendientes de mis viajes"
        claveFila="id_solicitud"
        filas={pendientes}
        vacio="No tiene solicitudes pendientes."
        columnas={[
          {
            clave: 'pasajero',
            titulo: 'Pasajero',
            render: (s) => `${s.pasajero.nombre} ${s.pasajero.apellido}`,
          },
          {
            clave: 'viaje',
            titulo: 'Viaje',
            render: (s) => `${s.viaje.origen} → ${s.viaje.destino}`,
          },
          {
            clave: 'salida',
            titulo: 'Salida',
            render: (s) => fechaHora(s.viaje.fecha_hora_salida),
          },
          {
            clave: 'cupos',
            titulo: 'Cupos',
            render: (s) => `${s.cupos_solicitados} (libres: ${s.viaje.cupos_disponibles})`,
          },
          { clave: 'nota', titulo: 'Nota', render: (s) => s.pas.necesidad_especial || '—' },
          {
            clave: 'acciones',
            titulo: 'Acciones',
            render: (s) => (
              <div className="acciones acciones--fila">
                <button
                  className="boton boton--primario boton--chico"
                  onClick={() => aprobar(s)}
                  aria-label={`Aprobar solicitud de ${s.pasajero.nombre}`}
                >
                  Aprobar
                </button>
                <button
                  className="boton boton--fantasma boton--chico"
                  onClick={() => {
                    setRechazando(s);
                    setTimeout(() => document.getElementById('motivo')?.focus(), 0);
                  }}
                  aria-label={`Rechazar solicitud de ${s.pasajero.nombre}`}
                >
                  Rechazar
                </button>
              </div>
            ),
          },
        ]}
      />

      {rechazando && (
        <form
          className="panel panel--nota"
          onSubmit={confirmarRechazo}
          noValidate
          aria-labelledby="titulo-rechazo"
        >
          <h3 id="titulo-rechazo">Rechazar la solicitud de {rechazando.pasajero.nombre}</h3>
          <div className={`campo ${errMotivo ? 'campo--error' : ''}`}>
            <label htmlFor="motivo" className="campo__etiqueta">
              Motivo{' '}
              <span className="campo__req" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id="motivo"
              className="campo__control"
              rows={2}
              maxLength={200}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              aria-invalid={!!errMotivo}
              aria-describedby={errMotivo ? 'motivo-error' : undefined}
            />
            {errMotivo && (
              <p id="motivo-error" className="campo__error" role="alert">
                {errMotivo}
              </p>
            )}
          </div>
          <div className="acciones">
            <button type="submit" className="boton boton--peligro">
              Confirmar rechazo
            </button>
            <button
              type="button"
              className="boton boton--fantasma"
              onClick={() => {
                setRechazando(null);
                setErrMotivo('');
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <h2 className="h3">Mis próximos viajes</h2>
      <TablaDatos
        titulo="Viajes programados"
        claveFila="id_viaje"
        filas={proximos}
        vacio="No tiene viajes programados."
        columnas={[
          {
            clave: 'trayecto',
            titulo: 'Trayecto',
            render: (v) => (
              <Link to={`/viajes/${v.id_viaje}`}>
                {v.origen} → {v.destino}
              </Link>
            ),
          },
          { clave: 'salida', titulo: 'Salida', render: (v) => fechaHora(v.fecha_hora_salida) },
          { clave: 'vehiculo', titulo: 'Vehículo', render: (v) => v.vehiculo.placa },
          {
            clave: 'cupos',
            titulo: 'Cupos libres',
            render: (v) => `${v.cupos_disponibles} de ${v.cupos_ofrecidos}`,
          },
          { clave: 'estado', titulo: 'Estado', render: (v) => <Insignia estado={v.estado} /> },
        ]}
      />
    </section>
  );
}
