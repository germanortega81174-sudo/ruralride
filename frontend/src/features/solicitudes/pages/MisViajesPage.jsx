import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/DataContext.jsx';
import TablaDatos from '@/components/ui/TablaDatos.jsx';
import Insignia from '@/components/ui/Insignia.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import Pestanas from '@/components/ui/Pestanas.jsx';
import DialogoConfirmacion from '@/components/ui/DialogoConfirmacion.jsx';
import { fechaHora, pesos } from '@/utils/formato.js';

/** RF03.4 y RF03.5 – Solicitudes, reservas e historial del pasajero (vista v_historial_pasajero). */
export default function MisViajesPage() {
  const { sesion } = useAuth();
  const { db, detalleViaje, cancelarReserva } = useData();
  const location = useLocation();
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '');
  const [pestana, setPestana] = useState('solicitudes');
  const [reservaPorCancelar, setReservaPorCancelar] = useState(null);
  const idPas = sesion.pasajero.id_pasajero;

  const filas = db.solicitud
    .filter((s) => s.id_pasajero === idPas)
    .map((s) => {
      const v = detalleViaje(db.viaje.find((x) => x.id_viaje === s.id_viaje));
      const r = db.reserva.find((x) => x.id_solicitud === s.id_solicitud);
      const c = r && db.calificacion.find((x) => x.id_reserva === r.id_reserva);
      return { ...s, viaje: v, reserva: r, calificacion: c };
    })
    .sort((a, b) => b.viaje.fecha_hora_salida.localeCompare(a.viaje.fecha_hora_salida));

  const solicitudes = filas.filter((f) => !f.reserva);
  const reservas = filas.filter((f) => f.reserva);

  const colViaje = {
    clave: 'viaje',
    titulo: 'Viaje',
    render: (f) => (
      <Link to={`/viajes/${f.id_viaje}`}>
        {f.viaje.origen} → {f.viaje.destino}
      </Link>
    ),
  };
  const colSalida = {
    clave: 'salida',
    titulo: 'Salida',
    render: (f) => fechaHora(f.viaje.fecha_hora_salida),
  };

  const cancelar = (f) => setReservaPorCancelar(f.reserva);

  const confirmarCancelacion = () => {
    cancelarReserva(reservaPorCancelar.id_reserva);
    setMensaje(`La reserva ${reservaPorCancelar.codigo} fue cancelada.`);
    setReservaPorCancelar(null);
  };

  const tabs = [
    { id: 'solicitudes', texto: `Solicitudes (${solicitudes.length})` },
    { id: 'reservas', texto: `Reservas e historial (${reservas.length})` },
  ];

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Mis viajes"
        subtitulo="Siga el estado de sus solicitudes y reservas."
      >
        <Link to="/viajes" className="boton boton--primario">
          Buscar un viaje
        </Link>
      </EncabezadoPagina>
      {mensaje && (
        <Alerta tipo="exito" onCerrar={() => setMensaje('')}>
          {mensaje}
        </Alerta>
      )}
      <Pestanas etiqueta="Mis viajes" pestanas={tabs} activa={pestana} onCambiar={setPestana} />
      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`}>
        {pestana === 'solicitudes' ? (
          <TablaDatos
            titulo="Solicitudes sin reserva"
            claveFila="id_solicitud"
            filas={solicitudes}
            vacio="No tiene solicitudes pendientes."
            columnas={[
              colViaje,
              colSalida,
              { clave: 'cupos_solicitados', titulo: 'Cupos' },
              { clave: 'estado', titulo: 'Estado', render: (f) => <Insignia estado={f.estado} /> },
              { clave: 'motivo', titulo: 'Observación', render: (f) => f.motivo_respuesta || '—' },
            ]}
          />
        ) : (
          <TablaDatos
            titulo="Reservas confirmadas e historial"
            claveFila="id_solicitud"
            filas={reservas}
            vacio="Aún no tiene reservas."
            columnas={[
              {
                clave: 'codigo',
                titulo: 'Código',
                render: (f) => <strong>{f.reserva.codigo}</strong>,
              },
              colViaje,
              colSalida,
              {
                clave: 'valor',
                titulo: 'Valor',
                render: (f) => pesos(f.cupos_solicitados * f.viaje.costo_por_cupo),
              },
              {
                clave: 'estado',
                titulo: 'Estado',
                render: (f) => <Insignia estado={f.reserva.estado} />,
              },
              {
                clave: 'acciones',
                titulo: 'Acciones',
                render: (f) =>
                  f.reserva.estado === 'CONFIRMADA' ? (
                    <button
                      className="boton boton--peligro boton--chico"
                      onClick={() => cancelar(f)}
                    >
                      Cancelar
                    </button>
                  ) : f.reserva.estado === 'COMPLETADA' && !f.calificacion ? (
                    <Link
                      className="boton boton--secundario boton--chico"
                      to={`/mis-viajes/calificar/${f.reserva.id_reserva}`}
                    >
                      Calificar
                    </Link>
                  ) : f.calificacion ? (
                    `Calificado: ${f.calificacion.puntuacion}/5`
                  ) : (
                    '—'
                  ),
              },
            ]}
          />
        )}
      </div>
      <DialogoConfirmacion
        abierto={!!reservaPorCancelar}
        titulo="Cancelar reserva"
        textoConfirmar="Sí, cancelar"
        peligro
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setReservaPorCancelar(null)}
      >
        ¿Cancelar la reserva <strong>{reservaPorCancelar?.codigo}</strong>? El cupo quedará libre
        para otra persona.
      </DialogoConfirmacion>
    </section>
  );
}
