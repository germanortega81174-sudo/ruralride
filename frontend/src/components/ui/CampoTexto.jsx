import EnvolturaCampo from '@/components/ui/EnvolturaCampo.jsx';
import { idsDescripcion } from '@/utils/accesibilidad.js';

/** Campo de texto, correo, número, fecha o contraseña conectado a useFormulario. */
export default function CampoTexto({ id, etiqueta, requerido, ayuda, error, form, ...props }) {
  return (
    <EnvolturaCampo id={id} etiqueta={etiqueta} requerido={requerido} ayuda={ayuda} error={error}>
      <input
        id={id}
        name={id}
        className="campo__control"
        value={form.valores[id]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        aria-invalid={!!error}
        aria-required={requerido}
        aria-describedby={idsDescripcion(id, ayuda, error)}
        {...props}
      />
    </EnvolturaCampo>
  );
}
