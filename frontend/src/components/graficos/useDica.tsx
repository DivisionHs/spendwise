import { useRef, useState, type MouseEvent, type ReactNode } from 'react'

// Balão de informação que acompanha o mouse dentro de um gráfico.
// Uso: const { ref, mostrar, esconder, elemento } = useDica()
//   <div ref={ref} className="grafico-caixa"> ... onMouseMove={(e) => mostrar(e, <b>texto</b>)} ... {elemento} </div>
export function useDica() {
  const ref = useRef<HTMLDivElement>(null)
  const [dica, setDica] = useState<{ x: number; y: number; aEsquerda: boolean; conteudo: ReactNode } | null>(null)

  function mostrar(evento: MouseEvent, conteudo: ReactNode) {
    const caixa = ref.current?.getBoundingClientRect()
    if (!caixa) return
    setDica({
      x: evento.clientX - caixa.left,
      y: evento.clientY - caixa.top,
      aEsquerda: evento.clientX - caixa.left > caixa.width * 0.6,
      conteudo,
    })
  }

  function esconder() {
    setDica(null)
  }

  const elemento = dica ? (
    <div
      className={dica.aEsquerda ? 'dica dica-esquerda' : 'dica'}
      style={{ left: dica.x, top: dica.y }}
      role="status"
    >
      {dica.conteudo}
    </div>
  ) : null

  return { ref, mostrar, esconder, elemento }
}
