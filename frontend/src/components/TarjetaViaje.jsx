import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { duracion, fechaHora, pesos } from '../utils/formato.js';
import { Estrellas } from './Estrellas.jsx';
import { IconoAsiento, IconoCarro, IconoFlecha, IconoReloj } from './Iconos.jsx';

/** Tarjeta reutilizable con el resumen de un viaje (vista v_viajes_disponibles). */
export default function TarjetaViaje({ viaje }) {
  const { reputacion } = useData();
  const rep = reputacion(viaje.conductor.id_conductor);
  const lleno = viaje.cupos_disponibles <= 0;
  return (
    <article className="tarjeta-viaje">
      <div className="tarjeta-viaje__ruta">
        <div>
          <p className="tarjeta-viaje__hora">{fechaHora(viaje.fecha_hora_salida)}</p>
          <h3 className="tarjeta-viaje__trayecto">
            {viaje.origen} <IconoFlecha width={18} height={18} /> {viaje.destino}
          </h3>
          <p className="tarjeta-viaje__punto">Encuentro: {viaje.ruta.punto_encuentro}</p>
        </div>
        <p className="tarjeta-viaje__precio">
          {pesos(viaje.costo_por_cupo)}
          <span>por cupo</span>
        </p>
      </div>
      <ul className="tarjeta-viaje__datos">
        <li>
          <IconoReloj width={16} height={16} /> {duracion(viaje.ruta.tiempo_estimado_min)}
        </li>
        <li>
          <IconoCarro width={16} height={16} /> {viaje.vehiculo.marca} {viaje.vehiculo.linea}
        </li>
        <li className={lleno ? 'texto-alerta' : ''}>
          <IconoAsiento width={16} height={16} />{' '}
          {lleno ? 'Sin cupos' : `${viaje.cupos_disponibles} de ${viaje.cupos_ofrecidos} cupos`}
        </li>
      </ul>
      <div className="tarjeta-viaje__pie">
        <div className="tarjeta-viaje__conductor">
          <span className="avatar" aria-hidden="true">
            {viaje.nombreConductor
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div>
            <p>{viaje.nombreConductor}</p>
            <Estrellas valor={rep.promedio} total={rep.total} />
          </div>
        </div>
        <Link
          to={`/viajes/${viaje.id_viaje}`}
          className="boton boton--secundario boton--chico"
          aria-label={`Ver viaje de ${viaje.origen} a ${viaje.destino}`}
        >
          Ver viaje
        </Link>
      </div>
    </article>
  );
}
