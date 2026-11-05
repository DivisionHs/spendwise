import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

// Janela (pop-up) que abre por cima da lista para incluir ou editar um registro.
// É renderizada pela rota filha (/receitas/novo, /receitas/:id/editar), então a lista continua
// visível e atrás dela, e o endereço continua funcionando se for aberto direto.
// Props: titulo, rotaVoltar (para onde ir ao fechar), children (o formulário)
interface Props {
  titulo: string
  rotaVoltar: string
  children: ReactNode
}

export default function JanelaFormulario({ titulo, rotaVoltar, children }: Props) {
  const navegar = useNavigate()

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      // Se a confirmação está aberta, o Esc é dela, não da janela
      if (evento.key === 'Escape' && !document.querySelector('.modal-fundo.confirmacao')) {
        navegar(rotaVoltar)
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [navegar, rotaVoltar])

  return (
    <div className="janela-fundo">
      <div className="janela" role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="janela-topo">
          <h2>{titulo}</h2>
          <button type="button" className="janela-fechar" aria-label="Fechar" onClick={() => navegar(rotaVoltar)}>
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
