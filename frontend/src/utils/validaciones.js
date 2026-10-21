// Validaciones básicas reutilizables (obligatoriedad, formato y longitud).
// Cada función devuelve un mensaje de error o '' si el valor es válido.
// Las reglas coinciden con las restricciones CHECK y NOT NULL de la base de datos.

export const requerido = (v, nombre = 'Este campo') =>
  v === undefined || v === null || String(v).trim() === '' ? `${nombre} es obligatorio.` : '';

export const longitud = (v, min, max, nombre = 'El campo') => {
  const n = String(v ?? '').trim().length;
  if (n && n < min) return `${nombre} debe tener al menos ${min} caracteres.`;
  if (n > max) return `${nombre} admite máximo ${max} caracteres.`;
  return '';
};

export const correo = (v) =>
  v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
    ? 'Escriba un correo válido, por ejemplo nombre@correo.com.'
    : '';

// ck_usuario_telefono: celular colombiano de 10 dígitos que inicia en 3
// Se aceptan también teléfonos fijos de 7 dígitos para las veredas sin señal de celular
export const celular = (v) =>
  v && !/^\d{7,10}$/.test(v) ? 'El teléfono debe tener entre 7 y 10 dígitos.' : '';

export const soloDigitos = (v, min, max, nombre = 'El número') =>
  v && !new RegExp(`^\\d{${min},${max}}$`).test(v)
    ? `${nombre} debe tener entre ${min} y ${max} dígitos.`
    : '';

export const soloLetras = (v, nombre = 'El campo') =>
  v && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/.test(v.trim()) ? `${nombre} solo admite letras.` : '';

// Contraseña segura: 8+ caracteres, mayúscula, minúscula, número y símbolo
export const password = (v) => {
  if (!v) return '';
  if (v.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
  if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v) || !/[^A-Za-z0-9]/.test(v))
    return 'Incluya mayúscula, minúscula, número y un símbolo.';
  return '';
};

// ck_vehiculo_placa: ABC123 (carro) o ABC12D (moto)
export const placa = (v) =>
  v && !/^[A-Z]{3}\d{2}[0-9A-Z]$/.test(v) ? 'Placa inválida. Use el formato ABC123 o ABC12D.' : '';

export const rango = (v, min, max, nombre = 'El valor') => {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return `${nombre} debe ser un número.`;
  if (n < min || n > max) return `${nombre} debe estar entre ${min} y ${max}.`;
  return '';
};

export const fechaFutura = (v) =>
  v && new Date(v) <= new Date() ? 'La fecha y hora deben ser posteriores al momento actual.' : '';

/** Ejecuta varias reglas y devuelve el primer error encontrado. */
export const primeraFalla = (...errores) => errores.find(Boolean) || '';
