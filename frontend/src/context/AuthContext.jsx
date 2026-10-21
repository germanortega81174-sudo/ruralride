/* eslint-disable react-refresh/only-export-components */
// Sesión simulada: en esta etapa no hay backend, por lo que el inicio de sesión
// se valida contra los datos de prueba. Contraseña de todos los usuarios de prueba: RuralRide2026*
import { createContext, useContext, useMemo, useState } from 'react';
import { useData } from '@/context/DataContext.jsx';

export const PASSWORD_DEMO = 'RuralRide2026*';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { db } = useData();
  const [idUsuario, setIdUsuario] = useState(null);

  const sesion = useMemo(() => {
    if (!idUsuario) return null;
    const usuario = db.usuario.find((u) => u.id_usuario === idUsuario);
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
