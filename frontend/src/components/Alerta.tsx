import type { ReactNode } from 'react'
// Mensagem de erro ou de sucesso. tipo: 'erro' | 'sucesso'
interface Props {
  tipo?: 'erro' | 'sucesso'
  children?: ReactNode
}

export default function Alerta({ tipo = 'erro', children }: Props) {
  if (!children) return null
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
