import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import { AreaTexto } from '@/components/ui/Campos.jsx';
import { SelectorEstrellas } from '@/components/ui/Estrellas.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import { fechaHora } from '@/utils/formato.js';
import { longitud } from '@/utils/validaciones.js';

/** Solución propuesta SP.1 – Calificar el servicio (solo reservas COMPLETADAS, RN22). */
export default function CalificarPage() {
  const { id } = useParams();
  const { db, detalleViaje, calificar } = useData();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const form = useFormulario({ puntuacion: 0, comentario: '' }, (v) => ({
    puntuacion: v.puntuacion >= 1 && v.puntuacion <= 5 ? '' : 'Seleccione de 1 a 5 estrellas.',
    comentario: longitud(v.comentario, 5, 300, 'El comentario'),
  }));
  const reserva = db.reserva.find((r) => r.id_reserva === Number(id));
  if (!reserva)
    return (
      <section className="contenedor seccion">
        <Alerta tipo="aviso">Reserva no encontrada.</Alerta>
      </section>
    );
  const sol = db.solicitud.find((s) => s.id_solicitud === reserva.id_solicitud);
  const v = detalleViaje(db.viaje.find((x) => x.id_viaje === sol.id_viaje));

  const enviar = (f) => {
    try {
      calificar(reserva.id_reserva, Number(f.puntuacion), f.comentario.trim());
      navigate('/mis-viajes', {
        state: { mensaje: '¡Gracias! Su calificación ayuda a la comunidad.' },
      });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="contenedor seccion seccion--estrecha">
      <div className="panel">
        <h1>Calificar viaje</h1>
        <p className="texto-suave">
          {v.origen} → {v.destino} · {fechaHora(v.fecha_hora_salida)} · {v.nombreConductor}
        </p>
        {error && (
          <Alerta tipo="error" onCerrar={() => setError('')}>
            {error}
          </Alerta>
        )}
        <form onSubmit={form.handleSubmit(enviar)} noValidate>
          <SelectorEstrellas
            id="puntuacion"
            valor={Number(form.valores.puntuacion)}
            onChange={(n) => form.setValor('puntuacion', n)}
            error={form.error('puntuacion')}
          />
          <AreaTexto
            id="comentario"
            etiqueta="Comentario"
            maxLength={300}
            ayuda="Opcional. ¿Qué tal la puntualidad, el trato y el vehículo?"
            form={form}
            error={form.error('comentario')}
          />
          <div className="acciones">
            <button type="submit" className="boton boton--primario">
              Enviar calificación
            </button>
            <Link to="/mis-viajes" className="boton boton--fantasma">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
