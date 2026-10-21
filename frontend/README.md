# RuralRide – Frontend

Frontend de **RuralRide – Plataforma de Transporte Solidario Rural** en React 19 + Vite.
Versión de la Evidencia 6 (GA7-220501096-AA4-EV01): módulos organizados por requerimiento,
componentes reutilizables, reglas de negocio separadas y pruebas automáticas.

> El frontend todavía **no se conecta al backend**. Usa los datos de prueba exportados de la base
> de datos `ruralride` (`src/data/datosPrueba.json`). Los cambios se guardan en el navegador y se
> pueden borrar con **Restablecer datos de prueba**, en el pie de página.

## Requisitos

- Node.js 20.19 o superior (LTS recomendado)

## Ejecutar

```bash
npm install
npm run dev        # abre http://localhost:5173
npm test           # 33 pruebas con Vitest
npm run lint       # ESLint
npm run build      # versión de producción en dist/
```

## Cuentas de prueba (contraseña: `RuralRide2026*`)

| Rol                   | Correo                       | Documento  | Qué se puede probar                        |
| --------------------- | ---------------------------- | ---------- | ------------------------------------------ |
| Pasajero              | carlos.perez@gmail.com       | 1117123654 | Buscar viajes, solicitar cupo, calificar   |
| Conductor             | juan.lopez@gmail.com         | 1116784523 | Vehículos, rutas, publicar viajes, aprobar |
| Conductora y pasajera | rosa.gutierrez@gmail.com     | 1116452390 | Los dos roles con la misma cuenta          |
| Administradora        | luzmarina.pabon@ruralride.co | 68291045   | Validación comunitaria de conductores      |

## Estructura

```
src/
  components/ui/        Piezas reutilizables: CampoTexto, CampoSelector, CampoArea, TablaDatos,
                        Pestanas, Migas, EstadoVacio, DialogoConfirmacion, Alerta, Insignia, Estrellas
  components/layout/    Encabezado, PiePagina, Plantilla, Logo
  features/auth/        RF-01: IngresarPage, RegistroPage, RecuperarPasswordPage, PerfilPage
  features/viajes/      RF-02: PanelConductorPage, MisVehiculosPage, MisRutasPage, PublicarViajePage
  features/solicitudes/ RF-03: BuscarViajesPage, DetalleViajePage, MisViajesPage, TarjetaViaje
  features/validaciones/RF-04: AdminValidacionesPage
  features/calificaciones/ RF-05: CalificarPage
  pages/                InicioPage y NoEncontradoPage
  routes/               AppRouter (todas las rutas) y RutaProtegida (sesión y rol)
  context/              DataContext (estado compartido) y AuthContext (sesión)
  services/             reglasNegocio.js (RN05–RN22, funciones puras) y almacenamiento.js
  hooks/                useFormulario: formularios controlados con validación
  utils/                validaciones, formato y accesibilidad
  data/                 Datos de prueba exportados de la base de datos
```

## Rutas

| Ruta                                                                            | Vista                                           | Requerimiento        |
| ------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------- |
| `/`                                                                             | Inicio y buscador                               | RF03.1               |
| `/ingresar`, `/registro`, `/recuperar-contrasena`                               | Autenticación                                   | RF01.1–RF01.3        |
| `/perfil`                                                                       | Perfil y solicitud para ser conductor           | RF01.4               |
| `/viajes`, `/viajes/:id`                                                        | Buscar viajes y solicitar cupo                  | RF03.1–RF03.3        |
| `/mis-viajes`, `/mis-viajes/calificar/:id`                                      | Solicitudes, reservas, historial y calificación | RF03.4, RF03.5, SP.1 |
| `/conductor`, `/conductor/vehiculos`, `/conductor/rutas`, `/conductor/publicar` | Panel del conductor                             | RF02, RF03.4         |
| `/admin/validaciones`                                                           | Validación comunitaria                          | RF04                 |
