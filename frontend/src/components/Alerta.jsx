/** Mensaje de estado. tipo: exito | error | info | aviso. Se anuncia a lectores de pantalla. */
export default function Alerta({ tipo = 'info', titulo, children, onCerrar }) {
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <div>
        {titulo && <strong className="alerta__titulo">{titulo}</strong>}
        <div>{children}</div>
      </div>
      {onCerrar && (
        <button className="alerta__cerrar" onClick={onCerrar} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}
