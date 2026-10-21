# RuralRide – Frontend (versión inicial)

Primera versión funcional del frontend de **RuralRide – Plataforma de Transporte Solidario Rural**
(Evidencia GA6-220501096-AA3/AA4-EV01, SENA – ADSO 3336056).

> En esta etapa la interfaz **no se conecta al backend**. Los datos de prueba (`src/data/datosPrueba.json`)
> se exportaron de la base de datos MySQL `ruralride` de la Evidencia 2 y las reglas de negocio se
> simulan en `src/context/DataContext.jsx`. Los cambios se pierden al recargar la página.

## Requisitos
- Node.js 20.19 o superior (LTS recomendado)

## Ejecutar
```bash
npm install
npm run dev        # abre http://localhost:5173
```
Compilar para producción: `npm run build` y luego `npm run preview`.

## Cuentas de prueba (contraseña: `RuralRide2026*`)
| Rol | Correo |
|---|---|
| Pasajero | carlos.perez@gmail.com |
| Conductor | juan.lopez@gmail.com |
| Conductora y pasajera | rosa.gutierrez@gmail.com |
| Administradora | luzmarina.pabon@ruralride.co |

## Estructura
```
src/
  components/   Componentes reutilizables (Encabezado, PiePagina, Campos, TablaDatos, TarjetaViaje, Alerta, Insignia, Estrellas…)
  context/      DataContext (datos y reglas de negocio) y AuthContext (sesión simulada)
  data/         Datos de prueba exportados de la base de datos
  hooks/        useFormulario: formularios controlados con validación
  pages/        Vistas: Inicio, Ingresar, Registro, RecuperarPassword, Perfil, BuscarViajes, DetalleViaje,
                MisViajes, Calificar, PanelConductor, MisVehiculos, MisRutas, PublicarViaje, AdminValidaciones
  utils/        Validaciones (obligatoriedad, formato, longitud) y formato de fechas y moneda
  App.jsx       Rutas con React Router
  index.css     Estilos, diseño responsivo y accesibilidad
```

## Rutas
| Ruta | Vista | Requerimiento |
|---|---|---|
| `/` | Inicio y buscador | RF03.1 |
| `/ingresar`, `/registro`, `/recuperar-contrasena` | Autenticación | RF01.1–RF01.3 |
| `/perfil` | Perfil y solicitud para ser conductor | RF01.4 |
| `/viajes`, `/viajes/:id` | Buscar viajes y solicitar cupo | RF03.1–RF03.3 |
| `/mis-viajes`, `/mis-viajes/calificar/:id` | Solicitudes, reservas, historial y calificación | RF03.4, RF03.5, SP.1 |
| `/conductor`, `/conductor/vehiculos`, `/conductor/rutas`, `/conductor/publicar` | Panel del conductor | RF02, RF03.4 |
| `/admin/validaciones` | Validación comunitaria | RF04 |
