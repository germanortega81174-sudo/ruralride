// Guarda los datos del prototipo en el navegador para que no se pierdan al recargar la página.
// Si el almacenamiento no está disponible (modo privado o bloqueado), se usan los datos de prueba.
import datosPrueba from '@/data/datosPrueba.json';

const CLAVE = 'ruralride:datos:v1';

export function cargarDatos() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? JSON.parse(guardado) : structuredClone(datosPrueba);
  } catch {
    return structuredClone(datosPrueba);
  }
}

export function guardarDatos(datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento disponible: los cambios duran solo mientras la página esté abierta
  }
}

export function borrarDatosGuardados() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // nada que borrar
  }
  return structuredClone(datosPrueba);
}
