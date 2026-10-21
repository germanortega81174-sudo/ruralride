import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/DataContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import { Campo, Selector } from '@/components/ui/Campos.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import SubmenuConductor from '@/features/viajes/components/SubmenuConductor.jsx';
import * as val from '@/utils/validaciones.js';
import { pesos } from '@/utils/formato.js';

/** RF02.2 a RF02.5 – Publicar un viaje: ruta, horario, costo y cupos. */
export default function PublicarViajePage() {
  const { sesion } = useAuth();
  const { db, municipio, publicarViaje, validacionVigente } = useData();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const c = sesion.conductor;
  const rutas = db.ruta.filter((r) => r.id_conductor === c.id_conductor && r.estado === 'ACTIVA');
  const vehiculos = db.vehiculo.filter(
    (v) => v.id_conductor === c.id_conductor && v.estado === 'ACTIVO'
  );
  const aprobado = validacionVigente(c.id_conductor)?.estado === 'APROBADA';

  const form = useFormulario(
    {
      id_ruta: '',
      id_vehiculo: '',
      fecha_hora_salida: '',
      costo_por_cupo: '',
      cupos_ofrecidos: '',
    },
    (v) => {
      const veh = vehiculos.find((x) => x.id_vehiculo === Number(v.id_vehiculo));
      return {
        id_ruta: val.requerido(v.id_ruta, 'La ruta'),
        id_vehiculo: val.requerido(v.id_vehiculo, 'El vehículo'),
        fecha_hora_salida: val.primeraFalla(
          val.requerido(v.fecha_hora_salida, 'La fecha y hora'),
          val.fechaFutura(v.fecha_hora_salida)
        ),
        costo_por_cupo: val.primeraFalla(
          val.requerido(v.costo_por_cupo, 'El aporte'),
          val.rango(v.costo_por_cupo, 0, 500000, 'El aporte')
        ),
        cupos_ofrecidos: val.primeraFalla(
          val.requerido(v.cupos_ofrecidos, 'Los cupos'),
          val.rango(v.cupos_ofrecidos, 1, veh ? veh.capacidad : 20, 'Los cupos')
        ),
      };
    }
  );
  const veh = vehiculos.find((x) => x.id_vehiculo === Number(form.valores.id_vehiculo));

  const enviar = (v) => {
    try {
      publicarViaje({
        id_ruta: Number(v.id_ruta),
        id_vehiculo: Number(v.id_vehiculo),
        fecha_hora_salida: `${v.fecha_hora_salida}:00`,
        costo_por_cupo: Number(v.costo_por_cupo),
        cupos_ofrecidos: Number(v.cupos_ofrecidos),
      });
      navigate('/conductor', {
        state: { mensaje: 'Viaje publicado. Ya aparece en la búsqueda de los pasajeros.' },
      });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Publicar viaje"
        subtitulo="Defina el horario, el aporte por cupo y los cupos que ofrece."
      />
      <SubmenuConductor />
      {!aprobado && (
        <Alerta tipo="aviso" titulo="Validación pendiente">
          Solo los conductores con validación APROBADA pueden publicar viajes (RN15).
        </Alerta>
      )}
      {aprobado && (!rutas.length || !vehiculos.length) && (
        <Alerta tipo="info">Primero registre al menos una ruta y un vehículo.</Alerta>
      )}
      {error && (
        <Alerta tipo="error" onCerrar={() => setError('')}>
          {error}
        </Alerta>
      )}
      <form
        className="panel seccion--media"
        onSubmit={form.handleSubmit(enviar)}
        noValidate
        aria-label="Publicar viaje"
      >
        <fieldset
          disabled={!aprobado || !rutas.length || !vehiculos.length}
          className="grupo grupo--plano"
        >
          <legend className="sr-only">Datos del viaje</legend>
          <Selector
            id="id_ruta"
            etiqueta="Ruta"
            requerido
            form={form}
            error={form.error('id_ruta')}
            opciones={rutas.map((r) => ({
              valor: String(r.id_ruta),
              texto: `${municipio(r.id_municipio_origen).nombre} → ${municipio(r.id_municipio_destino).nombre} (${r.punto_encuentro})`,
            }))}
          />
          <Selector
            id="id_vehiculo"
            etiqueta="Vehículo"
            requerido
            form={form}
            error={form.error('id_vehiculo')}
            opciones={vehiculos.map((v) => ({
              valor: String(v.id_vehiculo),
              texto: `${v.placa} – ${v.marca} ${v.linea} (${v.capacidad} puestos)`,
            }))}
          />
          <div className="rejilla-2">
            <Campo
              id="fecha_hora_salida"
              etiqueta="Fecha y hora de salida"
              type="datetime-local"
              requerido
              form={form}
              error={form.error('fecha_hora_salida')}
            />
            <Campo
              id="costo_por_cupo"
              etiqueta="Aporte por cupo (COP)"
              type="number"
              min={0}
              step={500}
              requerido
              inputMode="numeric"
              form={form}
              error={form.error('costo_por_cupo')}
              ayuda="Aporte solidario para combustible."
            />
            <Campo
              id="cupos_ofrecidos"
              etiqueta="Cupos ofrecidos"
              type="number"
              min={1}
              max={veh?.capacidad || 20}
              requerido
              form={form}
              error={form.error('cupos_ofrecidos')}
              ayuda={
                veh
                  ? `Máximo ${veh.capacidad} según la capacidad del vehículo.`
                  : 'Seleccione primero el vehículo.'
              }
            />
          </div>
          {form.valores.costo_por_cupo && form.valores.cupos_ofrecidos && (
            <p className="total">
              Si llena el vehículo recibirá:{' '}
              <strong>
                {pesos(Number(form.valores.costo_por_cupo) * Number(form.valores.cupos_ofrecidos))}
              </strong>
            </p>
          )}
          <button type="submit" className="boton boton--primario">
            Publicar viaje
          </button>
        </fieldset>
      </form>
    </section>
  );
}
