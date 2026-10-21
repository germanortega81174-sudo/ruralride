import { useEffect, useRef } from 'react';

/**
 * Ventana de confirmación accesible (elemento <dialog>). Reemplaza a window.confirm,
 * que no se puede personalizar y en algunos celulares se bloquea.
 */
export default function DialogoConfirmacion({
  abierto,
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Volver',
  peligro = false,
  onConfirmar,
  onCancelar,
}) {
  const dialogoRef = useRef(null);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal?.();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogoRef}
      className="dialogo"
      aria-labelledby="dialogo-titulo"
      onCancel={(evento) => {
        evento.preventDefault();
        onCancelar();
      }}
    >
      <h2 id="dialogo-titulo" className="h3">
        {titulo}
      </h2>
      <div className="dialogo__cuerpo">{children}</div>
      <div className="acciones dialogo__acciones">
        <button type="button" className="boton boton--fantasma" onClick={onCancelar} autoFocus>
          {textoCancelar}
        </button>
        <button
          type="button"
          className={`boton ${peligro ? 'boton--peligro' : 'boton--primario'}`}
          onClick={onConfirmar}
        >
          {textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}
