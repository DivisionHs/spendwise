import type { ReactNode } from 'react'
// Moldura de um gráfico: título, subtítulo e conteúdo. `acao` fica no canto direito do título.
interface Props {
  titulo: string
  subtitulo?: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}

export default function Cartao({ titulo, subtitulo, acao, children, className = '' }: Props) {
  return (
    <section className={`painel ${className}`}>
      <header className="painel-topo">
        <div>
          <h2>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        {acao}
      </header>
      {children}
    </section>
  )
}
