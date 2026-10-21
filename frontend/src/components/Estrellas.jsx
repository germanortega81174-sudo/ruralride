import { IconoEstrella } from './Iconos.jsx'

/** Muestra una calificación de 0 a 5 con texto alternativo. */
export function Estrellas({ valor, total }) {
  return (
    <span className="estrellas" aria-label={`Calificación ${valor.toFixed(1)} de 5${total !== undefined ? `, ${total} opiniones` : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconoEstrella key={n} width={16} height={16} className={n <= Math.round(valor) ? 'estrella--llena' : 'estrella--vacia'} />
      ))}
      <span aria-hidden="true" className="estrellas__num">{valor ? valor.toFixed(1) : 'Nuevo'}{total !== undefined && valor ? ` (${total})` : ''}</span>
    </span>
  )
}

/** Selector de puntuación 1–5 accesible: grupo de botones de opción navegable con teclado. */
export function SelectorEstrellas({ id, valor, onChange, error }) {
  return (
    <fieldset className={`campo selector-estrellas ${error ? 'campo--error' : ''}`} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="campo__etiqueta">Puntuación <span className="campo__req" aria-hidden="true">*</span></legend>
      <div className="selector-estrellas__opciones">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`selector-estrellas__op ${n <= valor ? 'activa' : ''}`}>
            <input type="radio" name={id} id={n === 1 ? id : undefined} value={n} checked={valor === n} onChange={() => onChange(n)} className="sr-only" />
            <IconoEstrella width={30} height={30} />
            <span className="sr-only">{n} {n === 1 ? 'estrella' : 'estrellas'}</span>
          </label>
        ))}
      </div>
      {error && <p id={`${id}-error`} className="campo__error" role="alert">{error}</p>}
    </fieldset>
  )
}
