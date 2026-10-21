import { Outlet } from 'react-router-dom'
import Encabezado from './Encabezado.jsx'
import PiePagina from './PiePagina.jsx'

/** Estructura común de todas las páginas: enlace para saltar al contenido, encabezado, contenido y pie. */
export default function Plantilla() {
  return (
    <>
      <a href="#contenido" className="saltar">Saltar al contenido principal</a>
      <Encabezado />
      <main id="contenido" tabIndex="-1">
        <Outlet />
      </main>
      <PiePagina />
    </>
  )
}
