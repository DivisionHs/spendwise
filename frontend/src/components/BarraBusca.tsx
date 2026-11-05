import type { ReactNode } from 'react'
// Campo de busca acima das tabelas. Mostra quantos registros passaram pelo filtro.
// children: filtros extras (ex.: um select de categoria) mostrados ao lado.
interface Props {
  valor: string
  aoMudar: (valor: string) => void
  total: number
  exibidos: number
  placeholder?: string
  children?: ReactNode
}

export default function BarraBusca({ valor, aoMudar, total, exibidos, placeholder = 'Buscar...', children }: Props) {
  return (
    <div className="barra-busca">
      <input
        type="search"
        value={valor}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
      />
      {children}
      <span>
        {exibidos === total ? `${total} registros` : `${exibidos} de ${total} registros`}
      </span>
    </div>
  )
}