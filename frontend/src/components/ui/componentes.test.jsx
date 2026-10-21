// Pruebas de componentes reutilizables: se renderizan como los ve el usuario.
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CampoTexto from '@/components/ui/CampoTexto.jsx';
import Pestanas from '@/components/ui/Pestanas.jsx';
import Migas from '@/components/ui/Migas.jsx';
import TablaDatos from '@/components/ui/TablaDatos.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import { correo, primeraFalla, requerido } from '@/utils/validaciones.js';

function FormularioPrueba({ onEnviar }) {
  const form = useFormulario({ correo: '' }, (v) => ({
    correo: primeraFalla(requerido(v.correo, 'El correo'), correo(v.correo)),
  }));
  return (
    <form onSubmit={form.handleSubmit(onEnviar)} noValidate>
      <CampoTexto
        id="correo"
        etiqueta="Correo"
        requerido
        form={form}
        error={form.error('correo')}
      />
      <button type="submit">Enviar</button>
    </form>
  );
}

describe('CampoTexto + useFormulario', () => {
  it('muestra el error, marca el campo inválido y no envía', async () => {
    const onEnviar = vi.fn();
    render(<FormularioPrueba onEnviar={onEnviar} />);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    const campo = screen.getByLabelText(/Correo/);
    expect(screen.getByRole('alert')).toHaveTextContent('El correo es obligatorio.');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveFocus();
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it('envía cuando el dato es válido', async () => {
    const onEnviar = vi.fn();
    render(<FormularioPrueba onEnviar={onEnviar} />);
    await userEvent.type(screen.getByLabelText(/Correo/), 'carlos.perez@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onEnviar).toHaveBeenCalledWith({ correo: 'carlos.perez@gmail.com' });
  });
});

function PestanasPrueba() {
  const [activa, setActiva] = useState('a');
  return (
    <Pestanas
      etiqueta="Prueba"
      pestanas={[
        { id: 'a', texto: 'Solicitudes' },
        { id: 'b', texto: 'Reservas' },
      ]}
      activa={activa}
      onCambiar={setActiva}
    />
  );
}

describe('Pestanas', () => {
  it('cambia de pestaña con la flecha derecha', async () => {
    render(<PestanasPrueba />);
    await userEvent.click(screen.getByRole('tab', { name: 'Solicitudes' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Reservas' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Migas y TablaDatos', () => {
  it('Migas marca la página actual', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Migas elementos={[{ texto: 'Buscar viajes', to: '/viajes' }, { texto: 'Viaje 5' }]} />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Buscar viajes' })).toHaveAttribute('href', '/viajes');
    expect(screen.getByText('Viaje 5')).toHaveAttribute('aria-current', 'page');
  });

  it('TablaDatos muestra el mensaje vacío cuando no hay filas', () => {
    render(<TablaDatos columnas={[]} filas={[]} claveFila="id" vacio="No tiene solicitudes." />);
    expect(screen.getByRole('status')).toHaveTextContent('No tiene solicitudes.');
  });
});
