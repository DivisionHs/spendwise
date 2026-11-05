import { useId, useState, type MouseEvent } from 'react'
import { escalaEixo, moedaCurta } from '../../services/agregar.ts'
import { moeda } from '../../services/formatar.ts'
import { useDica } from './useDica.tsx'

const L = 680
const A = 250
const MARGEM = { esq: 52, dir: 18, topo: 14, base: 30 }

// Linha com área preenchida (usada para o saldo acumulado).
// Passar o mouse mostra uma guia vertical e o valor do mês mais próximo; clicar seleciona o mês.
// Props:
//   pontos        [{ chave, rotulo, valor }]
//   cor           cor da linha
//   rotuloValor   texto no balão (ex.: "Saldo acumulado")
//   selecionado / aoSelecionar  como em GraficoBarras
export interface PontoLinha {
  chave: string
  rotulo: string
  valor: number
}

interface Props {
  pontos: PontoLinha[]
  cor?: string
  rotuloValor?: string
  selecionado?: string | null
  aoSelecionar?: (chave: string | null) => void
  titulo: string
}

export default function GraficoArea({ pontos, cor = '#2563eb', rotuloValor = 'Valor', selecionado = null, aoSelecionar, titulo }: Props) {
  const idGradiente = useId()
  const [indice, setIndice] = useState<number | null>(null)
  const dica = useDica()

  const valores = pontos.map((p) => p.valor)
  const minimo = Math.min(0, ...valores)
  const maximo = Math.max(0, ...valores)
  // Limites "redondos" do eixo: o teto acima do maior valor e, se houver saldo negativo, o piso abaixo do menor
  const base = minimo < 0 ? -escalaEixo(-minimo).max : 0
  const topo = maximo > 0 ? escalaEixo(maximo).max : 1
  const faixa = topo - base

  const larguraUtil = L - MARGEM.esq - MARGEM.dir
  const alturaUtil = A - MARGEM.topo - MARGEM.base
  const xDe = (i: number) => MARGEM.esq + (pontos.length === 1 ? larguraUtil / 2 : (i / (pontos.length - 1)) * larguraUtil)
  const yDe = (valor: number) => MARGEM.topo + alturaUtil - ((valor - base) / faixa) * alturaUtil

  const linha = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${xDe(i)},${yDe(p.valor)}`).join(' ')
  const yZero = yDe(0)
  const area = `${linha} L${xDe(pontos.length - 1)},${yZero} L${xDe(0)},${yZero} Z`

  const passos = []
  const nPassos = 4
  for (let k = 0; k <= nPassos; k++) passos.push(base + (faixa / nPassos) * k)

  function aoMover(evento: MouseEvent<SVGSVGElement>) {
    const svg = evento.currentTarget
    const caixa = svg.getBoundingClientRect()
    const xSvg = ((evento.clientX - caixa.left) / caixa.width) * L
    let melhor = 0
    let menor = Infinity
    pontos.forEach((_, i) => {
      const dist = Math.abs(xDe(i) - xSvg)
      if (dist < menor) {
        menor = dist
        melhor = i
      }
    })
    setIndice(melhor)
    const p = pontos[melhor]
    dica.mostrar(
      evento,
      <>
        <strong>{p.rotulo}</strong>
        <div className="dica-linha">
          {rotuloValor}: <b>{moeda(p.valor)}</b>
        </div>
        {aoSelecionar && <small>Clique para focar neste mês</small>}
      </>,
    )
  }

  function sair() {
    setIndice(null)
    dica.esconder()
  }

  return (
    <div className="grafico">
      <div className="grafico-caixa" ref={dica.ref}>
        <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={titulo} onMouseMove={aoMover} onMouseLeave={sair}>
          <defs>
            <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={cor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {passos.map((passo) => (
            <g key={passo}>
              <line x1={MARGEM.esq} x2={L - MARGEM.dir} y1={yDe(passo)} y2={yDe(passo)} className="grade" />
              <text x={MARGEM.esq - 8} y={yDe(passo) + 4} className="eixo eixo-y">
                {moedaCurta(passo)}
              </text>
            </g>
          ))}
          {minimo < 0 && <line x1={MARGEM.esq} x2={L - MARGEM.dir} y1={yZero} y2={yZero} className="linha-zero" />}

          <path d={area} fill={`url(#${idGradiente})`} className="area-preenchida" />
          <path d={linha} fill="none" stroke={cor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="linha-desenhada" />

          {pontos.map((p, i) => (
            <g key={p.chave}>
              <text x={xDe(i)} y={A - 8} className={selecionado === p.chave ? 'eixo eixo-x ativo' : 'eixo eixo-x'}>
                {p.rotulo}
              </text>
              <circle
                cx={xDe(i)}
                cy={yDe(p.valor)}
                r={indice === i || selecionado === p.chave ? 6 : 3.5}
                fill="#fff"
                stroke={cor}
                strokeWidth="2.5"
                className="ponto-linha"
              />
            </g>
          ))}

          {indice !== null && (
            <line x1={xDe(indice)} x2={xDe(indice)} y1={MARGEM.topo} y2={A - MARGEM.base} className="guia" />
          )}
          <rect
            x={MARGEM.esq}
            y={MARGEM.topo}
            width={larguraUtil}
            height={alturaUtil + MARGEM.base}
            fill="transparent"
            className={aoSelecionar ? 'area-clicavel' : undefined}
            onClick={() => indice !== null && aoSelecionar?.(selecionado === pontos[indice].chave ? null : pontos[indice].chave)}
          />
        </svg>
        {dica.elemento}
      </div>
    </div>
  )
}
