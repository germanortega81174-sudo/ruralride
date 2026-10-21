const COLORES = {
  APROBADA: 'verde', APROBADO: 'verde', CONFIRMADA: 'verde', ACTIVO: 'verde', ACTIVA: 'verde', COMPLETADA: 'azul', FINALIZADO: 'azul',
  PENDIENTE: 'amarillo', PROGRAMADO: 'amarillo', EN_CURSO: 'azul',
  RECHAZADA: 'rojo', CANCELADA: 'gris', CANCELADO: 'gris', INACTIVO: 'gris', INACTIVA: 'gris', SUSPENDIDO: 'rojo',
}
/** Estado con color y texto (el color nunca es la única señal). */
export default function Insignia({ estado }) {
  const texto = estado.replace('_', ' ').toLowerCase()
  return <span className={`insignia insignia--${COLORES[estado] || 'gris'}`}>{texto}</span>
}
