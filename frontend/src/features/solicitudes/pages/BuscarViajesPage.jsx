import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import { Campo, Selector } from '@/components/ui/Campos.jsx';
import TarjetaViaje from '@/features/solicitudes/components/TarjetaViaje.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import { rango } from '@/utils/validaciones.js';

/** RF03.1 – Buscar rutas y viajes. Los filtros se guardan en la URL para poder compartir la búsqueda. */
export default function BuscarViajesPage() {
  const { db, detalleViaje } = useData();
  const [params, setParams] = useSearchParams();
  const filtros = {
    origen: params.get('origen') || '',
    destino: params.get('destino') || '',
    fecha: params.get('fecha') || '',
    cupos: params.get('cupos') || '1',
  };
  const form = useFormulario(filtros, (v) => ({
    destino: v.origen && v.origen === v.destino ? 'El destino debe ser distinto del origen.' : '',
    cupos: rango(v.cupos, 1, 6, 'Los cupos'),
  }));
  const municipios = db.municipio.map((m) => ({ valor: String(m.id_municipio), texto: m.nombre }));

  const resultados = useMemo(
    () =>
      db.viaje
        .filter((v) => v.estado === 'PROGRAMADO')
        .map(detalleViaje)
        .filter((v) => !filtros.origen || v.ruta.id_municipio_origen === Number(filtros.origen))
        .filter((v) => !filtros.destino || v.ruta.id_municipio_destino === Number(filtros.destino))
        .filter((v) => !filtros.fecha || v.fecha_hora_salida.startsWith(filtros.fecha))
        .filter((v) => v.cupos_disponibles >= Number(filtros.cupos || 1))
        .sort((a, b) => a.fecha_hora_salida.localeCompare(b.fecha_hora_salida)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, params]
  );

  const aplicar = (v) => setParams(Object.fromEntries(Object.entries(v).filter(([, x]) => x)));

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Buscar viajes"
        subtitulo="Viajes programados con cupos disponibles."
      />
      <div className="buscar">
        <form
          className="panel buscar__filtros"
          onSubmit={form.handleSubmit(aplicar)}
          noValidate
          aria-label="Filtros de búsqueda"
        >
          <h2 className="h3">Filtros</h2>
          <Selector id="origen" etiqueta="Origen" form={form} opciones={municipios} vacio="Todos" />
          <Selector
            id="destino"
            etiqueta="Destino"
            form={form}
            opciones={municipios}
            vacio="Todos"
            error={form.error('destino')}
          />
          <Campo id="fecha" etiqueta="Fecha" type="date" form={form} />
          <Campo
            id="cupos"
            etiqueta="Cupos que necesita"
            type="number"
            min={1}
            max={6}
            form={form}
            error={form.error('cupos')}
          />
          <div className="acciones">
            <button type="submit" className="boton boton--primario">
              Aplicar
            </button>
            <button
              type="button"
              className="boton boton--fantasma"
              onClick={() => {
                form.reset();
                setParams({});
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
        <div className="buscar__resultados">
          <p className="texto-suave" aria-live="polite">
            {resultados.length} viaje(s) encontrado(s)
          </p>
          {resultados.length ? (
            <div className="lista-tarjetas">
              {resultados.map((v) => (
                <TarjetaViaje key={v.id_viaje} viaje={v} />
              ))}
            </div>
          ) : (
            <p className="estado-vacio">
              No hay viajes con esos filtros. Pruebe con otra fecha o municipio.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
