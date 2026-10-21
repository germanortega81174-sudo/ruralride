import EnvolturaCampo from '@/components/ui/EnvolturaCampo.jsx';
import { idsDescripcion } from '@/utils/accesibilidad.js';

/** Lista desplegable. opciones: [{ valor, texto }]. */
export default function CampoSelector({
  id,
  etiqueta,
  requerido,
  ayuda,
  error,
  form,
  opciones,
  vacio = 'Seleccione…',
  ...props
}) {
  return (
    <EnvolturaCampo id={id} etiqueta={etiqueta} requerido={requerido} ayuda={ayuda} error={error}>
      <select
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
      >
        <option value="">{vacio}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
    </EnvolturaCampo>
  );
}
