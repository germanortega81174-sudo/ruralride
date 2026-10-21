-- =====================================================================
-- RuralRide – Script 05: Operaciones UPDATE y DELETE
-- Evidencia: GA6-220501096-AA2-EV01
-- Cada operación muestra el estado ANTES y DESPUÉS para evidenciar
-- su efecto y el comportamiento de las restricciones y triggers.
-- Requiere haber ejecutado los scripts 01, 02 y 03.
-- =====================================================================
SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
USE ruralride;

-- ============================ UPDATE ==================================

-- U01 (RF01 – gestión de perfil) El pasajero Carlos Andrés cambia su teléfono y vereda
SELECT id_usuario, nombre, telefono, vereda_sector FROM usuario WHERE id_usuario = 9;  -- ANTES
UPDATE usuario
   SET telefono = '3004448899', vereda_sector = 'Vereda La Arenosa'
 WHERE id_usuario = 9;
SELECT id_usuario, nombre, telefono, vereda_sector FROM usuario WHERE id_usuario = 9;  -- DESPUÉS

-- U02 (RF04 – validación comunitaria) La administradora aprueba al conductor Wilson
SELECT * FROM v_estado_validacion_conductor WHERE id_conductor = 5;  -- ANTES: PENDIENTE
UPDATE validacion
   SET estado = 'APROBADA', id_administrador = 1, fecha_validacion = '2026-10-05 09:00:00',
       observaciones = 'Visita de verificación en la vereda Matepiña. Vehículo revisado.'
 WHERE id_conductor = 5 AND estado = 'PENDIENTE';
SELECT * FROM v_estado_validacion_conductor WHERE id_conductor = 5;  -- DESPUÉS: APROBADA

--      Ya aprobado, Wilson puede publicar su primer viaje (el trigger lo permite)
INSERT INTO viaje (id_ruta, id_vehiculo, fecha_hora_salida, costo_por_cupo, cupos_ofrecidos)
VALUES (7, 6, '2026-10-17 05:00:00', 35000, 3);
SELECT id_viaje, origen, destino, fecha_hora_salida, cupos_disponibles, conductor
  FROM v_viajes_disponibles WHERE conductor LIKE 'Wilson%';

-- U03 (RF03) El conductor aprueba la solicitud 15 (2 cupos en el viaje 5).
--      El trigger tr_solicitud_au genera la reserva y los cupos disponibles bajan.
SELECT id_viaje, cupos_ofrecidos, fn_cupos_disponibles(id_viaje) AS disponibles FROM viaje WHERE id_viaje = 5; -- ANTES
UPDATE solicitud SET estado = 'APROBADA' WHERE id_solicitud = 15;
SELECT s.id_solicitud, s.estado, s.fecha_respuesta, r.codigo, r.estado AS estado_reserva
  FROM solicitud s LEFT JOIN reserva r ON r.id_solicitud = s.id_solicitud
 WHERE s.id_solicitud = 15;
SELECT id_viaje, cupos_ofrecidos, fn_cupos_disponibles(id_viaje) AS disponibles FROM viaje WHERE id_viaje = 5; -- DESPUÉS

-- U04 (RF03) El conductor rechaza la solicitud 18 indicando el motivo
UPDATE solicitud
   SET estado = 'RECHAZADA', motivo_respuesta = 'El pasajero no confirmó el punto de encuentro'
 WHERE id_solicitud = 18 AND estado = 'PENDIENTE';
SELECT id_solicitud, estado, fecha_respuesta, motivo_respuesta FROM solicitud WHERE id_solicitud = 18;

-- U05 (RF02) Ajuste del costo (+10 %) de los viajes programados de la ruta Saravena → Tame
SELECT id_viaje, costo_por_cupo FROM viaje WHERE id_ruta = 5 AND estado = 'PROGRAMADO';  -- ANTES
UPDATE viaje SET costo_por_cupo = ROUND(costo_por_cupo * 1.10, -2)
 WHERE id_ruta = 5 AND estado = 'PROGRAMADO';
SELECT id_viaje, costo_por_cupo FROM viaje WHERE id_ruta = 5 AND estado = 'PROGRAMADO';  -- DESPUÉS

-- U06 (RF03) Un pasajero cancela su reserva: los cupos del viaje 7 se liberan
SELECT fn_cupos_disponibles(7) AS disponibles_antes;
UPDATE reserva r JOIN solicitud s ON s.id_solicitud = r.id_solicitud
   SET r.estado = 'CANCELADA'
 WHERE s.id_solicitud = 17;
SELECT fn_cupos_disponibles(7) AS disponibles_despues;

-- ============================ DELETE ==================================

-- D01 (RF01) Limpieza de tokens de recuperación usados o vencidos
SELECT id_recuperacion, id_usuario, usado, fecha_expiracion FROM recuperacion_password;  -- ANTES
DELETE FROM recuperacion_password WHERE usado = 1 OR fecha_expiracion < NOW();
SELECT id_recuperacion, id_usuario, usado, fecha_expiracion FROM recuperacion_password;  -- DESPUÉS

-- D02 (RF03) Se elimina una solicitud CANCELADA que no generó reserva (no hay FK que la proteja)
SELECT id_solicitud, estado FROM solicitud WHERE id_solicitud = 10;
DELETE FROM solicitud WHERE id_solicitud = 10 AND estado = 'CANCELADA';
SELECT COUNT(*) AS existe_solicitud_10 FROM solicitud WHERE id_solicitud = 10;

-- D03 ON DELETE CASCADE: al eliminar un usuario de prueba se eliminan sus tokens
INSERT INTO usuario (numero_documento, nombre, apellido, telefono, correo, password_hash, id_municipio)
VALUES ('99999999', 'Usuario', 'Prueba', '3000000000', 'prueba.borrado@ruralride.co',
        '$2b$10$abcdefghijklmnopqrstuuOQe1y1i2qZCw7b2l0bJr4o8E9zBzXa', 1);
SET @id_prueba = LAST_INSERT_ID();
INSERT INTO recuperacion_password (id_usuario, token_hash, fecha_expiracion)
VALUES (@id_prueba, SHA2('token-prueba', 256), NOW() + INTERVAL 30 MINUTE);
SELECT COUNT(*) AS tokens_antes FROM recuperacion_password WHERE id_usuario = @id_prueba;
DELETE FROM usuario WHERE id_usuario = @id_prueba;
SELECT COUNT(*) AS tokens_despues FROM recuperacion_password WHERE id_usuario = @id_prueba;

-- D04 ON DELETE CASCADE: al eliminar un conductor sin vehículos ni rutas,
--     su validación (creada por el trigger) también se elimina
INSERT INTO usuario (numero_documento, nombre, apellido, telefono, correo, password_hash, id_municipio)
VALUES ('88888888', 'Conductor', 'Prueba', '3000000001', 'conductor.prueba@ruralride.co',
        '$2b$10$abcdefghijklmnopqrstuuOQe1y1i2qZCw7b2l0bJr4o8E9zBzXa', 1);
SET @usr = LAST_INSERT_ID();
INSERT INTO conductor (id_usuario, numero_licencia, categoria_licencia, vencimiento_licencia)
VALUES (@usr, 'LIC-PRUEBA', 'B1', '2030-01-01');
SET @cond = LAST_INSERT_ID();
SELECT COUNT(*) AS validaciones_antes FROM validacion WHERE id_conductor = @cond;
DELETE FROM conductor WHERE id_conductor = @cond;
SELECT COUNT(*) AS validaciones_despues FROM validacion WHERE id_conductor = @cond;
DELETE FROM usuario WHERE id_usuario = @usr;

-- Nota: los intentos de DELETE que deben FALLAR por integridad referencial
-- (ON DELETE RESTRICT) se encuentran en el script 06.
