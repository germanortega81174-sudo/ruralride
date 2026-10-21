// Campos de formulario accesibles y reutilizables: cada uno tiene <label>, mensaje de ayuda
// y mensaje de error asociados con aria-describedby, y marca aria-invalid cuando hay error.

function Envoltura({ id, etiqueta, requerido, ayuda, error, children }) {
  return (
    <div className={`campo ${error ? 'campo--error' : ''}`}>
      <label htmlFor={id} className="campo__etiqueta">
        {etiqueta} {requerido && <span className="campo__req" aria-hidden="true">*</span>}
      </label>
      {children}
      {ayuda && !error && <p id={`${id}-ayuda`} className="campo__ayuda">{ayuda}</p>}
      {error && <p id={`${id}-error`} className="campo__error" role="alert">{error}</p>}
    </div>
  )
}

const describe = (id, ayuda, error) => [error ? `${id}-error` : null, ayuda && !error ? `${id}-ayuda` : null].filter(Boolean).join(' ') || undefined

export function Campo({ id, etiqueta, requerido, ayuda, error, form, ...props }) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} requerido={requerido} ayuda={ayuda} error={error}>
      <input
        id={id}
        name={id}
        className="campo__control"
        value={form.valores[id]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        aria-invalid={!!error}
        aria-required={requerido}
        aria-describedby={describe(id, ayuda, error)}
        {...props}
      />
    </Envoltura>
  )
}

export function Selector({ id, etiqueta, requerido, ayuda, error, form, opciones, vacio = 'Seleccione…', ...props }) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} requerido={requerido} ayuda={ayuda} error={error}>
      <select
        id={id}
        name={id}
        className="campo__control"
        value={form.valores[id]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        aria-invalid={!!error}
        aria-required={requerido}
        aria-describedby={describe(id, ayuda, error)}
        {...props}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>{o.texto}</option>
        ))}
      </select>
    </Envoltura>
  )
}

export function AreaTexto({ id, etiqueta, requerido, ayuda, error, form, maxLength, ...props }) {
  const n = String(form.valores[id] ?? '').length
  return (
    <Envoltura id={id} etiqueta={etiqueta} requerido={requerido} ayuda={ayuda} error={error}>
      <textarea
        id={id}
        name={id}
        className="campo__control"
        rows={3}
        value={form.valores[id]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-required={requerido}
        aria-describedby={describe(id, ayuda, error)}
        {...props}
      />
      {maxLength && <span className="campo__contador" aria-live="polite">{n}/{maxLength}</span>}
    </Envoltura>
  )
}
