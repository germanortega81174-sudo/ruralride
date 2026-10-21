import { Link } from 'react-router-dom'

export default function NoEncontrado() {
  return (
    <section className="contenedor seccion seccion--estrecha texto-centro">
      <h1>Página no encontrada</h1>
      <p className="texto-suave">El camino que busca no existe o cambió de lugar.</p>
      <Link to="/" className="boton boton--primario">Volver al inicio</Link>
    </section>
  )
}
