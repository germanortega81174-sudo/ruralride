/** Ids de los mensajes de ayuda o error asociados a un control, para aria-describedby. */
export const idsDescripcion = (id, ayuda, error) =>
  [error ? `${id}-error` : null, ayuda && !error ? `${id}-ayuda` : null]
    .filter(Boolean)
    .join(' ') || undefined;
