/**
 * Estructura común de un campo de formulario: etiqueta, control, ayuda y error.
 * La usan CampoTexto, CampoSelector y CampoArea para que todos se vean y se anuncien igual.
 */
export default function EnvolturaCampo({ id, etiqueta, requerido, ayuda, error, children }) {
  return (
    <div className={`campo ${error ? 'campo--error' : ''}`}>
      <label htmlFor={id} className="campo__etiqueta">
        {etiqueta}{' '}
        {requerido && (
          <span className="campo__req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="campo__ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="campo__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
