import type { ReactNode } from 'react'
// Título da página com subtítulo e, opcionalmente, um botão de ação à direita (children).
interface Props {
  titulo: string
  subtitulo?: string
  children?: ReactNode
}

export default function CabecalhoPagina({ titulo, subtitulo, children }: Props) {
  return (
    <header className="cabecalho-pagina">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {children && <div className="cabecalho-acoes">{children}</div>}
    </header>
  )
}
