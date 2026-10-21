-- =====================================================================
-- RuralRide – Script 03: DML – Carga de datos de prueba (INSERT)
-- Evidencia: GA6-220501096-AA2-EV01
-- Datos representativos del departamento de Arauca. La contraseña de todos
-- los usuarios de prueba es RuralRide2026* almacenada como hash BCrypt.
-- Requiere haber ejecutado los scripts 01 y 02.
-- =====================================================================
SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
USE ruralride;

START TRANSACTION;

-- 1. Municipios (catálogo)
INSERT INTO municipio (nombre, departamento) VALUES
 ('Arauca','Arauca'), ('Arauquita','Arauca'), ('Saravena','Arauca'), ('Tame','Arauca'),
 ('Fortul','Arauca'), ('Puerto Rondón','Arauca'), ('Cravo Norte','Arauca'),
 ('Hato Corozal','Casanare'), ('Paz de Ariporo','Casanare'), ('Cubará','Boyacá');

-- 2. Usuarios (18): 2 administradores, 6 conductores, 10 pasajeros
--    Rosa Elena (usuario 4) es conductora y también pasajera.
INSERT INTO usuario (tipo_documento, numero_documento, nombre, apellido, telefono, correo,
                     password_hash, id_municipio, vereda_sector, fecha_registro) VALUES
 ('CC','68291045','Luz Marina','Pabón Rojas','3115248790','luzmarina.pabon@ruralride.co',
  '$2b$10$vUpAZZ0IMpJVJeLzzT3rleTqenWTy46c5xc7mGnQacygrUBPfVBSS', 1, 'Vereda Caño Limón', '2026-08-10 09:12:00'),
 ('CC','17594382','Édgar Alonso','Hernández Vega','3204517836','edgar.hernandez@ruralride.co',
  '$2b$10$/uI0wPCRJrwwtq7sV1w.vOV4tt800dVl2GHam7qQbgPZ6ozERfWPu', 4, 'Vereda Puerto Gaitán', '2026-08-10 10:05:00'),
 ('CC','1116784523','Juan Carlos','López Mendoza','3106782341','juan.lopez@gmail.com',
  '$2b$10$UEInK8TbOAcsgDp2JGsT8egJU2zr1Wmm6J4Xxvvo3OYFQJP4zBIha', 1, 'Vereda El Rosario', '2026-08-18 07:40:00'),
 ('CC','1116452390','Rosa Elena','Gutiérrez Pinto','3017845632','rosa.gutierrez@gmail.com',
  '$2b$10$i8giBbXEtSWnzbXhxQIP0uEnXFyNltYyIJI4HIksgkh76vIeh6xMO', 3, 'Vereda La Pajuila', '2026-08-18 08:15:00'),
 ('CC','96351248','Pedro Nel','Salcedo Ramírez','3142236589','pedro.salcedo@hotmail.com',
  '$2b$10$CcYHNobZ3WESjW6R5Wr8H.5QwcjUmMy3kLFJShWCgR2Yfws6TP48a', 4, NULL, '2026-08-19 11:30:00'),
 ('CC','1116893214','Ana Milena','Cárdenas Ortiz','3125569874','ana.cardenas@gmail.com',
  '$2b$10$KJpfTtP8zEeveskv4JXSu.m9sOMdvQVjajwH132IhwScbLcsNXLBi', 3, 'Vereda Botalón', '2026-08-20 15:00:00'),
 ('CC','17642198','Wilson','Rincón Daza','3188842156','wilson.rincon@yahoo.com',
  '$2b$10$bZ90VZ9MibOF.HMANW6hzO.sjRjxB75WhwO1J50RnL.MM711h9j7C', 1, 'Vereda Matepiña', '2026-09-28 16:20:00'),
 ('CC','1116234785','Diego Fernando','Moreno Silva','3159987412','diego.moreno@gmail.com',
  '$2b$10$Zmrph8ClhOadmQvAMDthTOCzmZxowXfOb8.XlOyvJ62LcryfYDZsa', 5, NULL, '2026-09-02 10:45:00'),
 ('CC','1117123654','Carlos Andrés','Pérez Torres','3001112222','carlos.perez@gmail.com',
  '$2b$10$CzcAa4RyOStIeAiFlX9h5.6H.COBtAONMadooS700ofYMxcpb8sqm', 2, 'Vereda Aguachica', '2026-08-25 08:00:00'),
 ('CC','1116987452','María Fernanda','Quintero Lara','3016654789','mafe.quintero@gmail.com',
  '$2b$10$06TJdSrpWqFpOuXSqbJ36eGJH3Z6VysozbUz4miPlhDOUuUquQ/Ve', 1, NULL, '2026-08-25 09:30:00'),
 ('TI','1116998745','Sofía','Jaimes Bautista','3227785412','sofia.jaimes@gmail.com',
  '$2b$10$exeGCJjSzzK0v3Ok6vjmMuk7XTNASZb3oTI6pzSCxNXWxOXGtctAO', 2, 'Vereda El Troncal', '2026-08-26 14:10:00'),
 ('CC','26452187','Gloria Inés','Vargas Uribe','3113356987','gloria.vargas@hotmail.com',
  '$2b$10$F/3h8u/1v9DLUtg5xmQ2uOQSUJFHKQ77Oz/SqDpxyRiwzhXTX1Zwm', 4, 'Vereda Malvinas', '2026-08-27 07:55:00'),
 ('CC','1116341278','Jhon Fredy','Arias Contreras','3046698521','jhon.arias@gmail.com',
  '$2b$10$NmZvDQoKOFW8r2Tlw1PfBeM5h/FZycVgNlDw/tt1nLZGlerWgH5E2', 1, NULL, '2026-08-28 18:40:00'),
 ('CC','1116558963','Yuli Andrea','Becerra Niño','3138874526','yuli.becerra@gmail.com',
  '$2b$10$NH/HTVbVSvS0B4490YBz7.25L3X611Gj4rz4wyw87EfKYw3F787PG', 3, 'Vereda Puerto Nariño', '2026-08-30 12:00:00'),
 ('CC','91245789','Hernando','Galvis Duarte','3209965412','hernando.galvis@yahoo.com',
  '$2b$10$D3SZakb1veJIJITZrQz/reChs6d/epsgGaL1Ng/4uFyZ8vAXFE.I2', 5, 'Vereda Caranal', '2026-09-01 06:30:00'),
 ('CC','1116789963','Katherine','Ruiz Mantilla','3175523698','kathe.ruiz@gmail.com',
  '$2b$10$/B1kDaNOBuNiIt0VCa9Z2.5lBR1oJ6rzF4A0LQx3N1xSsZtp/gGxC', 1, NULL, '2026-09-03 20:15:00'),
 ('PPT','5874123','Luis Alejandro','Medina Parra','3245587412','luis.medina@gmail.com',
  '$2b$10$imwpnpXroivd65MvfCmYV.xCUBpP4b98WtCKF6gAOvFuI9CvSXexe', 2, 'Vereda La Esmeralda', '2026-09-05 09:00:00'),
 ('CC','1116225874','Daniela','Ospina Rueda','3052214785','daniela.ospina@gmail.com',
  '$2b$10$RncTPthHagyYngC.sFJ9F.D2U8.0CYuYmKWLGNOPjGgD3Xd2jYtDu', 4, NULL, '2026-09-06 13:25:00');

-- 3. Tokens de recuperación de contraseña (RF01)
INSERT INTO recuperacion_password (id_usuario, token_hash, fecha_creacion, fecha_expiracion, usado) VALUES
 (10, SHA2('token-mafe-20260920', 256), '2026-09-20 08:00:00', '2026-09-20 08:30:00', 1),
 (13, SHA2('token-jhon-20261004', 256), '2026-10-04 19:00:00', '2026-10-04 19:30:00', 0);

-- 4. Administradores (validación comunitaria – RF04)
INSERT INTO administrador (id_usuario, cargo, fecha_alta) VALUES
 (1, 'Presidenta Junta de Acción Comunal – Caño Limón', '2026-08-10 09:20:00'),
 (2, 'Coordinador comunitario de movilidad – Tame',     '2026-08-10 10:10:00');

-- 5. Conductores (el trigger tr_conductor_ai crea su validación PENDIENTE)
INSERT INTO conductor (id_usuario, numero_licencia, categoria_licencia, vencimiento_licencia,
                       anios_experiencia, fecha_alta) VALUES
 (3, '1116784523', 'C1', '2029-03-15', 12, '2026-08-18 08:00:00'),
 (4, '1116452390', 'B1', '2028-11-02',  6, '2026-08-18 08:30:00'),
 (5, '96351248',   'C2', '2027-06-30', 20, '2026-08-19 12:00:00'),
 (6, '1116893214', 'C1', '2030-01-20',  4, '2026-08-20 15:30:00'),
 (7, '17642198',   'B1', '2027-12-12',  9, '2026-09-28 16:40:00'),
 (8, '1116234785', 'C1', '2026-12-01',  2, '2026-09-02 11:00:00');

-- 6. Pasajeros (11). El pasajero 11 es la conductora Rosa Elena (usuario 4)
INSERT INTO pasajero (id_usuario, contacto_emergencia_nombre, contacto_emergencia_telefono,
                      necesidad_especial, fecha_alta) VALUES
 ( 9, 'Martha Torres',   '3105547896', NULL,                                   '2026-08-25 08:05:00'),
 (10, 'Jorge Quintero',  '3012245698', NULL,                                   '2026-08-25 09:35:00'),
 (11, 'Nubia Bautista',  '3224478965', 'Menor de edad: viaja con autorización', '2026-08-26 14:15:00'),
 (12, 'Álvaro Vargas',   '3118874569', 'Movilidad reducida',                    '2026-08-27 08:00:00'),
 (13, NULL,              NULL,         NULL,                                   '2026-08-28 18:45:00'),
 (14, 'Ramiro Becerra',  '3134456987', NULL,                                   '2026-08-30 12:05:00'),
 (15, 'Elvia Duarte',    '3202235698', 'Transporta carga ligera (bulto)',       '2026-09-01 06:35:00'),
 (16, 'Camilo Ruiz',     '3176654123', NULL,                                   '2026-09-03 20:20:00'),
 (17, 'Rosa Parra',      '3241125478', NULL,                                   '2026-09-05 09:05:00'),
 (18, 'Fabio Ospina',    '3051123698', NULL,                                   '2026-09-06 13:30:00'),
 ( 4, 'Hugo Gutiérrez',  '3017741258', NULL,                                   '2026-08-18 08:35:00');

-- 7. Resultado de la validación comunitaria (las 6 validaciones las creó el trigger)
UPDATE validacion SET estado='APROBADA', id_administrador=1, fecha_validacion='2026-08-22 10:00:00',
       observaciones='Conocido por la comunidad de Caño Limón. Documentos y SOAT al día.'
 WHERE id_conductor=1;
UPDATE validacion SET estado='APROBADA', id_administrador=1, fecha_validacion='2026-08-22 10:30:00',
       observaciones='Referencias de 3 vecinos de la vereda La Pajuila.'
 WHERE id_conductor=2;
UPDATE validacion SET estado='APROBADA', id_administrador=2, fecha_validacion='2026-08-23 09:00:00',
       observaciones='Conductor con 20 años de experiencia, sin comparendos.'
 WHERE id_conductor=3;
UPDATE validacion SET estado='APROBADA', id_administrador=2, fecha_validacion='2026-08-24 14:00:00',
       observaciones=NULL
 WHERE id_conductor=4;
-- Conductor 5 (Wilson): queda PENDIENTE
UPDATE validacion SET estado='RECHAZADA', id_administrador=2, fecha_validacion='2026-09-05 16:00:00',
       observaciones='Licencia próxima a vencer y sin referencias comunitarias. Puede volver a solicitar.'
 WHERE id_conductor=6;

-- 8. Vehículos
INSERT INTO vehiculo (id_conductor, placa, tipo, marca, linea, anio_modelo, color, capacidad) VALUES
 (1, 'JHL418', 'CAMIONETA',   'Toyota',     'Hilux',        2018, 'Blanco', 4),
 (1, 'KTR205', 'CAMPERO',     'Toyota',     'Land Cruiser', 2012, 'Verde',  6),
 (2, 'FXN733', 'AUTOMOVIL',   'Chevrolet',  'Spark GT',     2019, 'Rojo',   4),
 (3, 'MBC941', 'MICROBUS',    'Nissan',     'Urvan',        2016, 'Blanco', 12),
 (4, 'GPZ318', 'CAMIONETA',   'Mitsubishi', 'L200',         2020, 'Gris',   4),
 (5, 'HQW566', 'AUTOMOVIL',   'Renault',    'Logan',        2017, 'Plata',  4),
 (6, 'DKT290', 'CAMPERO',     'Mitsubishi', 'Montero',      2010, 'Negro',  6),
 (3, 'LRV12E', 'MOTOCICLETA', 'AKT',        'NKD 125',      2022, 'Azul',   1);

-- 9. Rutas
INSERT INTO ruta (id_conductor, id_municipio_origen, id_municipio_destino, punto_encuentro,
                  distancia_km, tiempo_estimado_min) VALUES
 (1, 1, 2, 'Parque Santander, frente a la iglesia',    89.50,  95),
 (1, 2, 1, 'Plaza principal de Arauquita',             89.50,  95),
 (2, 3, 5, 'Terminal de transportes de Saravena',      32.00,  40),
 (3, 4, 1, 'Glorieta del Llanero',                    160.00, 180),
 (4, 3, 4, 'Estación de servicio La Esperanza',        74.30,  85),
 (3, 4, 6, 'Salida a Puerto Rondón, sector El Botalón', 70.00, 110),
 (5, 1, 7, 'Muelle sobre el río Arauca',              120.00, 210),
 (6, 5, 4, 'Parque principal de Fortul',               52.00,  60);

-- 10. Viajes (el trigger tr_viaje_bi verifica vehículo, capacidad y validación)
INSERT INTO viaje (id_ruta, id_vehiculo, fecha_hora_salida, costo_por_cupo, cupos_ofrecidos, fecha_publicacion) VALUES
 (1, 1, '2026-09-14 06:00:00', 25000, 4,  '2026-09-10 18:00:00'),
 (3, 3, '2026-09-15 07:30:00', 12000, 3,  '2026-09-12 09:00:00'),
 (4, 4, '2026-09-18 05:30:00', 40000, 10, '2026-09-13 10:00:00'),
 (2, 2, '2026-09-21 15:00:00', 25000, 6,  '2026-09-17 20:00:00'),
 (1, 1, '2026-10-12 06:00:00', 25000, 4,  '2026-10-03 07:00:00'),
 (3, 3, '2026-10-12 07:30:00', 12000, 3,  '2026-10-03 08:00:00'),
 (4, 4, '2026-10-13 05:30:00', 40000, 10, '2026-10-04 10:00:00'),
 (5, 5, '2026-10-14 08:00:00', 20000, 4,  '2026-10-04 12:00:00'),
 (6, 8, '2026-10-15 09:00:00', 18000, 1,  '2026-10-04 15:00:00'),
 (2, 2, '2026-10-16 14:00:00', 25000, 6,  '2026-10-05 06:00:00'),
 (5, 5, '2026-09-25 08:00:00', 20000, 4,  '2026-09-20 11:00:00');

-- 11. Solicitudes de cupo (todas nacen PENDIENTE)
INSERT INTO solicitud (id_pasajero, id_viaje, cupos_solicitados, fecha_solicitud) VALUES
 ( 1, 1, 1, '2026-09-11 07:00:00'),
 ( 2, 1, 2, '2026-09-11 08:30:00'),
 ( 3, 1, 1, '2026-09-11 12:00:00'),
 ( 4, 1, 1, '2026-09-12 19:00:00'),
 ( 5, 2, 1, '2026-09-13 06:00:00'),
 ( 6, 2, 1, '2026-09-13 10:00:00'),
 ( 7, 3, 2, '2026-09-14 09:00:00'),
 ( 8, 3, 1, '2026-09-14 11:30:00'),
 (11, 3, 1, '2026-09-15 07:45:00'),
 ( 9, 3, 1, '2026-09-15 16:00:00'),
 ( 1, 4, 1, '2026-09-18 08:00:00'),
 (10, 4, 3, '2026-09-18 09:15:00'),
 ( 2,11, 2, '2026-09-21 10:00:00'),
 ( 3, 5, 1, '2026-10-03 09:00:00'),
 ( 4, 5, 2, '2026-10-04 07:30:00'),
 ( 5, 6, 1, '2026-10-04 08:10:00'),
 ( 6, 7, 2, '2026-10-04 11:00:00'),
 ( 7, 7, 1, '2026-10-04 12:20:00'),
 ( 8, 8, 1, '2026-10-04 13:00:00'),
 ( 9, 9, 1, '2026-10-04 16:00:00'),
 (10, 9, 1, '2026-10-04 17:30:00'),
 (11,10, 2, '2026-10-05 07:00:00');

-- 12. Respuesta del conductor a las solicitudes.
--     Al pasar a APROBADA, el trigger tr_solicitud_au genera la RESERVA.
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-09-11 09:00:00' WHERE id_solicitud IN (1,2);
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-09-11 13:00:00' WHERE id_solicitud = 3;
UPDATE solicitud SET estado='RECHAZADA', fecha_respuesta='2026-09-12 20:00:00',
       motivo_respuesta='Viaje sin cupos disponibles' WHERE id_solicitud = 4;
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-09-13 12:00:00' WHERE id_solicitud IN (5,6);
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-09-15 18:00:00' WHERE id_solicitud IN (7,8,9);
UPDATE solicitud SET estado='CANCELADA', fecha_respuesta='2026-09-16 08:00:00',
       motivo_respuesta='El pasajero canceló la solicitud' WHERE id_solicitud = 10;
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-09-18 12:00:00' WHERE id_solicitud IN (11,12);
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-09-21 12:00:00' WHERE id_solicitud = 13;
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-10-03 10:00:00' WHERE id_solicitud = 14;
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-10-04 13:00:00' WHERE id_solicitud IN (17,19);
UPDATE solicitud SET estado='APROBADA', fecha_respuesta='2026-10-04 16:30:00' WHERE id_solicitud = 20;

-- 13. Estado de los viajes ya realizados (el trigger tr_viaje_au actualiza las reservas)
UPDATE viaje SET estado='FINALIZADO' WHERE id_viaje IN (1,2,3,4);
UPDATE viaje SET estado='CANCELADO'  WHERE id_viaje = 11;

-- 14. Calificaciones (solo sobre reservas COMPLETADAS)
INSERT INTO calificacion (id_reserva, puntuacion, comentario, fecha)
SELECT r.id_reserva, d.puntuacion, d.comentario, d.fecha
  FROM (SELECT 1 AS sol, 5 AS puntuacion, 'Muy puntual y amable, la camioneta en buen estado.' AS comentario, '2026-09-14 12:00:00' AS fecha
        UNION ALL SELECT 2, 4, 'Buen viaje, se demoró un poco en salir.', '2026-09-14 18:30:00'
        UNION ALL SELECT 5, 5, 'Excelente, me dejó en la puerta del colegio.', '2026-09-15 09:00:00'
        UNION ALL SELECT 6, 3, NULL, '2026-09-16 07:00:00'
        UNION ALL SELECT 7, 5, 'Microbús cómodo, conductor muy prudente.', '2026-09-18 12:00:00'
        UNION ALL SELECT 9, 4, 'Todo bien, recomendado.', '2026-09-19 08:00:00'
        UNION ALL SELECT 12, 5, 'Nos ayudó con los bultos de cosecha.', '2026-09-22 10:00:00') d
  JOIN reserva r ON r.id_solicitud = d.sol;

COMMIT;

-- Verificación: número de registros por tabla
SELECT 'municipio' AS tabla, COUNT(*) AS registros FROM municipio
UNION ALL SELECT 'usuario', COUNT(*) FROM usuario
UNION ALL SELECT 'recuperacion_password', COUNT(*) FROM recuperacion_password
UNION ALL SELECT 'administrador', COUNT(*) FROM administrador
UNION ALL SELECT 'conductor', COUNT(*) FROM conductor
UNION ALL SELECT 'pasajero', COUNT(*) FROM pasajero
UNION ALL SELECT 'vehiculo', COUNT(*) FROM vehiculo
UNION ALL SELECT 'ruta', COUNT(*) FROM ruta
UNION ALL SELECT 'viaje', COUNT(*) FROM viaje
UNION ALL SELECT 'solicitud', COUNT(*) FROM solicitud
UNION ALL SELECT 'reserva', COUNT(*) FROM reserva
UNION ALL SELECT 'validacion', COUNT(*) FROM validacion
UNION ALL SELECT 'calificacion', COUNT(*) FROM calificacion;
