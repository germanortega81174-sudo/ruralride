import { useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/DataContext.jsx';
import { useFormulario } from '@/hooks/useFormulario.js';
import { Campo, Selector } from '@/components/ui/Campos.jsx';
import TablaDatos from '@/components/ui/TablaDatos.jsx';
import Insignia from '@/components/ui/Insignia.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina.jsx';
import SubmenuConductor from '@/features/viajes/components/SubmenuConductor.jsx';
import * as val from '@/utils/validaciones.js';
import { duracion } from '@/utils/formato.js';

const INICIAL = {
  id_municipio_origen: '',
  id_municipio_destino: '',
  punto_encuentro: '',
  distancia_km: '',
  tiempo_estimado_min: '',
};

/** RF02.1 – Registrar rutas. */
export default function MisRutasPage() {
  const { sesion } = useAuth();
  const { db, municipio, registrarRuta } = useData();
  const [msg, setMsg] = useState('');
  const municipios = db.municipio.map((m) => ({
    valor: String(m.id_municipio),
    texto: `${m.nombre} (${m.departamento})`,
  }));
  const form = useFormulario(INICIAL, (v) => ({
    id_municipio_origen: val.requerido(v.id_municipio_origen, 'El origen'),
    id_municipio_destino: val.primeraFalla(
      val.requerido(v.id_municipio_destino, 'El destino'),
      v.id_municipio_destino && v.id_municipio_destino === v.id_municipio_origen
        ? 'El destino debe ser distinto del origen.'
        : ''
    ),
    punto_encuentro: val.primeraFalla(
      val.requerido(v.punto_encuentro, 'El punto de encuentro'),
      val.longitud(v.punto_encuentro, 5, 150, 'El punto de encuentro')
    ),
    distancia_km: val.primeraFalla(
      val.requerido(v.distancia_km, 'La distancia'),
      val.rango(v.distancia_km, 0.1, 9999, 'La distancia')
    ),
    tiempo_estimado_min: val.primeraFalla(
      val.requerido(v.tiempo_estimado_min, 'El tiempo'),
      val.rango(v.tiempo_estimado_min, 1, 1440, 'El tiempo')
    ),
  }));
  const mias = db.ruta.filter((r) => r.id_conductor === sesion.conductor.id_conductor);

  const guardar = (v) => {
    registrarRuta(sesion.conductor.id_conductor, {
      id_municipio_origen: Number(v.id_municipio_origen),
      id_municipio_destino: Number(v.id_municipio_destino),
      punto_encuentro: v.punto_encuentro.trim(),
      distancia_km: Number(v.distancia_km),
      tiempo_estimado_min: Number(v.tiempo_estimado_min),
    });
    setMsg('Ruta registrada. Ya puede publicar viajes en ella.');
    form.reset();
  };

  return (
    <section className="contenedor seccion">
      <EncabezadoPagina titulo="Mis rutas" subtitulo="Recorridos habituales que usted ofrece." />
      <SubmenuConductor />
      {msg && (
        <Alerta tipo="exito" onCerrar={() => setMsg('')}>
          {msg}
        </Alerta>
      )}
      <div className="rejilla-principal">
        <TablaDatos
          titulo="Rutas registradas"
          claveFila="id_ruta"
          filas={mias}
          columnas={[
            {
              clave: 'trayecto',
              titulo: 'Trayecto',
              render: (r) =>
                `${municipio(r.id_municipio_origen).nombre} → ${municipio(r.id_municipio_destino).nombre}`,
            },
            { clave: 'punto_encuentro', titulo: 'Punto de encuentro' },
            { clave: 'distancia_km', titulo: 'Distancia', render: (r) => `${r.distancia_km} km` },
            { clave: 'tiempo', titulo: 'Duración', render: (r) => duracion(r.tiempo_estimado_min) },
            { clave: 'estado', titulo: 'Estado', render: (r) => <Insignia estado={r.estado} /> },
          ]}
        />
        <form
          className="panel"
          onSubmit={form.handleSubmit(guardar)}
          noValidate
          aria-labelledby="titulo-ruta"
        >
          <h2 id="titulo-ruta" className="h3">
            Registrar ruta
          </h2>
          <Selector
            id="id_municipio_origen"
            etiqueta="Municipio de origen"
            requerido
            form={form}
            opciones={municipios}
            error={form.error('id_municipio_origen')}
          />
          <Selector
            id="id_municipio_destino"
            etiqueta="Municipio de destino"
            requerido
            form={form}
            opciones={municipios}
            error={form.error('id_municipio_destino')}
          />
          <Campo
            id="punto_encuentro"
            etiqueta="Punto de encuentro"
            requerido
            maxLength={150}
            ayuda="Lugar exacto donde recoge a los pasajeros."
            form={form}
            error={form.error('punto_encuentro')}
          />
          <div className="rejilla-2">
            <Campo
              id="distancia_km"
              etiqueta="Distancia (km)"
              type="number"
              step="0.1"
              min={0.1}
              requerido
              form={form}
              error={form.error('distancia_km')}
            />
            <Campo
              id="tiempo_estimado_min"
              etiqueta="Duración (minutos)"
              type="number"
              min={1}
              requerido
              form={form}
              error={form.error('tiempo_estimado_min')}
            />
          </div>
          <button type="submit" className="boton boton--primario boton--bloque">
            Guardar ruta
          </button>
        </form>
      </div>
    </section>
  );
}
