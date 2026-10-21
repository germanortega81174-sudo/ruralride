// Reglas de negocio de RuralRide como funciones puras (no dependen de React).
// Son las mismas que protegen los triggers de la base de datos (RN05 a RN22); aquí se validan
// antes de guardar para mostrarle al usuario un mensaje claro. Al ser funciones puras se pueden
// probar con los datos de prueba sin abrir el navegador (ver reglasNegocio.test.js).

/** Estados de reserva que ocupan cupo. Una reserva CANCELADA libera el cupo (fn_cupos_disponibles). */
export const ESTADOS_QUE_OCUPAN_CUPO = ['CONFIRMADA', 'COMPLETADA'];
export const MAX_CUPOS_SOLICITUD = 6;

export class ReglaNegocioError extends Error {
  constructor(regla, mensaje) {
    super(regla ? `${regla}: ${mensaje}` : mensaje);
    this.regla = regla;
  }
}

/**
 * Cupos libres de un viaje: ofrecidos menos los de reservas vigentes.
 * @param {object} db - Datos con las tablas viaje, solicitud y reserva.
 * @param {number} idViaje - Identificador del viaje.
 * @returns {number} Cupos disponibles (0 si el viaje no existe).
 */
export function calcularCuposDisponibles(db, idViaje) {
  const viaje = db.viaje.find((v) => v.id_viaje === idViaje);
  if (!viaje) return 0;
  const ocupados = db.solicitud
    .filter((s) => s.id_viaje === idViaje)
    .filter((s) =>
      db.reserva.some(
        (r) => r.id_solicitud === s.id_solicitud && ESTADOS_QUE_OCUPAN_CUPO.includes(r.estado)
      )
    )
    .reduce((total, s) => total + s.cupos_solicitados, 0);
  return viaje.cupos_ofrecidos - ocupados;
}

/** Última validación comunitaria del conductor (vista v_estado_validacion_conductor). */
export function obtenerUltimaValidacion(db, idConductor) {
  return db.validacion
    .filter((v) => v.id_conductor === idConductor)
    .sort((a, b) =>
      a.fecha_solicitud === b.fecha_solicitud
        ? b.id_validacion - a.id_validacion
        : a.fecha_solicitud < b.fecha_solicitud
          ? 1
          : -1
    )[0];
}

/** RN13, RN14, RN15 y uq_viaje_vehiculo_salida al publicar un viaje. */
export function validarPublicacionViaje(db, viaje) {
  const ruta = db.ruta.find((r) => r.id_ruta === viaje.id_ruta);
  const vehiculo = db.vehiculo.find((x) => x.id_vehiculo === viaje.id_vehiculo);
  if (!ruta || !vehiculo || ruta.id_conductor !== vehiculo.id_conductor) {
    throw new ReglaNegocioError('RN13', 'El vehículo no pertenece al conductor de la ruta.');
  }
  if (viaje.cupos_ofrecidos > vehiculo.capacidad) {
    throw new ReglaNegocioError(
      'RN14',
      `Los cupos ofrecidos superan la capacidad del vehículo (${vehiculo.capacidad}).`
    );
  }
  if (obtenerUltimaValidacion(db, ruta.id_conductor)?.estado !== 'APROBADA') {
    throw new ReglaNegocioError('RN15', 'Su validación comunitaria aún no está APROBADA.');
  }
  const mismoHorario = db.viaje.some(
    (x) => x.id_vehiculo === viaje.id_vehiculo && x.fecha_hora_salida === viaje.fecha_hora_salida
  );
  if (mismoHorario) {
    throw new ReglaNegocioError(null, 'Ese vehículo ya tiene un viaje a esa misma hora.');
  }
}

/** RN05, RN17, RN18 y cupos disponibles al solicitar un cupo. */
export function validarSolicitudCupo(db, idPasajero, idViaje, cupos) {
  const viaje = db.viaje.find((v) => v.id_viaje === idViaje);
  const pasajero = db.pasajero.find((p) => p.id_pasajero === idPasajero);
  if (!viaje || !pasajero) throw new ReglaNegocioError(null, 'El viaje o el pasajero no existe.');
  const ruta = db.ruta.find((r) => r.id_ruta === viaje.id_ruta);
  const conductor = db.conductor.find((c) => c.id_conductor === ruta.id_conductor);
  if (viaje.estado !== 'PROGRAMADO') {
    throw new ReglaNegocioError('RN17', 'Solo se pueden solicitar cupos en viajes programados.');
  }
  if (conductor.id_usuario === pasajero.id_usuario) {
    throw new ReglaNegocioError('RN18', 'No puede solicitar cupo en su propio viaje.');
  }
  if (db.solicitud.some((s) => s.id_pasajero === idPasajero && s.id_viaje === idViaje)) {
    throw new ReglaNegocioError('RN05', 'Ya tiene una solicitud para este viaje.');
  }
  if (cupos < 1 || cupos > MAX_CUPOS_SOLICITUD) {
    throw new ReglaNegocioError(null, `Puede pedir entre 1 y ${MAX_CUPOS_SOLICITUD} cupos.`);
  }
  const disponibles = calcularCuposDisponibles(db, idViaje);
  if (cupos > disponibles) {
    throw new ReglaNegocioError(null, `Solo hay ${disponibles} cupo(s) disponible(s).`);
  }
}

/** RN19 y RN20 al responder una solicitud. */
export function validarRespuestaSolicitud(db, idSolicitud, estado) {
  const solicitud = db.solicitud.find((x) => x.id_solicitud === idSolicitud);
  if (!solicitud) throw new ReglaNegocioError(null, 'La solicitud no existe.');
  if (solicitud.estado !== 'PENDIENTE') {
    throw new ReglaNegocioError('RN19', 'Solo se responden solicitudes pendientes.');
  }
  if (
    estado === 'APROBADA' &&
    calcularCuposDisponibles(db, solicitud.id_viaje) < solicitud.cupos_solicitados
  ) {
    throw new ReglaNegocioError('RN20', 'No hay cupos disponibles para aprobar la solicitud.');
  }
  return solicitud;
}

/** RN22 y uq_calificacion_reserva al calificar. */
export function validarCalificacion(db, idReserva, puntuacion) {
  const reserva = db.reserva.find((x) => x.id_reserva === idReserva);
  if (!reserva) throw new ReglaNegocioError(null, 'La reserva no existe.');
  if (reserva.estado !== 'COMPLETADA') {
    throw new ReglaNegocioError('RN22', 'Solo se califican viajes finalizados.');
  }
  if (db.calificacion.some((c) => c.id_reserva === idReserva)) {
    throw new ReglaNegocioError(null, 'Este viaje ya fue calificado.');
  }
  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    throw new ReglaNegocioError(null, 'La puntuación debe estar entre 1 y 5.');
  }
}

/** ck_validacion_rechazo: un rechazo siempre lleva observaciones. */
export function validarResolucionValidacion(estado, observaciones) {
  if (estado === 'RECHAZADA' && !observaciones?.trim()) {
    throw new ReglaNegocioError(null, 'Para rechazar debe registrar observaciones.');
  }
}

/** Reputación del conductor (vista v_reputacion_conductor). */
export function calcularReputacion(db, idConductor) {
  const rutas = db.ruta.filter((r) => r.id_conductor === idConductor).map((r) => r.id_ruta);
  const viajes = db.viaje.filter((v) => rutas.includes(v.id_ruta)).map((v) => v.id_viaje);
  const solicitudes = db.solicitud
    .filter((s) => viajes.includes(s.id_viaje))
    .map((s) => s.id_solicitud);
  const reservas = db.reserva
    .filter((r) => solicitudes.includes(r.id_solicitud))
    .map((r) => r.id_reserva);
  const calificaciones = db.calificacion.filter((c) => reservas.includes(c.id_reserva));
  const promedio = calificaciones.length
    ? calificaciones.reduce((suma, c) => suma + c.puntuacion, 0) / calificaciones.length
    : 0;
  return { total: calificaciones.length, promedio: Math.round(promedio * 100) / 100 };
}
