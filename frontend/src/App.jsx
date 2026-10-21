import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Plantilla from './components/Plantilla.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import Inicio from './pages/Inicio.jsx'
import Ingresar from './pages/Ingresar.jsx'
import Registro from './pages/Registro.jsx'
import RecuperarPassword from './pages/RecuperarPassword.jsx'
import Perfil from './pages/Perfil.jsx'
import BuscarViajes from './pages/BuscarViajes.jsx'
import DetalleViaje from './pages/DetalleViaje.jsx'
import MisViajes from './pages/MisViajes.jsx'
import Calificar from './pages/Calificar.jsx'
import PanelConductor from './pages/PanelConductor.jsx'
import MisVehiculos from './pages/MisVehiculos.jsx'
import MisRutas from './pages/MisRutas.jsx'
import PublicarViaje from './pages/PublicarViaje.jsx'
import AdminValidaciones from './pages/AdminValidaciones.jsx'
import NoEncontrado from './pages/NoEncontrado.jsx'

const TITULOS = {
  '/': 'Inicio', '/ingresar': 'Ingresar', '/registro': 'Crear cuenta', '/recuperar-contrasena': 'Recuperar contraseña',
  '/perfil': 'Mi perfil', '/viajes': 'Buscar viajes', '/mis-viajes': 'Mis viajes', '/conductor': 'Panel del conductor',
  '/conductor/vehiculos': 'Mis vehículos', '/conductor/rutas': 'Mis rutas', '/conductor/publicar': 'Publicar viaje',
  '/admin/validaciones': 'Validación comunitaria',
}

/** Al cambiar de página: actualiza el título, sube al inicio y mueve el foco al contenido (accesibilidad). */
function GestorNavegacion() {
  const { pathname } = useLocation()
  const primeraCarga = useRef(true)
  useEffect(() => {
    document.title = `${TITULOS[pathname] || 'Detalle'} | RuralRide`
    if (primeraCarga.current) {
      primeraCarga.current = false // en la carga inicial el foco queda en el enlace "Saltar al contenido"
      return
    }
    window.scrollTo(0, 0)
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <GestorNavegacion />
      <Routes>
        <Route element={<Plantilla />}>
          <Route index element={<Inicio />} />
          <Route path="ingresar" element={<Ingresar />} />
          <Route path="registro" element={<Registro />} />
          <Route path="recuperar-contrasena" element={<RecuperarPassword />} />
          <Route path="viajes" element={<BuscarViajes />} />
          <Route path="viajes/:id" element={<DetalleViaje />} />
          <Route path="perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
          <Route path="mis-viajes" element={<RutaProtegida rol="pasajero"><MisViajes /></RutaProtegida>} />
          <Route path="mis-viajes/calificar/:id" element={<RutaProtegida rol="pasajero"><Calificar /></RutaProtegida>} />
          <Route path="conductor" element={<RutaProtegida rol="conductor"><PanelConductor /></RutaProtegida>} />
          <Route path="conductor/vehiculos" element={<RutaProtegida rol="conductor"><MisVehiculos /></RutaProtegida>} />
          <Route path="conductor/rutas" element={<RutaProtegida rol="conductor"><MisRutas /></RutaProtegida>} />
          <Route path="conductor/publicar" element={<RutaProtegida rol="conductor"><PublicarViaje /></RutaProtegida>} />
          <Route path="admin/validaciones" element={<RutaProtegida rol="administrador"><AdminValidaciones /></RutaProtegida>} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </>
  )
}
