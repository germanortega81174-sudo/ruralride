import { describe, expect, it } from 'vitest';
import {
  celular,
  correo,
  password,
  placa,
  primeraFalla,
  rango,
  requerido,
} from '@/utils/validaciones.js';

describe('validaciones de formularios', () => {
  it('requerido detecta campos vacíos o con solo espacios', () => {
    expect(requerido('   ', 'El nombre')).toBe('El nombre es obligatorio.');
    expect(requerido('Rosa')).toBe('');
  });

  it('correo exige el formato nombre@dominio', () => {
    expect(correo('carlos.perez@gmail.com')).toBe('');
    expect(correo('carlos.perez@')).not.toBe('');
  });

  it('celular: 10 dígitos que empiezan por 3 (ck_usuario_telefono)', () => {
    expect(celular('3004448899')).toBe('');
    expect(celular('6018887766')).not.toBe('');
    expect(celular('3004448')).not.toBe('');
  });

  it('placa: ABC123 para carro y ABC12D para moto (ck_vehiculo_placa)', () => {
    expect(placa('JHL418')).toBe('');
    expect(placa('LRV12E')).toBe('');
    expect(placa('JH418')).not.toBe('');
  });

  it('contraseña segura: 8+ caracteres con mayúscula, minúscula, número y símbolo', () => {
    expect(password('RuralRide2026*')).toBe('');
    expect(password('ruralride2026')).not.toBe('');
  });

  it('rango y primeraFalla', () => {
    expect(rango('7', 1, 6, 'Los cupos')).toBe('Los cupos debe estar entre 1 y 6.');
    expect(primeraFalla('', 'primero', 'segundo')).toBe('primero');
  });
});
