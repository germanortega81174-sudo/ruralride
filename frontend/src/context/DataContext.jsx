/* eslint-disable react-refresh/only-export-components */
// Almacén de datos del prototipo. Replica la estructura de la base de datos `ruralride`
// (Evidencias 1 y 2). Las reglas de negocio están en services/reglasNegocio.js, porque en esta etapa el frontend todavía
// NO se conecta al backend. Más adelante cada función se reemplazará por una petición
// a la API en Node.js.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  calcularCuposDisponibles,
  calcularReputacion,
  obtenerUltimaValidacion,
  validarCalificacion,
  validarPublicacionViaje,
  validarResolucionValidacion,
  validarRespuestaSolicitud,
  validarSolicitudCupo,
} from '@/services/reglasNegocio.js';
import { borrarDatosGuardados, cargarDatos, guardarDatos } from '@/services/almacenamiento.js';

const DataContext = createContext(null);

const ahora = () => new Date().toISOString().slice(0, 19);
const siguienteId = (lista, campo) => Math.max(0, ...lista.map((x) => x[campo])) + 1;

export function DataProvider({ children }) {
  // Estado compartido por toda la aplicación. Se carga del navegador y se guarda en cada cambio.
  const [db, setDb] = useState(cargarDatos);
  useEffect(() => guardarDatos(db), [db]);

  /** Vuelve a los datos de prueba originales (útil para repetir una demostración). */
  const restablecerDatos = useCallback(() => setDb(borrarDatosGuardados()), []);

  // ----------------------------- consultas -----------------------------
  const municipio = useCallback((id) => db.municipio.find((m) => m.id_municipio === id), [db]);
  const usuario = useCallback((id) => db.usuario.find((u) => u.id_usuario === id), [db]);

  /** Atributo derivado: cupos_ofrecidos − cupos de reservas vigentes (fn_cupos_disponibles). */
  const cuposDisponibles = useCallback((idViaje) => calcularCuposDisponibles(db, idViaje), [db]);

  /** Equivalente a la vista v_viajes_disponibles (JOIN de viaje, ruta, municipio, conductor, usuario y vehículo). */
  const detalleViaje = useCallback(
    (v) => {
      const ruta = db.ruta.find((r) => r.id_ruta === v.id_ruta);
      const conductor = db.conductor.find((c) => c.id_conductor === ruta.id_conductor);
      const u = usuario(conductor.id_usuario);
      const vehiculo = db.vehiculo.find((x) => x.id_vehiculo === v.id_vehiculo);
      return {
        ...v,
        ruta,
        conductor,
        nombreConductor: `${u.nombre} ${u.apellido}`,
        vehiculo,
        origen: municipio(ruta.id_municipio_origen)?.nombre,
        destino: municipio(ruta.id_municipio_destino)?.nombre,
        cupos_disponibles: cuposDisponibles(v.id_viaje),
      };
    },
    [db, usuario, municipio, cuposDisponibles]
  );

  /** Calificación promedio del conductor (vista v_reputacion_conductor). */
  const reputacion = useCallback((idConductor) => calcularReputacion(db, idConductor), [db]);

  /** Última validación del conductor (vista v_estado_validacion_conductor). */
  const validacionVigente = useCallback(
    (idConductor) => obtenerUltimaValidacion(db, idConductor),
    [db]
  );

  // ----------------------------- operaciones -----------------------------
  const registrarUsuario = useCallback(
    (datosUsuario) => {
      if (db.usuario.some((u) => u.correo.toLowerCase() === datosUsuario.correo.toLowerCase()))
        throw new Error('Ya existe una cuenta con ese correo (uq_usuario_correo).');
      if (
        db.usuario.some(
          (u) =>
            u.tipo_documento === datosUsuario.tipo_documento &&
            u.numero_documento === datosUsuario.numero_documento
        )
      )
        throw new Error('Ya existe una cuenta con ese documento (uq_usuario_documento).');
      const id_usuario = siguienteId(db.usuario, 'id_usuario');
      const nuevo = { id_usuario, ...datosUsuario, fecha_registro: ahora(), estado: 'ACTIVO' };
      const pasajero = {
        id_pasajero: siguienteId(db.pasajero, 'id_pasajero'),
        id_usuario,
        contacto_emergencia_nombre: null,
        contacto_emergencia_telefono: null,
        necesidad_especial: null,
        fecha_alta: ahora(),
      };
      setDb((prev) => ({
        ...prev,
        usuario: [...prev.usuario, nuevo],
        pasajero: [...prev.pasajero, pasajero],
      }));
      return nuevo;
    },
    [db]
  );

  const actualizarUsuario = useCallback((id, cambios) => {
    setDb((prev) => ({
      ...prev,
      usuario: prev.usuario.map((u) => (u.id_usuario === id ? { ...u, ...cambios } : u)),
    }));
  }, []);

  const actualizarPasajero = useCallback((idUsuario, cambios) => {
    setDb((prev) => ({
      ...prev,
      pasajero: prev.pasajero.map((p) => (p.id_usuario === idUsuario ? { ...p, ...cambios } : p)),
    }));
  }, []);

  /** RN10: al hacerse conductor se crea su validación PENDIENTE. */
  const hacerseConductor = useCallback(
    (idUsuario, datosConductor) => {
      if (db.conductor.some((c) => c.numero_licencia === datosConductor.numero_licencia))
        throw new Error('Esa licencia ya está registrada (uq_conductor_licencia).');
      const id_conductor = siguienteId(db.conductor, 'id_conductor');
      setDb((prev) => ({
        ...prev,
        conductor: [
          ...prev.conductor,
          { id_conductor, id_usuario: idUsuario, ...datosConductor, fecha_alta: ahora() },
        ],
        validacion: [
          ...prev.validacion,
          {
            id_validacion: siguienteId(prev.validacion, 'id_validacion'),
            id_conductor,
            id_administrador: null,
            estado: 'PENDIENTE',
            observaciones: null,
            fecha_solicitud: ahora(),
            fecha_validacion: null,
          },
        ],
      }));
    },
    [db]
  );

  const registrarVehiculo = useCallback(
    (idConductor, v) => {
      if (db.vehiculo.some((x) => x.placa === v.placa))
        throw new Error('Ya existe un vehículo con esa placa (uq_vehiculo_placa).');
      setDb((prev) => ({
        ...prev,
        vehiculo: [
          ...prev.vehiculo,
          {
            id_vehiculo: siguienteId(prev.vehiculo, 'id_vehiculo'),
            id_conductor: idConductor,
            ...v,
            estado: 'ACTIVO',
          },
        ],
      }));
    },
    [db]
  );

  const registrarRuta = useCallback((idConductor, r) => {
    setDb((prev) => ({
      ...prev,
      ruta: [
        ...prev.ruta,
        {
          id_ruta: siguienteId(prev.ruta, 'id_ruta'),
          id_conductor: idConductor,
          ...r,
          estado: 'ACTIVA',
        },
      ],
    }));
  }, []);

  /** RN13, RN14 y RN15 (trigger tr_viaje_bi). */
  const publicarViaje = useCallback(
    (v) => {
      validarPublicacionViaje(db, v);
      setDb((prev) => ({
        ...prev,
        viaje: [
          ...prev.viaje,
          {
            id_viaje: siguienteId(prev.viaje, 'id_viaje'),
            ...v,
            estado: 'PROGRAMADO',
            fecha_publicacion: ahora(),
          },
        ],
      }));
    },
    [db]
  );

  /** RN05, RN17 y RN18 (trigger tr_solicitud_bi y UNIQUE (id_pasajero, id_viaje)). */
  const solicitarCupo = useCallback(
    (idPasajero, idViaje, cupos) => {
      validarSolicitudCupo(db, idPasajero, idViaje, cupos);
      setDb((prev) => ({
        ...prev,
        solicitud: [
          ...prev.solicitud,
          {
            id_solicitud: siguienteId(prev.solicitud, 'id_solicitud'),
            id_pasajero: idPasajero,
            id_viaje: idViaje,
            cupos_solicitados: cupos,
            fecha_solicitud: ahora(),
            estado: 'PENDIENTE',
            fecha_respuesta: null,
            motivo_respuesta: null,
          },
        ],
      }));
    },
    [db]
  );

  /** RN19, RN20 y RN07 (triggers tr_solicitud_bu y tr_solicitud_au). */
  const responderSolicitud = useCallback(
    (idSolicitud, estado, motivo = null) => {
      validarRespuestaSolicitud(db, idSolicitud, estado);
      setDb((prev) => {
        const solicitud = prev.solicitud.map((x) =>
          x.id_solicitud === idSolicitud
            ? { ...x, estado, motivo_respuesta: motivo, fecha_respuesta: ahora() }
            : x
        );
        const reserva =
          estado === 'APROBADA'
            ? [
                ...prev.reserva,
                {
                  id_reserva: siguienteId(prev.reserva, 'id_reserva'),
                  id_solicitud: idSolicitud,
                  codigo: `RR${String(idSolicitud).padStart(6, '0')}`,
                  fecha_reserva: ahora(),
                  estado: 'CONFIRMADA',
                },
              ]
            : prev.reserva;
        return { ...prev, solicitud, reserva };
      });
    },
    [db]
  );

  const cancelarReserva = useCallback((idReserva) => {
    setDb((prev) => ({
      ...prev,
      reserva: prev.reserva.map((r) =>
        r.id_reserva === idReserva ? { ...r, estado: 'CANCELADA' } : r
      ),
    }));
  }, []);

  /** RN22 (trigger tr_calificacion_bi) y UNIQUE (id_reserva). */
  const calificar = useCallback(
    (idReserva, puntuacion, comentario) => {
      validarCalificacion(db, idReserva, puntuacion);
      setDb((prev) => ({
        ...prev,
        calificacion: [
          ...prev.calificacion,
          {
            id_calificacion: siguienteId(prev.calificacion, 'id_calificacion'),
            id_reserva: idReserva,
            puntuacion,
            comentario: comentario || null,
            fecha: ahora(),
          },
        ],
      }));
    },
    [db]
  );

  /** RF04: resolver una validación (CHECK ck_validacion_resuelta y ck_validacion_rechazo). */
  const resolverValidacion = useCallback((idValidacion, idAdministrador, estado, observaciones) => {
    validarResolucionValidacion(estado, observaciones);
    setDb((prev) => ({
      ...prev,
      validacion: prev.validacion.map((v) =>
        v.id_validacion === idValidacion
          ? {
              ...v,
              estado,
              observaciones: observaciones || null,
              id_administrador: idAdministrador,
              fecha_validacion: ahora(),
            }
          : v
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      db,
      municipio,
      usuario,
      cuposDisponibles,
      detalleViaje,
      reputacion,
      validacionVigente,
      registrarUsuario,
      actualizarUsuario,
      actualizarPasajero,
      hacerseConductor,
      registrarVehiculo,
      registrarRuta,
      publicarViaje,
      solicitarCupo,
      responderSolicitud,
      cancelarReserva,
      calificar,
      resolverValidacion,
      restablecerDatos,
    }),
    [
      db,
      municipio,
      usuario,
      cuposDisponibles,
      detalleViaje,
      reputacion,
      validacionVigente,
      registrarUsuario,
      actualizarUsuario,
      actualizarPasajero,
      hacerseConductor,
      registrarVehiculo,
      registrarRuta,
      publicarViaje,
      solicitarCupo,
      responderSolicitud,
      cancelarReserva,
      calificar,
      resolverValidacion,
      restablecerDatos,
    ]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
