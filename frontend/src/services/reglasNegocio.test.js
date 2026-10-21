// Pruebas de las reglas de negocio con los datos de prueba exportados de la base de datos.
// Cada caso usa registros reales de datosPrueba.json, igual que en la Evidencia 2.
import { describe, expect, it } from 'vitest';
import datosPrueba from '@/data/datosPrueba.json';
import {
  calcularCuposDisponibles,
  calcularReputacion,
  obtenerUltimaValidacion,
  validarCalificacion,
  validarPublicacionViaje,
  validarRespuestaSolicitud,
  validarSolicitudCupo,
} from '@/services/reglasNegocio.js';

const db = structuredClone(datosPrueba);

describe('calcularCuposDisponibles (fn_cupos_disponibles)', () => {
  it('descuenta los cupos de reservas confirmadas y completadas', () => {
    // Viaje 5: 4 cupos ofrecidos; reservas confirmadas de 1 y 2 cupos
    expect(calcularCuposDisponibles(db, 5)).toBe(1);
  });

  it('una reserva cancelada libera el cupo', () => {
    // Viaje 7: 10 cupos; su única reserva (solicitud 17) está CANCELADA
    expect(calcularCuposDisponibles(db, 7)).toBe(10);
  });

  it('devuelve 0 cuando el viaje está lleno o no existe', () => {
    expect(calcularCuposDisponibles(db, 9)).toBe(0);
    expect(calcularCuposDisponibles(db, 999)).toBe(0);
  });
});

describe('validarSolicitudCupo (RN05, RN17, RN18)', () => {
  it('acepta una solicitud válida', () => {
    expect(() => validarSolicitudCupo(db, 1, 5, 1)).not.toThrow();
  });

  it('RN17: rechaza viajes que no están programados', () => {
    expect(() => validarSolicitudCupo(db, 2, 1, 1)).toThrow(/RN17/);
  });

  it('RN18: el conductor no puede pedir cupo en su propio viaje', () => {
    // Pasajero 11 es la misma persona que el conductor 2, dueño del viaje 6
    expect(() => validarSolicitudCupo(db, 11, 6, 1)).toThrow(/RN18/);
  });

  it('RN05: una sola solicitud por pasajero y viaje', () => {
    expect(() => validarSolicitudCupo(db, 3, 5, 1)).toThrow(/RN05/);
  });

  it('no permite pedir más cupos de los disponibles', () => {
    expect(() => validarSolicitudCupo(db, 1, 5, 2)).toThrow('Solo hay 1 cupo(s) disponible(s).');
  });
});

describe('validarRespuestaSolicitud (RN19, RN20)', () => {
  it('aprueba una solicitud pendiente con cupos', () => {
    expect(validarRespuestaSolicitud(db, 16, 'APROBADA').id_solicitud).toBe(16);
  });

  it('RN19: no responde solicitudes ya resueltas', () => {
    expect(() => validarRespuestaSolicitud(db, 1, 'APROBADA')).toThrow(/RN19/);
  });

  it('RN20: no aprueba si el viaje ya no tiene cupos', () => {
    expect(() => validarRespuestaSolicitud(db, 21, 'APROBADA')).toThrow(/RN20/);
  });

  it('sí permite rechazar aunque no haya cupos', () => {
    expect(() => validarRespuestaSolicitud(db, 21, 'RECHAZADA')).not.toThrow();
  });
});

describe('validarPublicacionViaje (RN13, RN14, RN15)', () => {
  const base = {
    id_ruta: 1,
    id_vehiculo: 1,
    cupos_ofrecidos: 4,
    fecha_hora_salida: '2026-12-01T06:00:00',
  };

  it('publica cuando todo es correcto', () => {
    expect(() => validarPublicacionViaje(db, base)).not.toThrow();
  });

  it('RN13: el vehículo debe ser del conductor de la ruta', () => {
    expect(() => validarPublicacionViaje(db, { ...base, id_vehiculo: 3 })).toThrow(/RN13/);
  });

  it('RN14: los cupos no superan la capacidad del vehículo', () => {
    expect(() => validarPublicacionViaje(db, { ...base, cupos_ofrecidos: 5 })).toThrow(/RN14/);
  });

  it('RN15: un conductor rechazado no puede publicar', () => {
    expect(() => validarPublicacionViaje(db, { ...base, id_ruta: 8, id_vehiculo: 7 })).toThrow(
      /RN15/
    );
  });

  it('un vehículo no puede tener dos viajes a la misma hora', () => {
    const repetido = { ...base, fecha_hora_salida: db.viaje[4].fecha_hora_salida };
    expect(() => validarPublicacionViaje(db, repetido)).toThrow(/misma hora/);
  });
});

describe('validarCalificacion (RN22)', () => {
  it('califica una reserva completada sin calificación', () => {
    expect(() => validarCalificacion(db, 3, 4)).not.toThrow();
  });

  it('RN22: no califica viajes que no han terminado', () => {
    expect(() => validarCalificacion(db, 12, 5)).toThrow(/RN22/);
  });

  it('no permite calificar dos veces ni puntuaciones fuera de 1 a 5', () => {
    expect(() => validarCalificacion(db, 1, 5)).toThrow(/ya fue calificado/);
    expect(() => validarCalificacion(db, 3, 6)).toThrow(/entre 1 y 5/);
  });
});

describe('vistas derivadas', () => {
  it('reputación del conductor 1 (v_reputacion_conductor)', () => {
    expect(calcularReputacion(db, 1)).toEqual({ total: 3, promedio: 4.67 });
  });

  it('con dos validaciones de la misma fecha gana la de id mayor', () => {
    const datos = {
      validacion: [
        {
          id_validacion: 1,
          id_conductor: 9,
          estado: 'RECHAZADA',
          fecha_solicitud: '2026-10-01T08:00:00',
        },
        {
          id_validacion: 2,
          id_conductor: 9,
          estado: 'APROBADA',
          fecha_solicitud: '2026-10-01T08:00:00',
        },
      ],
    };
    expect(obtenerUltimaValidacion(datos, 9).id_validacion).toBe(2);
  });
});
