import { useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/DataContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import CampoTexto from '@/components/ui/CampoTexto.jsx';
import CampoSelector from '@/components/ui/CampoSelector.jsx';
import TablaDatos from '@/components/ui/TablaDatos.jsx';
import Insignia from '@/components/ui/Insignia.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import SubmenuConductor from '@/features/viajes/components/SubmenuConductor.jsx';
import * as val from '@/utils/validaciones.js';

const TIPOS = ['AUTOMOVIL', 'CAMPERO', 'CAMIONETA', 'MICROBUS', 'MOTOCICLETA'].map((t) => ({
  valor: t,
  texto: t.charAt(0) + t.slice(1).toLowerCase(),
}));
const INICIAL = {
  placa: '',
  tipo: '',
  marca: '',
  linea: '',
  anio_modelo: '',
  color: '',
  capacidad: '',
};

/** RF02.6 – Gestión de vehículos. */
export default function MisVehiculosPage() {
  const { sesion } = useAuth();
  const { db, registrarVehiculo } = useData();
  const [msg, setMsg] = useState(null);
  const form = useFormulario(INICIAL, (v) => ({
    placa: val.primeraFalla(val.requerido(v.placa, 'La placa'), val.placa(v.placa)),
    tipo: val.requerido(v.tipo, 'El tipo'),
    marca: val.primeraFalla(
      val.requerido(v.marca, 'La marca'),
      val.longitud(v.marca, 2, 40, 'La marca')
    ),
    linea: val.primeraFalla(
      val.requerido(v.linea, 'La línea'),
      val.longitud(v.linea, 1, 40, 'La línea')
    ),
    anio_modelo: val.primeraFalla(
      val.requerido(v.anio_modelo, 'El año'),
      val.rango(v.anio_modelo, 1980, new Date().getFullYear() + 1, 'El año')
    ),
    color: val.primeraFalla(
      val.requerido(v.color, 'El color'),
      val.soloLetras(v.color, 'El color'),
      val.longitud(v.color, 3, 30, 'El color')
    ),
    capacidad: val.primeraFalla(
      val.requerido(v.capacidad, 'La capacidad'),
      val.rango(v.capacidad, 1, v.tipo === 'MOTOCICLETA' ? 1 : 20, 'La capacidad')
    ),
  }));
  const mios = db.vehiculo.filter((x) => x.id_conductor === sesion.conductor.id_conductor);

  const guardar = (v) => {
    try {
      registrarVehiculo(sesion.conductor.id_conductor, {
        ...v,
        marca: v.marca.trim(),
        linea: v.linea.trim(),
        color: v.color.trim(),
        anio_modelo: Number(v.anio_modelo),
        capacidad: Number(v.capacidad),
      });
      setMsg({ tipo: 'exito', texto: `Vehículo ${v.placa} registrado.` });
      form.reset();
    } catch (e) {
      setMsg({ tipo: 'error', texto: e.message });
    }
  };
  // La placa se escribe siempre en mayúsculas y sin espacios
  const cambiarPlaca = (e) =>
    form.handleChange({
      target: { name: 'placa', value: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') },
    });

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina
        titulo="Mis vehículos"
        subtitulo="Registre los vehículos con los que ofrece viajes."
      />
      <SubmenuConductor />
      {msg && (
        <Alerta tipo={msg.tipo} onCerrar={() => setMsg(null)}>
          {msg.texto}
        </Alerta>
      )}
      <div className="rejilla-principal">
        <TablaDatos
          titulo="Vehículos registrados"
          claveFila="id_vehiculo"
          filas={mios}
          columnas={[
            { clave: 'placa', titulo: 'Placa', render: (x) => <strong>{x.placa}</strong> },
            { clave: 'tipo', titulo: 'Tipo', render: (x) => x.tipo.toLowerCase() },
            {
              clave: 'vehiculo',
              titulo: 'Vehículo',
              render: (x) => `${x.marca} ${x.linea} ${x.anio_modelo}`,
            },
            { clave: 'color', titulo: 'Color' },
            { clave: 'capacidad', titulo: 'Puestos' },
            { clave: 'estado', titulo: 'Estado', render: (x) => <Insignia estado={x.estado} /> },
          ]}
        />
        <form
          className="panel"
          onSubmit={form.handleSubmit(guardar)}
          noValidate
          aria-labelledby="titulo-veh"
        >
          <h2 id="titulo-veh" className="h3">
            Registrar vehículo
          </h2>
          <CampoTexto
            id="placa"
            etiqueta="Placa"
            requerido
            maxLength={6}
            ayuda="Formato ABC123 (moto: ABC12D)."
            form={{ ...form, handleChange: cambiarPlaca }}
            error={form.error('placa')}
          />
          <CampoSelector
            id="tipo"
            etiqueta="Tipo"
            requerido
            form={form}
            opciones={TIPOS}
            error={form.error('tipo')}
          />
          <div className="rejilla-2">
            <CampoTexto
              id="marca"
              etiqueta="Marca"
              requerido
              maxLength={40}
              form={form}
              error={form.error('marca')}
            />
            <CampoTexto
              id="linea"
              etiqueta="Línea"
              requerido
              maxLength={40}
              form={form}
              error={form.error('linea')}
            />
            <CampoTexto
              id="anio_modelo"
              etiqueta="Año modelo"
              type="number"
              requerido
              min={1980}
              max={2030}
              form={form}
              error={form.error('anio_modelo')}
            />
            <CampoTexto
              id="color"
              etiqueta="Color"
              requerido
              maxLength={30}
              form={form}
              error={form.error('color')}
            />
          </div>
          <CampoTexto
            id="capacidad"
            etiqueta="Puestos para pasajeros"
            type="number"
            requerido
            min={1}
            max={20}
            form={form}
            error={form.error('capacidad')}
          />
          <button type="submit" className="boton boton--primario boton--bloque">
            Guardar vehículo
          </button>
        </form>
      </div>
    </section>
  );
}
