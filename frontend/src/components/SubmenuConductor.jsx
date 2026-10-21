import { NavLink } from 'react-router-dom'

export default function SubmenuConductor() {
  const items = [
    { to: '/conductor', texto: 'Resumen', end: true },
    { to: '/conductor/vehiculos', texto: 'Mis vehículos' },
    { to: '/conductor/rutas', texto: 'Mis rutas' },
    { to: '/conductor/publicar', texto: 'Publicar viaje' },
  ]
  return (
    <nav className="submenu" aria-label="Secciones del conductor">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end} className="submenu__enlace">{i.texto}</NavLink>
      ))}
    </nav>
  )
}
