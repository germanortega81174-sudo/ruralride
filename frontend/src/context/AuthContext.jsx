/* eslint-disable react-refresh/only-export-components */
// Sesión simulada: en esta etapa no hay backend, por lo que el inicio de sesión
// se valida contra los datos de prueba. Contraseña de todos los usuarios de prueba: RuralRide2026*
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useData } from '@/context/DataContext.jsx';

export const PASSWORD_DEMO = 'RuralRide2026*';
const AuthContext = createContext(null);
const CLAVE_SESION = 'ruralride:sesion';

// La sesión se guarda en sessionStorage: sobrevive a una recarga, pero se borra al cerrar la pestaña
const leerSesionGuardada = () => {
  try {
    return Number(sessionStorage.getItem(CLAVE_SESION)) || null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const { db } = useData();
  const [idUsuario, setIdUsuario] = useState(leerSesionGuardada);

  useEffect(() => {
    try {
      if (idUsuario) sessionStorage.setItem(CLAVE_SESION, String(idUsuario));
      else sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // sin almacenamiento: la sesión dura mientras la página esté abierta
    }
  }, [idUsuario]);

  const sesion = useMemo(() => {
    if (!idUsuario) return null;
    const usuario = db.usuario.find((u) => u.id_usuario === idUsuario);
    if (!usuario) return null;
    return {
      usuario,
      conductor: db.conductor.find((c) => c.id_usuario === idUsuario) || null,
      pasajero: db.pasajero.find((p) => p.id_usuario === idUsuario) || null,
      administrador: db.administrador.find((a) => a.id_usuario === idUsuario) || null,
    };
  }, [db, idUsuario]);

  const login = (correo, password) => {
    const u = db.usuario.find((x) => x.correo.toLowerCase() === correo.trim().toLowerCase());
    if (!u || (password !== PASSWORD_DEMO && password !== u._password))
      throw new Error('Correo o contraseña incorrectos.');
    if (u.estado !== 'ACTIVO')
      throw new Error(
        `La cuenta está ${u.estado.toLowerCase()}. Comuníquese con el administrador.`
      );
    setIdUsuario(u.id_usuario);
    return u;
  };
  const iniciarSesionCon = (id) => setIdUsuario(id);
  const logout = () => setIdUsuario(null);

  return (
    <AuthContext.Provider value={{ sesion, login, logout, iniciarSesionCon }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
