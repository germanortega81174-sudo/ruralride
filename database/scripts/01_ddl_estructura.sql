-- =====================================================================
-- RuralRide – Plataforma de Transporte Solidario Rural
-- Evidencia: GA6-220501096-AA2-EV01 – Implementación y manipulación de la BD
-- Script 01: DDL – Creación de la base de datos, tablas y restricciones
-- Autor: German Augusto Ortega Angel – ADSO (3336056)
-- Motor: MySQL 8.0 / MariaDB 10.4+ (XAMPP – phpMyAdmin) – Motor InnoDB
-- Ejecución: phpMyAdmin > pestaña SQL (o Importar), o MySQL Workbench.
-- =====================================================================

-- Modo estricto: los valores inválidos generan ERROR y no solo advertencia
SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS ruralride;
CREATE DATABASE ruralride
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE ruralride;

-- ---------------------------------------------------------------------
-- 1. MUNICIPIO – Catálogo de municipios (origen/destino de las rutas)
-- ---------------------------------------------------------------------
CREATE TABLE municipio (
  id_municipio   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(80)   NOT NULL,
  departamento   VARCHAR(60)   NOT NULL,
  CONSTRAINT pk_municipio PRIMARY KEY (id_municipio),
  CONSTRAINT uq_municipio_nombre_depto UNIQUE (nombre, departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. USUARIO – Toda persona registrada en la plataforma (RF01)
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tipo_documento    ENUM('CC','CE','TI','PPT') NOT NULL DEFAULT 'CC',
  numero_documento  VARCHAR(15)   NOT NULL,
  nombre            VARCHAR(60)   NOT NULL,
  apellido          VARCHAR(60)   NOT NULL,
  telefono          CHAR(10)      NOT NULL,
  correo            VARCHAR(120)  NOT NULL,
  password_hash     VARCHAR(255)  NOT NULL,
  id_municipio      INT UNSIGNED  NOT NULL,
  vereda_sector     VARCHAR(80)   NULL,
  fecha_registro    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado            ENUM('ACTIVO','INACTIVO','SUSPENDIDO') NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
  CONSTRAINT uq_usuario_documento UNIQUE (tipo_documento, numero_documento),
  CONSTRAINT uq_usuario_correo UNIQUE (correo),
  CONSTRAINT ck_usuario_telefono CHECK (telefono REGEXP '^3[0-9]{9}$'),
  CONSTRAINT ck_usuario_correo CHECK (correo LIKE '%_@_%._%'),
  CONSTRAINT fk_usuario_municipio FOREIGN KEY (id_municipio)
    REFERENCES municipio (id_municipio) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. RECUPERACION_PASSWORD – Tokens para recuperar contraseña (RF01)
-- ---------------------------------------------------------------------
CREATE TABLE recuperacion_password (
  id_recuperacion   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario        INT UNSIGNED NOT NULL,
  token_hash        CHAR(64)     NOT NULL,
  fecha_creacion    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion  DATETIME     NOT NULL,
  usado             TINYINT(1)   NOT NULL DEFAULT 0,
  CONSTRAINT pk_recuperacion PRIMARY KEY (id_recuperacion),
  CONSTRAINT uq_recuperacion_token UNIQUE (token_hash),
  CONSTRAINT ck_recuperacion_usado CHECK (usado IN (0,1)),
  CONSTRAINT ck_recuperacion_fechas CHECK (fecha_expiracion > fecha_creacion),
  CONSTRAINT fk_recuperacion_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. CONDUCTOR – Rol de usuario que publica rutas y viajes (RF02)
--    (un usuario puede ser conductor y pasajero a la vez)
-- ---------------------------------------------------------------------
CREATE TABLE conductor (
  id_conductor          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario            INT UNSIGNED NOT NULL,
  numero_licencia       VARCHAR(20)  NOT NULL,
  categoria_licencia    ENUM('A2','B1','B2','B3','C1','C2','C3') NOT NULL,
  vencimiento_licencia  DATE         NOT NULL,
  anios_experiencia     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  fecha_alta            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_conductor PRIMARY KEY (id_conductor),
  CONSTRAINT uq_conductor_usuario UNIQUE (id_usuario),
  CONSTRAINT uq_conductor_licencia UNIQUE (numero_licencia),
  CONSTRAINT ck_conductor_experiencia CHECK (anios_experiencia BETWEEN 0 AND 60),
  CONSTRAINT fk_conductor_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. PASAJERO – Rol de usuario que solicita cupos (RF03)
-- ---------------------------------------------------------------------
CREATE TABLE pasajero (
  id_pasajero                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario                   INT UNSIGNED NOT NULL,
  contacto_emergencia_nombre   VARCHAR(120) NULL,
  contacto_emergencia_telefono CHAR(10)     NULL,
  necesidad_especial           VARCHAR(150) NULL,
  fecha_alta                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_pasajero PRIMARY KEY (id_pasajero),
  CONSTRAINT uq_pasajero_usuario UNIQUE (id_usuario),
  CONSTRAINT ck_pasajero_tel_emergencia CHECK (contacto_emergencia_telefono IS NULL
      OR contacto_emergencia_telefono REGEXP '^[0-9]{10}$'),
  CONSTRAINT fk_pasajero_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. ADMINISTRADOR – Rol que gestiona la validación comunitaria (RF04)
-- ---------------------------------------------------------------------
CREATE TABLE administrador (
  id_administrador  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario        INT UNSIGNED NOT NULL,
  cargo             VARCHAR(80)  NOT NULL,
  fecha_alta        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_administrador PRIMARY KEY (id_administrador),
  CONSTRAINT uq_administrador_usuario UNIQUE (id_usuario),
  CONSTRAINT fk_administrador_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. VEHICULO – Vehículos registrados por un conductor (RF02)
-- ---------------------------------------------------------------------
CREATE TABLE vehiculo (
  id_vehiculo   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_conductor  INT UNSIGNED NOT NULL,
  placa         CHAR(6)      NOT NULL,
  tipo          ENUM('AUTOMOVIL','CAMPERO','CAMIONETA','MICROBUS','MOTOCICLETA') NOT NULL,
  marca         VARCHAR(40)  NOT NULL,
  linea         VARCHAR(40)  NOT NULL,
  anio_modelo   SMALLINT UNSIGNED NOT NULL,
  color         VARCHAR(30)  NOT NULL,
  capacidad     TINYINT UNSIGNED NOT NULL,
  estado        ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT pk_vehiculo PRIMARY KEY (id_vehiculo),
  CONSTRAINT uq_vehiculo_placa UNIQUE (placa),
  CONSTRAINT ck_vehiculo_placa CHECK (placa REGEXP '^[A-Z]{3}[0-9]{2}[0-9A-Z]$'),
  CONSTRAINT ck_vehiculo_capacidad CHECK (capacidad BETWEEN 1 AND 20),
  CONSTRAINT ck_vehiculo_anio CHECK (anio_modelo BETWEEN 1980 AND 2030),
  CONSTRAINT fk_vehiculo_conductor FOREIGN KEY (id_conductor)
    REFERENCES conductor (id_conductor) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. RUTA – Recorrido habitual publicado por un conductor (RF02)
-- ---------------------------------------------------------------------
CREATE TABLE ruta (
  id_ruta               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_conductor          INT UNSIGNED NOT NULL,
  id_municipio_origen   INT UNSIGNED NOT NULL,
  id_municipio_destino  INT UNSIGNED NOT NULL,
  punto_encuentro       VARCHAR(150) NOT NULL,
  distancia_km          DECIMAL(6,2) NOT NULL,
  tiempo_estimado_min   SMALLINT UNSIGNED NOT NULL,
  estado                ENUM('ACTIVA','INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  CONSTRAINT pk_ruta PRIMARY KEY (id_ruta),
  CONSTRAINT ck_ruta_origen_destino CHECK (id_municipio_origen <> id_municipio_destino),
  CONSTRAINT ck_ruta_distancia CHECK (distancia_km > 0),
  CONSTRAINT ck_ruta_tiempo CHECK (tiempo_estimado_min > 0),
  CONSTRAINT fk_ruta_conductor FOREIGN KEY (id_conductor)
    REFERENCES conductor (id_conductor) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_ruta_origen FOREIGN KEY (id_municipio_origen)
    REFERENCES municipio (id_municipio) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_ruta_destino FOREIGN KEY (id_municipio_destino)
    REFERENCES municipio (id_municipio) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. VIAJE – Ejecución programada de una ruta en un vehículo (RF02)
-- ---------------------------------------------------------------------
CREATE TABLE viaje (
  id_viaje           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_ruta            INT UNSIGNED  NOT NULL,
  id_vehiculo        INT UNSIGNED  NOT NULL,
  fecha_hora_salida  DATETIME      NOT NULL,
  costo_por_cupo     DECIMAL(10,2) NOT NULL,
  cupos_ofrecidos    TINYINT UNSIGNED NOT NULL,
  estado             ENUM('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'PROGRAMADO',
  fecha_publicacion  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_viaje PRIMARY KEY (id_viaje),
  CONSTRAINT uq_viaje_vehiculo_salida UNIQUE (id_vehiculo, fecha_hora_salida),
  CONSTRAINT ck_viaje_costo CHECK (costo_por_cupo >= 0),
  CONSTRAINT ck_viaje_cupos CHECK (cupos_ofrecidos BETWEEN 1 AND 20),
  CONSTRAINT fk_viaje_ruta FOREIGN KEY (id_ruta)
    REFERENCES ruta (id_ruta) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_viaje_vehiculo FOREIGN KEY (id_vehiculo)
    REFERENCES vehiculo (id_vehiculo) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. SOLICITUD – Intención de un pasajero de ocupar cupos (RF03)
-- ---------------------------------------------------------------------
CREATE TABLE solicitud (
  id_solicitud       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_pasajero        INT UNSIGNED NOT NULL,
  id_viaje           INT UNSIGNED NOT NULL,
  cupos_solicitados  TINYINT UNSIGNED NOT NULL DEFAULT 1,
  fecha_solicitud    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado             ENUM('PENDIENTE','APROBADA','RECHAZADA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
  fecha_respuesta    DATETIME     NULL,
  motivo_respuesta   VARCHAR(200) NULL,
  CONSTRAINT pk_solicitud PRIMARY KEY (id_solicitud),
  CONSTRAINT uq_solicitud_pasajero_viaje UNIQUE (id_pasajero, id_viaje),
  CONSTRAINT ck_solicitud_cupos CHECK (cupos_solicitados BETWEEN 1 AND 6),
  CONSTRAINT ck_solicitud_respuesta CHECK (estado = 'PENDIENTE' OR fecha_respuesta IS NOT NULL),
  CONSTRAINT ck_solicitud_fechas CHECK (fecha_respuesta IS NULL OR fecha_respuesta >= fecha_solicitud),
  CONSTRAINT fk_solicitud_pasajero FOREIGN KEY (id_pasajero)
    REFERENCES pasajero (id_pasajero) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_solicitud_viaje FOREIGN KEY (id_viaje)
    REFERENCES viaje (id_viaje) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. RESERVA – Confirmación de una solicitud aprobada (RF03)
-- ---------------------------------------------------------------------
CREATE TABLE reserva (
  id_reserva     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_solicitud   INT UNSIGNED NOT NULL,
  codigo         CHAR(8)      NOT NULL,
  fecha_reserva  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado         ENUM('CONFIRMADA','CANCELADA','COMPLETADA') NOT NULL DEFAULT 'CONFIRMADA',
  CONSTRAINT pk_reserva PRIMARY KEY (id_reserva),
  CONSTRAINT uq_reserva_solicitud UNIQUE (id_solicitud),
  CONSTRAINT uq_reserva_codigo UNIQUE (codigo),
  CONSTRAINT fk_reserva_solicitud FOREIGN KEY (id_solicitud)
    REFERENCES solicitud (id_solicitud) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. VALIDACION – Proceso comunitario de aprobación del conductor (RF04)
-- ---------------------------------------------------------------------
CREATE TABLE validacion (
  id_validacion      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_conductor       INT UNSIGNED NOT NULL,
  id_administrador   INT UNSIGNED NULL,
  estado             ENUM('PENDIENTE','APROBADA','RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  observaciones      VARCHAR(500) NULL,
  fecha_solicitud    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_validacion   DATETIME     NULL,
  CONSTRAINT pk_validacion PRIMARY KEY (id_validacion),
  CONSTRAINT ck_validacion_resuelta CHECK (estado = 'PENDIENTE'
      OR (id_administrador IS NOT NULL AND fecha_validacion IS NOT NULL)),
  CONSTRAINT ck_validacion_rechazo CHECK (estado <> 'RECHAZADA' OR observaciones IS NOT NULL),
  CONSTRAINT ck_validacion_fechas CHECK (fecha_validacion IS NULL OR fecha_validacion >= fecha_solicitud),
  CONSTRAINT fk_validacion_conductor FOREIGN KEY (id_conductor)
    REFERENCES conductor (id_conductor) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_validacion_administrador FOREIGN KEY (id_administrador)
    REFERENCES administrador (id_administrador) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. CALIFICACION – Evaluación del servicio por el pasajero que viajó
-- ---------------------------------------------------------------------
CREATE TABLE calificacion (
  id_calificacion  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_reserva       INT UNSIGNED NOT NULL,
  puntuacion       TINYINT UNSIGNED NOT NULL,
  comentario       VARCHAR(300) NULL,
  fecha            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_calificacion PRIMARY KEY (id_calificacion),
  CONSTRAINT uq_calificacion_reserva UNIQUE (id_reserva),
  CONSTRAINT ck_calificacion_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
  CONSTRAINT fk_calificacion_reserva FOREIGN KEY (id_reserva)
    REFERENCES reserva (id_reserva) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Índices de apoyo a las búsquedas frecuentes (RF03 – buscar viajes)
-- ---------------------------------------------------------------------
CREATE INDEX ix_viaje_salida_estado ON viaje (fecha_hora_salida, estado);
CREATE INDEX ix_ruta_origen_destino ON ruta (id_municipio_origen, id_municipio_destino);
CREATE INDEX ix_solicitud_estado ON solicitud (estado);
CREATE INDEX ix_validacion_conductor_fecha ON validacion (id_conductor, fecha_solicitud);

-- Verificación: lista de tablas creadas y su motor
SELECT table_name AS tabla, engine AS motor, table_collation AS cotejamiento
FROM information_schema.tables
WHERE table_schema = 'ruralride'
ORDER BY table_name;
