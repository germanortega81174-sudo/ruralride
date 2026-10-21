# Lista de chequeo de verificación – Evidencia 6 (frontend)

Proyecto: RuralRide · Evidencia GA7-220501096-AA4-EV01 · Responsable: German Augusto Ortega Angel

La verificación se hizo sobre la versión compilada (`npm run build` + `npm run preview`) en Chromium, en escritorio y en una pantalla de celular de 375 px, además de `npm run lint`, `npm run format:check` y `npm test`.

Primera pasada: 15 de 20 puntos cumplían. Se registraron 5 hallazgos (H1 a H5), se corrigieron en la rama `fix/RR-20-hallazgos-lista-chequeo` (un commit por hallazgo) y en la segunda pasada se cumplieron los 20 puntos.

| N.° | Punto verificado | 1.ª pasada | Hallazgo | 2.ª pasada |
| --- | ---------------- | ---------- | -------- | ---------- |
| 1 | Los componentes de `components/ui` son reutilizables y no tienen lógica de negocio | Cumple | – | Cumple |
| 2 | Vistas (`pages`), lógica (`services`, `hooks`) y estado (`context`) están separados | Cumple | – | Cumple |
| 3 | Los formularios validan obligatoriedad, formato y longitud | Cumple | – | Cumple |
| 4 | Al enviar con errores, el foco va al primer campo inválido | Cumple | – | Cumple |
| 5 | Los errores se anuncian (`role="alert"`, `aria-invalid`) | Cumple | – | Cumple |
| 6 | Todas las rutas están en `AppRouter` y las privadas exigen sesión y rol | Cumple | – | Cumple |
| 7 | Una ruta inexistente muestra la página 404 | Cumple | – | Cumple |
| 8 | Cada página tiene su propio título en la pestaña del navegador | No cumple | H1 | Cumple |
| 9 | El detalle del viaje muestra la ruta de navegación (migas) | Cumple | – | Cumple |
| 10 | Estado compartido en `DataContext` y `AuthContext`; estado local con `useState` | Cumple | – | Cumple |
| 11 | Los datos y la sesión se conservan al recargar la página | Cumple | – | Cumple |
| 12 | Las pruebas automáticas con los datos de prueba pasan (`npm test`) | Cumple (33/33) | – | Cumple (33/33) |
| 13 | La interfaz respeta RN17: un viaje no programado no recibe solicitudes | No cumple | H2 | Cumple |
| 14 | No hay `id` repetidos en una misma página | No cumple | H3 | Cumple |
| 15 | Las listas vacías muestran un mensaje y una acción | No cumple | H4 | Cumple |
| 16 | ESLint sin errores y sin reglas desactivadas en el código | No cumple | H5 | Cumple |
| 17 | El formato cumple Prettier (`npm run format:check`) | Cumple | – | Cumple |
| 18 | En celular (375 px) no hay desplazamiento horizontal | Cumple | – | Cumple |
| 19 | No hay errores de JavaScript en la consola | Cumple | – | Cumple |
| 20 | La aplicación compila sin errores (`npm run build`) | Cumple | – | Cumple |

## Hallazgos y corrección

| Hallazgo | Qué pasaba | Corrección | Commit |
| -------- | ---------- | ---------- | ------ |
| H1 | `/viajes/:id` y `/mis-viajes/calificar/:id` mostraban el título genérico "Detalle" | Función `tituloPara()` en `AppRouter` con títulos para rutas con parámetros | `fix(ui): títulos de pestaña propios…` |
| H2 | En un viaje finalizado se mostraba el formulario y el error de RN17 salía solo al enviar | El panel informa desde el principio que el viaje no recibe solicitudes | `fix(solicitudes): oculta el formulario…` |
| H3 | Dos diálogos en la misma página repetían `id="dialogo-titulo"` | `useId()` de React en `DialogoConfirmacion` | `fix(ui): id único para el título…` |
| H4 | Sin viajes próximos, la sección del Inicio quedaba en blanco | `EstadoVacio` con enlace a la búsqueda | `fix(ui): Inicio informa cuando no hay…` |
| H5 | `BuscarViajesPage` desactivaba la regla `react-hooks/exhaustive-deps` | Filtros derivados con `useMemo` y dependencias completas | `refactor(solicitudes): quita el eslint-disable…` |
