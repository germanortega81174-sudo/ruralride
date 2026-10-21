import EnvolturaCampo from '@/components/ui/EnvolturaCampo.jsx';
import { idsDescripcion } from '@/utils/accesibilidad.js';

/** Texto largo con contador de caracteres cuando tiene maxLength. */
export default function CampoArea({
  id,
  etiqueta,
  requerido,
  ayuda,
  error,
  form,
  maxLength,
  ...props
}) {
  const totalCaracteres = String(form.valores[id] ?? '').length;
  return (
    <EnvolturaCampo id={id} etiqueta={etiqueta} requerido={requerido} ayuda={ayuda} error={error}>
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
        aria-describedby={idsDescripcion(id, ayuda, error)}
        {...props}
      />
      {maxLength && (
        <span className="campo__contador" aria-live="polite">
          {totalCaracteres}/{maxLength}
        </span>
      )}
    </EnvolturaCampo>
  );
}
