import { useTema } from '../hooks/useTema.ts'
import Icone from './Icone.tsx'

// Botão para alternar entre modo claro e escuro.
// No menu lateral aparece com texto; "flutuante" é a versão só com ícone, usada na tela de login.
export default function BotaoTema({ flutuante = false }: { flutuante?: boolean }) {
  const { tema, alternar } = useTema()
  const escuro = tema === 'escuro'
  const rotulo = escuro ? 'Modo claro' : 'Modo escuro'

  if (flutuante) {
    return (
      <button type="button" className="tema-botao-flutuante" onClick={alternar} aria-label={`Ativar o ${rotulo.toLowerCase()}`} title={rotulo}>
        <Icone nome={escuro ? 'sol' : 'lua'} tamanho={20} />
      </button>
    )
  }
  return (
    <button
      type="button"
      className="botao botao-contorno botao-bloco menu-tema"
      onClick={alternar}
      aria-label={`Ativar o ${rotulo.toLowerCase()}`}
      data-rotulo={rotulo}
    >
      <Icone nome={escuro ? 'sol' : 'lua'} tamanho={18} />
      <span className="menu-texto">{escuro ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}