export const pesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export const fechaHora = (iso) =>
  new Date(iso).toLocaleString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

// Las fechas sin hora (AAAA-MM-DD) se interpretan en hora local para evitar el desfase de zona horaria
const aFecha = (iso) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)

export const fecha = (iso) => (iso ? aFecha(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

export const duracion = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ''}` : `${min} min`)
