-- =====================================================================
-- RuralRide – Script 02: Reglas de negocio (función, triggers) y vistas
-- Evidencia: GA6-220501096-AA2-EV01
-- Implementa en la base de datos las reglas que no se pueden expresar
-- solo con PK, FK, UNIQUE, NOT NULL, DEFAULT y CHECK.
-- En phpMyAdmin: pegar el script completo en la pestaña SQL. phpMyAdmin
-- reconoce la instrucción DELIMITER.
-- =====================================================================
SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
USE ruralride;

DROP FUNCTION IF EXISTS fn_cupos_disponibles;
DROP TRIGGER IF EXISTS tr_conductor_ai;
DROP TRIGGER IF EXISTS tr_viaje_bi;
DROP TRIGGER IF EXISTS tr_viaje_au;
DROP TRIGGER IF EXISTS tr_solicitud_bi;
DROP TRIGGER IF EXISTS tr_solicitud_bu;
DROP TRIGGER IF EXISTS tr_solicitud_au;
DROP TRIGGER IF EXISTS tr_reserva_bi;
DROP TRIGGER IF EXISTS tr_calificacion_bi;

DELIMITER $$

-- ---------------------------------------------------------------------
-- Función: cupos disponibles de un viaje (atributo DERIVADO, no se guarda)
-- cupos_disponibles = cupos_ofrecidos - cupos de reservas vigentes
-- ---------------------------------------------------------------------
CREATE FUNCTION fn_cupos_disponibles(p_id_viaje INT UNSIGNED)
RETURNS INT
READS SQL DATA
BEGIN
  DECLARE v_ofrecidos INT DEFAULT 0;
  DECLARE v_ocupados  INT DEFAULT 0;
  SELECT cupos_ofrecidos INTO v_ofrecidos FROM viaje WHERE id_viaje = p_id_viaje;
  SELECT COALESCE(SUM(s.cupos_solicitados), 0) INTO v_ocupados
    FROM solicitud s
    JOIN reserva r ON r.id_solicitud = s.id_solicitud
   WHERE s.id_viaje = p_id_viaje
     AND r.estado IN ('CONFIRMADA','COMPLETADA');
  RETURN v_ofrecidos - v_ocupados;
END$$

-- RN10: todo conductor nuevo queda con una validación PENDIENTE
CREATE TRIGGER tr_conductor_ai
AFTER INSERT ON conductor
FOR EACH ROW
BEGIN
  INSERT INTO validacion (id_conductor, estado, fecha_solicitud)
  VALUES (NEW.id_conductor, 'PENDIENTE', NEW.fecha_alta);
END$$

-- RN13, RN14, RN15: reglas para publicar un viaje
CREATE TRIGGER tr_viaje_bi
BEFORE INSERT ON viaje
FOR EACH ROW
BEGIN
  DECLARE v_cond_ruta INT UNSIGNED;
  DECLARE v_cond_veh  INT UNSIGNED;
  DECLARE v_capacidad INT;
  DECLARE v_estado_val VARCHAR(10);

  SELECT id_conductor INTO v_cond_ruta FROM ruta WHERE id_ruta = NEW.id_ruta;
  SELECT id_conductor, capacidad INTO v_cond_veh, v_capacidad
    FROM vehiculo WHERE id_vehiculo = NEW.id_vehiculo;

  -- El vehículo debe pertenecer al mismo conductor que publicó la ruta
  IF v_cond_ruta <> v_cond_veh THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN13: El vehiculo no pertenece al conductor de la ruta';
  END IF;

  -- Los cupos ofrecidos no pueden superar la capacidad del vehículo
  IF NEW.cupos_ofrecidos > v_capacidad THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN14: Los cupos ofrecidos superan la capacidad del vehiculo';
  END IF;

  -- Solo publica viajes un conductor cuya última validación está APROBADA
  SELECT estado INTO v_estado_val FROM validacion
   WHERE id_conductor = v_cond_ruta
   ORDER BY fecha_solicitud DESC, id_validacion DESC LIMIT 1;
  IF v_estado_val IS NULL OR v_estado_val <> 'APROBADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN15: El conductor no tiene una validacion APROBADA';
  END IF;
END$$

-- RN16: al finalizar el viaje las reservas pasan a COMPLETADA;
--       al cancelarlo, las reservas confirmadas se cancelan
CREATE TRIGGER tr_viaje_au
AFTER UPDATE ON viaje
FOR EACH ROW
BEGIN
  IF NEW.estado = 'FINALIZADO' AND OLD.estado <> 'FINALIZADO' THEN
    UPDATE reserva r JOIN solicitud s ON s.id_solicitud = r.id_solicitud
       SET r.estado = 'COMPLETADA'
     WHERE s.id_viaje = NEW.id_viaje AND r.estado = 'CONFIRMADA';
  ELSEIF NEW.estado = 'CANCELADO' AND OLD.estado <> 'CANCELADO' THEN
    UPDATE reserva r JOIN solicitud s ON s.id_solicitud = r.id_solicitud
       SET r.estado = 'CANCELADA'
     WHERE s.id_viaje = NEW.id_viaje AND r.estado = 'CONFIRMADA';
  END IF;
END$$

-- RN17, RN18: reglas para crear una solicitud de cupo
CREATE TRIGGER tr_solicitud_bi
BEFORE INSERT ON solicitud
FOR EACH ROW
BEGIN
  DECLARE v_estado_viaje VARCHAR(12);
  DECLARE v_usuario_conductor INT UNSIGNED;
  DECLARE v_usuario_pasajero  INT UNSIGNED;

  SELECT v.estado, c.id_usuario INTO v_estado_viaje, v_usuario_conductor
    FROM viaje v
    JOIN ruta r      ON r.id_ruta = v.id_ruta
    JOIN conductor c ON c.id_conductor = r.id_conductor
   WHERE v.id_viaje = NEW.id_viaje;
  SELECT id_usuario INTO v_usuario_pasajero FROM pasajero WHERE id_pasajero = NEW.id_pasajero;

  IF v_estado_viaje <> 'PROGRAMADO' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN17: Solo se pueden solicitar cupos en viajes PROGRAMADOS';
  END IF;
  IF v_usuario_conductor = v_usuario_pasajero THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN18: El conductor no puede solicitar cupo en su propio viaje';
  END IF;
END$$

-- RN19 y RN20: solo se aprueban solicitudes PENDIENTES y con cupos disponibles
CREATE TRIGGER tr_solicitud_bu
BEFORE UPDATE ON solicitud
FOR EACH ROW
BEGIN
  IF NEW.estado = 'APROBADA' AND OLD.estado <> 'APROBADA' THEN
    IF OLD.estado <> 'PENDIENTE' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN19: Solo se aprueban solicitudes en estado PENDIENTE';
    END IF;
    IF fn_cupos_disponibles(NEW.id_viaje) < NEW.cupos_solicitados THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN20: No hay cupos disponibles para aprobar la solicitud';
    END IF;
  END IF;
  IF NEW.estado <> OLD.estado AND NEW.fecha_respuesta IS NULL THEN
    SET NEW.fecha_respuesta = NOW();
  END IF;
END$$

-- RN07: una solicitud aprobada genera automáticamente su reserva
CREATE TRIGGER tr_solicitud_au
AFTER UPDATE ON solicitud
FOR EACH ROW
BEGIN
  IF NEW.estado = 'APROBADA' AND OLD.estado <> 'APROBADA' THEN
    INSERT INTO reserva (id_solicitud, codigo, fecha_reserva, estado)
    VALUES (NEW.id_solicitud,
            CONCAT('RR', LPAD(NEW.id_solicitud, 6, '0')),
            COALESCE(NEW.fecha_respuesta, NOW()),
            'CONFIRMADA');
  END IF;
END$$

-- RN21: no puede existir una reserva sin solicitud aprobada
CREATE TRIGGER tr_reserva_bi
BEFORE INSERT ON reserva
FOR EACH ROW
BEGIN
  DECLARE v_estado VARCHAR(10);
  SELECT estado INTO v_estado FROM solicitud WHERE id_solicitud = NEW.id_solicitud;
  IF v_estado IS NULL OR v_estado <> 'APROBADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN21: La reserva requiere una solicitud APROBADA';
  END IF;
END$$

-- RN22: solo se califica una reserva COMPLETADA (el pasajero viajó y el viaje finalizó)
CREATE TRIGGER tr_calificacion_bi
BEFORE INSERT ON calificacion
FOR EACH ROW
BEGIN
  DECLARE v_estado VARCHAR(10);
  SELECT estado INTO v_estado FROM reserva WHERE id_reserva = NEW.id_reserva;
  IF v_estado IS NULL OR v_estado <> 'COMPLETADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RN22: Solo se califican viajes FINALIZADOS en los que el pasajero viajo';
  END IF;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- VISTAS: exponen los atributos derivados sin almacenarlos (3FN)
-- ---------------------------------------------------------------------

-- Disponibilidad de viajes con su ruta, conductor y vehículo (RF02, RF03)
CREATE OR REPLACE VIEW v_viajes_disponibles AS
SELECT v.id_viaje,
       mo.nombre AS origen,
       md.nombre AS destino,
       r.punto_encuentro,
       v.fecha_hora_salida,
       v.costo_por_cupo,
       v.cupos_ofrecidos,
       fn_cupos_disponibles(v.id_viaje) AS cupos_disponibles,
       v.estado,
       CONCAT(u.nombre, ' ', u.apellido) AS conductor,
       ve.placa,
       CONCAT(ve.marca, ' ', ve.linea) AS vehiculo
  FROM viaje v
  JOIN ruta r       ON r.id_ruta = v.id_ruta
  JOIN municipio mo ON mo.id_municipio = r.id_municipio_origen
  JOIN municipio md ON md.id_municipio = r.id_municipio_destino
  JOIN conductor c  ON c.id_conductor = r.id_conductor
  JOIN usuario u    ON u.id_usuario = c.id_usuario
  JOIN vehiculo ve  ON ve.id_vehiculo = v.id_vehiculo;

-- Reputación del conductor: calificación promedio calculada (atributo derivado)
CREATE OR REPLACE VIEW v_reputacion_conductor AS
SELECT c.id_conductor,
       CONCAT(u.nombre, ' ', u.apellido) AS conductor,
       COUNT(ca.id_calificacion) AS total_calificaciones,
       ROUND(COALESCE(AVG(ca.puntuacion), 0), 2) AS calificacion_promedio
  FROM conductor c
  JOIN usuario u            ON u.id_usuario = c.id_usuario
  LEFT JOIN ruta r          ON r.id_conductor = c.id_conductor
  LEFT JOIN viaje v         ON v.id_ruta = r.id_ruta
  LEFT JOIN solicitud s     ON s.id_viaje = v.id_viaje
  LEFT JOIN reserva re      ON re.id_solicitud = s.id_solicitud
  LEFT JOIN calificacion ca ON ca.id_reserva = re.id_reserva
 GROUP BY c.id_conductor, u.nombre, u.apellido;

-- Estado vigente de validación de cada conductor (última validación)
CREATE OR REPLACE VIEW v_estado_validacion_conductor AS
SELECT c.id_conductor,
       CONCAT(u.nombre, ' ', u.apellido) AS conductor,
       va.estado AS estado_validacion,
       va.fecha_validacion,
       va.observaciones
  FROM conductor c
  JOIN usuario u     ON u.id_usuario = c.id_usuario
  JOIN validacion va ON va.id_conductor = c.id_conductor
 WHERE va.id_validacion = (SELECT v2.id_validacion FROM validacion v2
                            WHERE v2.id_conductor = c.id_conductor
                            ORDER BY v2.fecha_solicitud DESC, v2.id_validacion DESC
                            LIMIT 1);

-- Historial de viajes del pasajero (reemplaza el atributo "historial_viajes")
CREATE OR REPLACE VIEW v_historial_pasajero AS
SELECT p.id_pasajero,
       CONCAT(u.nombre, ' ', u.apellido) AS pasajero,
       re.codigo AS codigo_reserva,
       mo.nombre AS origen,
       md.nombre AS destino,
       v.fecha_hora_salida,
       s.cupos_solicitados,
       (s.cupos_solicitados * v.costo_por_cupo) AS valor_total,
       re.estado AS estado_reserva
  FROM pasajero p
  JOIN usuario u    ON u.id_usuario = p.id_usuario
  JOIN solicitud s  ON s.id_pasajero = p.id_pasajero
  JOIN reserva re   ON re.id_solicitud = s.id_solicitud
  JOIN viaje v      ON v.id_viaje = s.id_viaje
  JOIN ruta r       ON r.id_ruta = v.id_ruta
  JOIN municipio mo ON mo.id_municipio = r.id_municipio_origen
  JOIN municipio md ON md.id_municipio = r.id_municipio_destino;

-- Verificación de objetos creados
SELECT trigger_name AS disparador, event_manipulation AS evento, event_object_table AS tabla, action_timing AS momento
  FROM information_schema.triggers WHERE trigger_schema = 'ruralride' ORDER BY event_object_table;
SELECT table_name AS vista FROM information_schema.views WHERE table_schema = 'ruralride';
