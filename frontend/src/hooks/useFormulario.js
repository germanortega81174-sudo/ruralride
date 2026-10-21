// Hook para formularios CONTROLADOS: el estado de cada campo vive en React
// y se valida al salir del campo (blur) y al enviar.
import { useState } from 'react'

export function useFormulario(valoresIniciales, validar) {
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nuevo = { ...valores, [name]: type === 'checkbox' ? checked : value }
    setValores(nuevo)
    if (tocados[name]) setErrores(validar(nuevo))
  }

  const handleBlur = (e) => {
    setTocados((t) => ({ ...t, [e.target.name]: true }))
    setErrores(validar(valores))
  }

  const setValor = (name, value) => setValores((v) => ({ ...v, [name]: value }))

  /** Valida todo el formulario; si hay errores pone el foco en el primer campo inválido. */
  const handleSubmit = (alEnviar) => (e) => {
    e.preventDefault()
    const errs = validar(valores)
    setErrores(errs)
    setTocados(Object.keys(valores).reduce((a, k) => ({ ...a, [k]: true }), {}))
    const primero = Object.keys(errs).find((k) => errs[k])
    if (primero) {
      document.getElementById(primero)?.focus()
      return
    }
    alEnviar(valores)
  }

  const reset = () => {
    setValores(valoresIniciales)
    setErrores({})
    setTocados({})
  }

  const error = (name) => (tocados[name] ? errores[name] : '')

  return { valores, errores, handleChange, handleBlur, handleSubmit, setValor, reset, error }
}
