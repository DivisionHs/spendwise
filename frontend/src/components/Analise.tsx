import { useState, type ReactNode } from 'react'
import Icone from './Icone.tsx'

// Cartão "O que os números dizem": um texto gerado pelos dados da página e, opcionalmente,
// um guia recolhível "Como ler esta página" explicando cada cartão e gráfico.
// O botão no canto fecha o cartão; fechado, sobra um botão discreto para abri-lo de novo.
// A escolha fica guardada no navegador e vale para todas as páginas.
// Props: children (o texto), guia (lista de frases explicativas)
interface Props {
  children: ReactNode
  guia?: string[]
}

const CHAVE = 'spendwise.analiseFechada'

export default function Analise({ children, guia }: Props) {
  const [fechado, setFechado] = useState(() => localStorage.getItem(CHAVE) === '1')

  function alternar() {
    setFechado((atual) => {
      localStorage.setItem(CHAVE, atual ? '0' : '1')
      return !atual
    })
  }

  if (fechado) {
    return (
      <div className="historia-fechada">
        <button type="button" className="historia-abrir" onClick={alternar} aria-expanded={false}>
          <Icone nome="info" tamanho={16} />
          O que os números dizem
          <span className="historia-abrir-acao">Mostrar</span>
        </button>
      </div>
    )
  }

  return (
    <section className="historia">
      <button type="button" className="historia-fechar" onClick={alternar} aria-label="Fechar o resumo" title="Fechar" aria-expanded>
        <Icone nome="fechar" tamanho={16} />
      </button>
      <h2>O que os números dizem</h2>
      <p>{children}</p>
      {guia && guia.length > 0 && (
        <details className="guia-leitura">
          <summary>Como ler esta página</summary>
          <ul>
            {guia.map((linha) => (
              <li key={linha}>{linha}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}