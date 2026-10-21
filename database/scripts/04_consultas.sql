-- =====================================================================
-- RuralRide – Script 04: Consultas (SELECT con JOIN, filtros y orden)
-- Evidencia: GA6-220501096-AA2-EV01
-- Cada consulta responde a una necesidad real del sistema (RF01–RF04).
-- =====================================================================
SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
USE ruralride;

-- C01 (RF01) Inicio de sesión: buscar la cuenta activa por correo y sus roles
SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.estado,
       IF(c.id_conductor IS NULL, 'No', 'Sí')    AS es_conductor,
       IF(p.id_pasajero IS NULL, 'No', 'Sí')     AS es_pasajero,
       IF(a.id_administrador IS NULL, 'No', 'Sí') AS es_administrador
  FROM usuario u
  LEFT JOIN conductor c     ON c.id_usuario = u.id_usuario
  LEFT JOIN pasajero p      ON p.id_usuario = u.id_usuario
  LEFT JOIN administrador a ON a.id_usuario = u.id_usuario
 WHERE u.correo = 'rosa.gutierrez@gmail.com'
   AND u.estado = 'ACTIVO';

-- C02 (RF03) Buscar viajes programados de Arauca a Arauquita con cupos libres,
--            ordenados por fecha de salida
SELECT id_viaje, origen, destino, punto_encuentro, fecha_hora_salida,
       costo_por_cupo, cupos_disponibles, conductor, vehiculo, placa
  FROM v_viajes_disponibles
 WHERE origen = 'Arauca' AND destino = 'Arauquita'
   AND estado = 'PROGRAMADO'
   AND cupos_disponibles > 0
   AND fecha_hora_salida >= '2026-10-05'
 ORDER BY fecha_hora_salida ASC;

-- C03 (RF02) Todos los viajes programados con municipio de origen/destino,
--            conductor y vehículo (JOIN de 6 tablas), del más próximo al más lejano
SELECT v.id_viaje,
       mo.nombre AS origen, md.nombre AS destino,
       DATE_FORMAT(v.fecha_hora_salida, '%d/%m/%Y %H:%i') AS salida,
       v.costo_por_cupo, v.cupos_ofrecidos,
       CONCAT(u.nombre, ' ', u.apellido) AS conductor,
       CONCAT(ve.tipo, ' ', ve.placa) AS vehiculo
  FROM viaje v
  JOIN ruta r       ON r.id_ruta = v.id_ruta
  JOIN municipio mo ON mo.id_municipio = r.id_municipio_origen
  JOIN municipio md ON md.id_municipio = r.id_municipio_destino
  JOIN conductor c  ON c.id_conductor = r.id_conductor
  JOIN usuario u    ON u.id_usuario = c.id_usuario
  JOIN vehiculo ve  ON ve.id_vehiculo = v.id_vehiculo
 WHERE v.estado = 'PROGRAMADO'
 ORDER BY v.fecha_hora_salida, mo.nombre;

-- C04 (RF03) Solicitudes PENDIENTES que debe responder cada conductor
SELECT CONCAT(uc.nombre, ' ', uc.apellido) AS conductor,
       s.id_solicitud, v.id_viaje,
       DATE_FORMAT(v.fecha_hora_salida, '%d/%m/%Y %H:%i') AS salida,
       CONCAT(up.nombre, ' ', up.apellido) AS pasajero,
       up.telefono AS telefono_pasajero,
       s.cupos_solicitados,
       fn_cupos_disponibles(v.id_viaje) AS cupos_disponibles
  FROM solicitud s
  JOIN pasajero p   ON p.id_pasajero = s.id_pasajero
  JOIN usuario up   ON up.id_usuario = p.id_usuario
  JOIN viaje v      ON v.id_viaje = s.id_viaje
  JOIN ruta r       ON r.id_ruta = v.id_ruta
  JOIN conductor c  ON c.id_conductor = r.id_conductor
  JOIN usuario uc   ON uc.id_usuario = c.id_usuario
 WHERE s.estado = 'PENDIENTE'
 ORDER BY conductor, v.fecha_hora_salida, s.fecha_solicitud;

-- C05 (RF03) Historial de viajes y reservas de un pasajero (vista)
SELECT pasajero, codigo_reserva, origen, destino, fecha_hora_salida,
       cupos_solicitados, valor_total, estado_reserva
  FROM v_historial_pasajero
 WHERE id_pasajero = 1
 ORDER BY fecha_hora_salida DESC;

-- C06 (RF04) Estado de validación vigente de todos los conductores
SELECT ev.id_conductor, ev.conductor, ev.estado_validacion,
       DATE_FORMAT(ev.fecha_validacion, '%d/%m/%Y') AS fecha_validacion,
       ev.observaciones
  FROM v_estado_validacion_conductor ev
 ORDER BY FIELD(ev.estado_validacion, 'PENDIENTE', 'RECHAZADA', 'APROBADA'), ev.conductor;

-- C07 (RF04) Validaciones resueltas por cada administrador (JOIN + GROUP BY)
SELECT CONCAT(u.nombre, ' ', u.apellido) AS administrador, a.cargo,
       SUM(va.estado = 'APROBADA')  AS aprobadas,
       SUM(va.estado = 'RECHAZADA') AS rechazadas,
       COUNT(*) AS total
  FROM validacion va
  JOIN administrador a ON a.id_administrador = va.id_administrador
  JOIN usuario u       ON u.id_usuario = a.id_usuario
 GROUP BY a.id_administrador, u.nombre, u.apellido, a.cargo
 ORDER BY total DESC;

-- C08 (Calificación) Ranking de conductores por calificación promedio
SELECT conductor, total_calificaciones, calificacion_promedio
  FROM v_reputacion_conductor
 WHERE total_calificaciones > 0
 ORDER BY calificacion_promedio DESC, total_calificaciones DESC;

-- C09 (RF02) Ocupación e ingresos por viaje finalizado (JOIN + agregación + HAVING)
SELECT v.id_viaje,
       CONCAT(mo.nombre, ' → ', md.nombre) AS trayecto,
       DATE(v.fecha_hora_salida) AS fecha,
       v.cupos_ofrecidos,
       SUM(s.cupos_solicitados) AS cupos_ocupados,
       ROUND(SUM(s.cupos_solicitados) / v.cupos_ofrecidos * 100, 1) AS ocupacion_pct,
       SUM(s.cupos_solicitados * v.costo_por_cupo) AS aporte_total
  FROM viaje v
  JOIN ruta r       ON r.id_ruta = v.id_ruta
  JOIN municipio mo ON mo.id_municipio = r.id_municipio_origen
  JOIN municipio md ON md.id_municipio = r.id_municipio_destino
  JOIN solicitud s  ON s.id_viaje = v.id_viaje
  JOIN reserva re   ON re.id_solicitud = s.id_solicitud
 WHERE v.estado = 'FINALIZADO' AND re.estado = 'COMPLETADA'
 GROUP BY v.id_viaje, mo.nombre, md.nombre, v.fecha_hora_salida, v.cupos_ofrecidos
HAVING cupos_ocupados > 0
 ORDER BY ocupacion_pct DESC;

-- C10 (RF02) Vehículos de cada conductor con número de viajes realizados
SELECT CONCAT(u.nombre, ' ', u.apellido) AS conductor,
       ve.placa, ve.tipo, CONCAT(ve.marca, ' ', ve.linea, ' ', ve.anio_modelo) AS vehiculo,
       ve.capacidad, COUNT(v.id_viaje) AS viajes_publicados
  FROM conductor c
  JOIN usuario u        ON u.id_usuario = c.id_usuario
  JOIN vehiculo ve      ON ve.id_conductor = c.id_conductor
  LEFT JOIN viaje v     ON v.id_vehiculo = ve.id_vehiculo
 GROUP BY c.id_conductor, u.nombre, u.apellido, ve.id_vehiculo, ve.placa, ve.tipo,
          ve.marca, ve.linea, ve.anio_modelo, ve.capacidad
 ORDER BY conductor, viajes_publicados DESC;

-- C11 (RF01) Usuarios registrados por municipio y vereda/sector
SELECT m.nombre AS municipio, COUNT(u.id_usuario) AS usuarios,
       SUM(u.vereda_sector IS NOT NULL) AS de_zona_rural
  FROM municipio m
  LEFT JOIN usuario u ON u.id_municipio = m.id_municipio
 GROUP BY m.id_municipio, m.nombre
HAVING usuarios > 0
 ORDER BY usuarios DESC, municipio;

-- C12 (Calificación) Comentarios recibidos por un conductor (JOIN de 7 tablas)
SELECT CONCAT(uc.nombre, ' ', uc.apellido) AS conductor,
       CONCAT(up.nombre, ' ', up.apellido) AS pasajero,
       ca.puntuacion, ca.comentario, DATE(ca.fecha) AS fecha
  FROM calificacion ca
  JOIN reserva re   ON re.id_reserva = ca.id_reserva
  JOIN solicitud s  ON s.id_solicitud = re.id_solicitud
  JOIN pasajero p   ON p.id_pasajero = s.id_pasajero
  JOIN usuario up   ON up.id_usuario = p.id_usuario
  JOIN viaje v      ON v.id_viaje = s.id_viaje
  JOIN ruta r       ON r.id_ruta = v.id_ruta
  JOIN conductor c  ON c.id_conductor = r.id_conductor
  JOIN usuario uc   ON uc.id_usuario = c.id_usuario
 WHERE ca.comentario IS NOT NULL
 ORDER BY ca.fecha DESC;
