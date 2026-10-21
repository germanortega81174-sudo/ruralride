# RuralRide – Plataforma de Transporte Solidario Rural

RuralRide conecta a conductores de las veredas de Arauca, validados por su Junta de Acción Comunal, con vecinos que necesitan llegar a la cabecera municipal, al colegio o al centro de salud. El conductor publica sus viajes con horario, costo por cupo y cupos libres; el pasajero busca, solicita un cupo, recibe un código de reserva y al final califica el servicio.

Proyecto formativo del SENA – Tecnología en Análisis y Desarrollo de Software, ficha 3336056.
Autor: German Augusto Ortega Angel.

## Contenido del repositorio

| Carpeta     | Qué contiene                                                                 |
| ----------- | ---------------------------------------------------------------------------- |
| `frontend/` | Aplicación web en React 19 + Vite (interfaz con datos de prueba)             |
| `database/` | Scripts SQL de la base de datos `ruralride` (MySQL 8 / MariaDB 10.4)         |
| `.github/`  | Plantilla de pull request usada en la revisión de código                     |
| `docs/`     | Lista de chequeo de verificación del frontend (Evidencia 6)                  |

El backend en Node.js + Express está planeado en el backlog (tareas RR-05 en adelante); por ahora el frontend trabaja con los datos de prueba exportados de la base de datos.

## Requisitos

- **Node.js 20.19 o superior** (LTS recomendado) y npm.
- **XAMPP** con MySQL/MariaDB 10.4 o **MySQL 8**, para la base de datos.
- **Git** 2.40 o superior.

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/germanortega81174-sudo/ruralride.git
   cd ruralride
   ```
2. Crear la base de datos: abrir phpMyAdmin (http://localhost/phpmyadmin), pestaña **SQL**, y ejecutar en orden los scripts `01` a `05` de `database/scripts/`. El script `06` contiene pruebas de integridad que fallan a propósito; se ejecutan una por una.
3. Instalar y ejecutar el frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Abrir http://localhost:5173 e ingresar con una cuenta de prueba (ver `frontend/README.md`).

## Scripts del frontend

| Comando                | Para qué sirve                               |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                        |
| `npm run build`        | Compila la versión de producción en `dist/`   |
| `npm test`             | Ejecuta las 33 pruebas con Vitest             |
| `npm run lint`         | Revisa la calidad del código con ESLint       |
| `npm run format`       | Aplica el formato de Prettier                 |

## Flujo de trabajo con Git

- `main`: versión estable que se entrega; cada entrega lleva una etiqueta (`v0.4.0`, `v0.5.0`, …).
- `develop`: rama de integración.
- `feature/RR-NN-descripcion`, `fix/RR-NN-descripcion`, `docs/RR-NN-descripcion`: una rama por tarea del backlog.
- Mensajes de commit con Conventional Commits en español: `tipo(alcance): descripción` y `Refs: RR-NN`.

Tablero del proyecto: https://github.com/users/germanortega81174-sudo/projects/1/views/1
