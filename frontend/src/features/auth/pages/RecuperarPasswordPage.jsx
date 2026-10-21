import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormulario } from '@/hooks/useFormulario.js';
import { Campo } from '@/components/ui/Campos.jsx';
import Alerta from '@/components/ui/Alerta.jsx';
import { correo, primeraFalla, requerido } from '@/utils/validaciones.js';

export default function RecuperarPasswordPage() {
  const [enviado, setEnviado] = useState('');
  const form = useFormulario({ correo: '' }, (v) => ({
    correo: primeraFalla(requerido(v.correo, 'El correo'), correo(v.correo)),
  }));
  return (
    <section className="contenedor seccion seccion--estrecha">
      <div className="panel">
        <h1>Recuperar contraseña</h1>
        <p className="texto-suave">
          Le enviaremos un enlace válido por 30 minutos para crear una nueva contraseña.
        </p>
        {enviado ? (
          <Alerta tipo="exito" titulo="Revise su correo">
            Si {enviado} está registrado, recibirá el enlace en unos minutos.{' '}
            <Link to="/ingresar">Volver a ingresar</Link>
          </Alerta>
        ) : (
          <form onSubmit={form.handleSubmit((v) => setEnviado(v.correo))} noValidate>
            <Campo
              id="correo"
              etiqueta="Correo electrónico"
              type="email"
              requerido
              autoComplete="email"
              form={form}
              error={form.error('correo')}
            />
            <button type="submit" className="boton boton--primario boton--bloque">
              Enviar enlace
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
