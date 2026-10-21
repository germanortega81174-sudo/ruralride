-- =====================================================================
-- RuralRide – Script 06: Pruebas de integridad (casos que DEBEN FALLAR)
-- Evidencia: GA6-220501096-AA2-EV01
-- Cada prueba intenta violar una restricción. El resultado correcto es
-- un ERROR del motor: así se demuestra que la restricción actúa.
--
-- IMPORTANTE (phpMyAdmin): phpMyAdmin detiene la ejecución en el primer
-- error. Ejecute las pruebas UNA POR UNA: seleccione la sentencia y pulse
-- "Continuar", o pegue cada bloque por separado. Desde consola:
--   mysql -u root --force ruralride < 06_pruebas_integridad.sql
-- =====================================================================
SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
USE ruralride;

-- Conteo de control ANTES de las pruebas
SELECT (SELECT COUNT(*) FROM usuario) AS usuarios, (SELECT COUNT(*) FROM vehiculo) AS vehiculos,
       (SELECT COUNT(*) FROM viaje) AS viajes, (SELECT COUNT(*) FROM solicitud) AS solicitudes,
       (SELECT COUNT(*) FROM reserva) AS reservas, (SELECT COUNT(*) FROM calificacion) AS calificaciones;

-- ===================== A. INTEGRIDAD DE ENTIDAD ========================

-- P01 Clave primaria duplicada  → Esperado: ERROR 1062 Duplicate entry '1' for key 'PRIMARY'
INSERT INTO municipio (id_municipio, nombre, departamento) VALUES (1, 'Cubarral', 'Meta');

-- P02 Correo duplicado (UNIQUE) → Esperado: ERROR 1062 Duplicate entry ... 'uq_usuario_correo'
INSERT INTO usuario (numero_documento, nombre, apellido, telefono, correo, password_hash, id_municipio)
VALUES ('1234567', 'Otro', 'Usuario', '3001234567', 'juan.lopez@gmail.com', '$2b$10$hash', 1);

-- P03 Campo obligatorio nulo (NOT NULL) → Esperado: ERROR 1048 Column 'nombre' cannot be null
INSERT INTO usuario (numero_documento, nombre, apellido, telefono, correo, password_hash, id_municipio)
VALUES ('7654321', NULL, 'SinNombre', '3001234567', 'sin.nombre@gmail.com', '$2b$10$hash', 1);

-- P04 Solicitud repetida del mismo pasajero al mismo viaje (UNIQUE compuesta)
--     → Esperado: ERROR 1062 ... 'uq_solicitud_pasajero_viaje'
INSERT INTO solicitud (id_pasajero, id_viaje, cupos_solicitados) VALUES (3, 5, 1);

-- P05 Segunda calificación para la misma reserva → Esperado: ERROR 1062 ... 'uq_calificacion_reserva'
INSERT INTO calificacion (id_reserva, puntuacion) SELECT id_reserva, 4 FROM reserva WHERE id_solicitud = 1;

-- ===================== B. INTEGRIDAD REFERENCIAL =======================

-- P06 FK hacia un conductor inexistente → Esperado: ERROR 1452 Cannot add or update a child row
INSERT INTO vehiculo (id_conductor, placa, tipo, marca, linea, anio_modelo, color, capacidad)
VALUES (999, 'ZZZ999', 'AUTOMOVIL', 'Kia', 'Picanto', 2020, 'Blanco', 4);

-- P07 Eliminar un usuario que es conductor (ON DELETE RESTRICT)
--     → Esperado: ERROR 1451 Cannot delete or update a parent row ... fk_conductor_usuario
DELETE FROM usuario WHERE id_usuario = 3;

-- P08 Eliminar un viaje que tiene solicitudes → Esperado: ERROR 1451 ... fk_solicitud_viaje
DELETE FROM viaje WHERE id_viaje = 1;

-- P09 Eliminar un municipio usado por rutas y usuarios → Esperado: ERROR 1451 ... (fk_ruta_origen / fk_ruta_destino / fk_usuario_municipio)
DELETE FROM municipio WHERE id_municipio = 1;

-- P10 Eliminar una solicitud que ya tiene reserva → Esperado: ERROR 1451 ... fk_reserva_solicitud
DELETE FROM solicitud WHERE id_solicitud = 1;

-- ===================== C. INTEGRIDAD DE DOMINIO ========================

-- P11 Puntuación fuera del rango 1–5 (CHECK) → Esperado: ERROR CHECK constraint 'ck_calificacion_puntuacion' failed
--     (MariaDB: error 4025 / MySQL 8: error 3819)
UPDATE calificacion SET puntuacion = 7 WHERE id_calificacion = 1;

-- P12 Placa con formato inválido (CHECK) → Esperado: ERROR CHECK constraint 'ck_vehiculo_placa'
INSERT INTO vehiculo (id_conductor, placa, tipo, marca, linea, anio_modelo, color, capacidad)
VALUES (1, 'AB-123', 'AUTOMOVIL', 'Kia', 'Picanto', 2020, 'Blanco', 4);

-- P13 Teléfono que no es celular colombiano de 10 dígitos → Esperado: ERROR CHECK 'ck_usuario_telefono'
UPDATE usuario SET telefono = '12345' WHERE id_usuario = 9;

-- P14 Valor que no pertenece al ENUM → Esperado: ERROR 1265 Data truncated for column 'estado'
UPDATE viaje SET estado = 'VIAJANDO' WHERE id_viaje = 5;

-- P15 Ruta con el mismo origen y destino → Esperado: ERROR CHECK 'ck_ruta_origen_destino'
INSERT INTO ruta (id_conductor, id_municipio_origen, id_municipio_destino, punto_encuentro, distancia_km, tiempo_estimado_min)
VALUES (1, 1, 1, 'Parque Santander', 10, 15);

-- P16 Vehículo con capacidad 0 → Esperado: ERROR CHECK 'ck_vehiculo_capacidad'
UPDATE vehiculo SET capacidad = 0 WHERE id_vehiculo = 1;

-- P17 Costo negativo → Esperado: ERROR CHECK 'ck_viaje_costo'
UPDATE viaje SET costo_por_cupo = -5000 WHERE id_viaje = 5;

-- P18 Rechazar una validación sin observaciones → Esperado: ERROR CHECK 'ck_validacion_rechazo'
UPDATE validacion SET estado = 'RECHAZADA', observaciones = NULL WHERE id_conductor = 4;

-- ===================== D. REGLAS DE NEGOCIO (TRIGGERS) =================

-- P19 RN13: viaje con un vehículo de otro conductor (ruta 1 es de Juan; vehículo 3 es de Rosa)
--     → Esperado: ERROR 1644 RN13: El vehiculo no pertenece al conductor de la ruta
INSERT INTO viaje (id_ruta, id_vehiculo, fecha_hora_salida, costo_por_cupo, cupos_ofrecidos)
VALUES (1, 3, '2026-10-20 06:00:00', 25000, 2);

-- P20 RN14: ofrecer más cupos que la capacidad del vehículo (Hilux = 4)
--     → Esperado: ERROR 1644 RN14: Los cupos ofrecidos superan la capacidad del vehiculo
INSERT INTO viaje (id_ruta, id_vehiculo, fecha_hora_salida, costo_por_cupo, cupos_ofrecidos)
VALUES (1, 1, '2026-10-20 06:00:00', 25000, 9);

-- P21 RN15: conductor con validación RECHAZADA intenta publicar un viaje (Diego)
--     → Esperado: ERROR 1644 RN15: El conductor no tiene una validacion APROBADA
INSERT INTO viaje (id_ruta, id_vehiculo, fecha_hora_salida, costo_por_cupo, cupos_ofrecidos)
VALUES (8, 7, '2026-10-20 07:00:00', 15000, 3);

-- P22 RN17: solicitar cupo en un viaje FINALIZADO
--     → Esperado: ERROR 1644 RN17: Solo se pueden solicitar cupos en viajes PROGRAMADOS
INSERT INTO solicitud (id_pasajero, id_viaje, cupos_solicitados) VALUES (5, 1, 1);

-- P23 RN18: la conductora Rosa (pasajero 11) solicita cupo en su propio viaje
--     → Esperado: ERROR 1644 RN18: El conductor no puede solicitar cupo en su propio viaje
INSERT INTO solicitud (id_pasajero, id_viaje, cupos_solicitados) VALUES (11, 6, 1);

-- P24 RN20: aprobar una solicitud cuando el viaje ya no tiene cupos (viaje 9 en moto, 1 cupo ocupado)
--     → Esperado: ERROR 1644 RN20: No hay cupos disponibles para aprobar la solicitud
UPDATE solicitud SET estado = 'APROBADA' WHERE id_solicitud = 21;

-- P25 RN21: crear una reserva para una solicitud PENDIENTE
--     → Esperado: ERROR 1644 RN21: La reserva requiere una solicitud APROBADA
INSERT INTO reserva (id_solicitud, codigo) VALUES (22, 'RRTEST01');

-- P26 RN22: calificar un viaje que aún no se ha realizado (reserva CONFIRMADA)
--     → Esperado: ERROR 1644 RN22: Solo se califican viajes FINALIZADOS...
INSERT INTO calificacion (id_reserva, puntuacion) SELECT id_reserva, 5 FROM reserva WHERE id_solicitud = 14;

-- Conteo de control DESPUÉS: debe ser IGUAL al inicial (ninguna prueba alteró los datos)
SELECT (SELECT COUNT(*) FROM usuario) AS usuarios, (SELECT COUNT(*) FROM vehiculo) AS vehiculos,
       (SELECT COUNT(*) FROM viaje) AS viajes, (SELECT COUNT(*) FROM solicitud) AS solicitudes,
       (SELECT COUNT(*) FROM reserva) AS reservas, (SELECT COUNT(*) FROM calificacion) AS calificaciones;
