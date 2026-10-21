import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useFormulario } from '../hooks/useFormulario.js'
import { Selector, Campo } from '../components/Campos.jsx'
import TarjetaViaje from '../components/TarjetaViaje.jsx'
import { IconoBuscar, IconoEscudo, IconoEstrella, IconoUbicacion } from '../components/Iconos.jsx'

export default function Inicio() {
  const { db, detalleViaje } = useData()
  const navigate = useNavigate()
  const municipios = db.municipio.map((m) => ({ valor: String(m.id_municipio), texto: `${m.nombre} (${m.departamento})` }))
  const form = useFormulario({ origen: '', destino: '', fecha: '' }, (v) => ({
    destino: v.origen && v.origen === v.destino ? 'El destino debe ser distinto del origen.' : '',
  }))

  const proximos = db.viaje
    .filter((v) => v.estado === 'PROGRAMADO')
    .map(detalleViaje)
    .filter((v) => v.cupos_disponibles > 0)
    .sort((a, b) => a.fecha_hora_salida.localeCompare(b.fecha_hora_salida))
    .slice(0, 3)

  const buscar = (v) => {
    const q = new URLSearchParams(Object.entries(v).filter(([, x]) => x)).toString()
    navigate(`/viajes${q ? `?${q}` : ''}`)
  }

  return (
    <>
      <section className="heroe">
        <div className="contenedor heroe__contenido">
          <div className="heroe__texto">
            <p className="heroe__antetitulo">Transporte solidario rural · Arauca</p>
            <h1>De la vereda al pueblo, con vecinos de confianza.</h1>
            <p className="heroe__bajada">
              Conductores validados por su comunidad publican sus recorridos y los pasajeros reservan un cupo en minutos.
            </p>
          </div>
          <form className="buscador" onSubmit={form.handleSubmit(buscar)} noValidate aria-label="Buscar viajes">
            <h2 className="buscador__titulo">¿A dónde va?</h2>
            <Selector id="origen" etiqueta="Origen" form={form} opciones={municipios} vacio="Cualquier municipio" />
            <Selector id="destino" etiqueta="Destino" form={form} opciones={municipios} vacio="Cualquier municipio" error={form.error('destino')} />
            <Campo id="fecha" etiqueta="Fecha del viaje" type="date" form={form} />
            <button type="submit" className="boton boton--primario boton--bloque">
              <IconoBuscar /> Buscar viajes
            </button>
          </form>
        </div>
      </section>

      <section className="contenedor seccion" aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="seccion__titulo">Cómo funciona</h2>
        <ol className="pasos">
          <li className="paso">
            <span className="paso__icono"><IconoUbicacion /></span>
            <h3>Busque su ruta</h3>
            <p>Elija el municipio de salida y de llegada, y vea los viajes programados con cupos libres.</p>
          </li>
          <li className="paso">
            <span className="paso__icono"><IconoEscudo /></span>
            <h3>Solicite su cupo</h3>
            <p>El conductor, aprobado por la Junta de Acción Comunal, acepta su solicitud y usted recibe un código de reserva.</p>
          </li>
          <li className="paso">
            <span className="paso__icono"><IconoEstrella /></span>
            <h3>Viaje y califique</h3>
            <p>Al terminar, califique el servicio. Las opiniones ayudan a toda la comunidad a viajar segura.</p>
          </li>
        </ol>
      </section>

      <section className="seccion seccion--tinte" aria-labelledby="proximos">
        <div className="contenedor">
          <h2 id="proximos" className="seccion__titulo">Próximos viajes con cupos</h2>
          <div className="rejilla-tarjetas">
            {proximos.map((v) => <TarjetaViaje key={v.id_viaje} viaje={v} />)}
          </div>
        </div>
      </section>
    </>
  )
}
