import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Plantilla from '@/components/layout/Plantilla.jsx';
import RutaProtegida from '@/routes/RutaProtegida.jsx';
import InicioPage from '@/pages/InicioPage.jsx';
import IngresarPage from '@/features/auth/pages/IngresarPage.jsx';
import RegistroPage from '@/features/auth/pages/RegistroPage.jsx';
import RecuperarPasswordPage from '@/features/auth/pages/RecuperarPasswordPage.jsx';
import PerfilPage from '@/features/auth/pages/PerfilPage.jsx';
import BuscarViajesPage from '@/features/solicitudes/pages/BuscarViajesPage.jsx';
import DetalleViajePage from '@/features/solicitudes/pages/DetalleViajePage.jsx';
import MisViajesPage from '@/features/solicitudes/pages/MisViajesPage.jsx';
import CalificarPage from '@/features/calificaciones/pages/CalificarPage.jsx';
import PanelConductorPage from '@/features/viajes/pages/PanelConductorPage.jsx';
import MisVehiculosPage from '@/features/viajes/pages/MisVehiculosPage.jsx';
import MisRutasPage from '@/features/viajes/pages/MisRutasPage.jsx';
import PublicarViajePage from '@/features/viajes/pages/PublicarViajePage.jsx';
import AdminValidacionesPage from '@/features/validaciones/pages/AdminValidacionesPage.jsx';
import NoEncontradoPage from '@/pages/NoEncontradoPage.jsx';

const TITULOS = {
  '/': 'Inicio',
  '/ingresar': 'Ingresar',
  '/registro': 'Crear cuenta',
  '/recuperar-contrasena': 'Recuperar contraseña',
  '/perfil': 'Mi perfil',
  '/viajes': 'Buscar viajes',
  '/mis-viajes': 'Mis viajes',
  '/conductor': 'Panel del conductor',
  '/conductor/vehiculos': 'Mis vehículos',
  '/conductor/rutas': 'Mis rutas',
  '/conductor/publicar': 'Publicar viaje',
  '/admin/validaciones': 'Validación comunitaria',
};

/** Al cambiar de página: actualiza el título, sube al inicio y mueve el foco al contenido (accesibilidad). */
function GestorNavegacion() {
  const { pathname } = useLocation();
  const primeraCarga = useRef(true);
  useEffect(() => {
    document.title = `${TITULOS[pathname] || 'Detalle'} | RuralRide`;
    if (primeraCarga.current) {
      primeraCarga.current = false; // en la carga inicial el foco queda en el enlace "Saltar al contenido"
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('contenido')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  return (
    <>
      <GestorNavegacion />
      <Routes>
        <Route element={<Plantilla />}>
          <Route index element={<InicioPage />} />
          <Route path="ingresar" element={<IngresarPage />} />
          <Route path="registro" element={<RegistroPage />} />
          <Route path="recuperar-contrasena" element={<RecuperarPasswordPage />} />
          <Route path="viajes" element={<BuscarViajesPage />} />
          <Route path="viajes/:id" element={<DetalleViajePage />} />
          <Route
            path="perfil"
            element={
              <RutaProtegida>
                <PerfilPage />
              </RutaProtegida>
            }
          />
          <Route
            path="mis-viajes"
            element={
              <RutaProtegida rol="pasajero">
                <MisViajesPage />
              </RutaProtegida>
            }
          />
          <Route
            path="mis-viajes/calificar/:id"
            element={
              <RutaProtegida rol="pasajero">
                <CalificarPage />
              </RutaProtegida>
            }
          />
          <Route
            path="conductor"
            element={
              <RutaProtegida rol="conductor">
                <PanelConductorPage />
              </RutaProtegida>
            }
          />
          <Route
            path="conductor/vehiculos"
            element={
              <RutaProtegida rol="conductor">
                <MisVehiculosPage />
              </RutaProtegida>
            }
          />
          <Route
            path="conductor/rutas"
            element={
              <RutaProtegida rol="conductor">
                <MisRutasPage />
              </RutaProtegida>
            }
          />
          <Route
            path="conductor/publicar"
            element={
              <RutaProtegida rol="conductor">
                <PublicarViajePage />
              </RutaProtegida>
            }
          />
          <Route
            path="admin/validaciones"
            element={
              <RutaProtegida rol="administrador">
                <AdminValidacionesPage />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<NoEncontradoPage />} />
        </Route>
      </Routes>
    </>
  );
}
