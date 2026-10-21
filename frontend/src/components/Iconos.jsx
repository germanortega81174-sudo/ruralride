// Iconos SVG en línea. Son decorativos (aria-hidden); el texto acompañante da el significado.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' }
export const IconoCarro = (p) => (<svg {...base} {...p}><path d="M5 17h14M3 13l2-6h14l2 6v4H3z" /><circle cx="7.5" cy="17" r="1.8" /><circle cx="16.5" cy="17" r="1.8" /></svg>)
export const IconoUbicacion = (p) => (<svg {...base} {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>)
export const IconoReloj = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>)
export const IconoAsiento = (p) => (<svg {...base} {...p}><path d="M7 4v9h10M7 13l-1 7M17 13v7M10 4h0" /></svg>)
export const IconoEscudo = (p) => (<svg {...base} {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>)
export const IconoEstrella = (p) => (<svg {...base} {...p}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>)
export const IconoMenu = (p) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>)
export const IconoCerrar = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>)
export const IconoFlecha = (p) => (<svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
export const IconoBuscar = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>)
export const IconoUsuario = (p) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>)
