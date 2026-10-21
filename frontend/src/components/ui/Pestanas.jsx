/**
 * Pestañas accesibles: se cambian con clic o con las flechas izquierda y derecha.
 * pestanas: [{ id, texto }]
 */
export default function Pestanas({ etiqueta, pestanas, activa, onCambiar }) {
  const moverConTeclado = (evento, indice) => {
    if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return;
    const paso = evento.key === 'ArrowRight' ? 1 : -1;
    const siguiente = pestanas[(indice + paso + pestanas.length) % pestanas.length];
    onCambiar(siguiente.id);
    document.getElementById(`tab-${siguiente.id}`)?.focus();
  };

  return (
    <div className="pestanas" role="tablist" aria-label={etiqueta}>
      {pestanas.map((pestana, indice) => {
        const esActiva = pestana.id === activa;
        return (
          <button
            key={pestana.id}
            type="button"
            role="tab"
            id={`tab-${pestana.id}`}
            aria-selected={esActiva}
            aria-controls={`panel-${pestana.id}`}
            tabIndex={esActiva ? 0 : -1}
            className={`pestana ${esActiva ? 'pestana--activa' : ''}`}
            onClick={() => onCambiar(pestana.id)}
            onKeyDown={(evento) => moverConTeclado(evento, indice)}
          >
            {pestana.texto}
          </button>
        );
      })}
    </div>
  );
}
