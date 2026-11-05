import { useState } from 'react'
import { moeda } from '../../services/formatar.ts'

const RAIO = 70
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

// Gráfico de rosca. Passar o mouse num trecho (ou na legenda) mostra o valor e a parte do total no centro.
// Props:
//   segmentos     [{ rotulo, valor, cor }]
//   rotuloCentro  texto pequeno do centro quando nada está em foco (ex.: "Renda do período")
//   valorCentro   valor mostrado no centro quando nada está em foco
export interface SegmentoDonut {
  rotulo: string
  valor: number
  cor: string
}

interface Props {
  segmentos: SegmentoDonut[]
  rotuloCentro?: string
  valorCentro?: string
  titulo: string
}

export default function GraficoDonut({ segmentos, rotuloCentro, valorCentro, titulo }: Props) {
  const [foco, setFoco] = useState<number | null>(null)

  const positivos = segmentos.filter((s) => s.valor > 0)
  const total = positivos.reduce((soma, s) => soma + s.valor, 0)
  let acumulado = 0

  const emFoco = foco !== null ? segmentos[foco] : null
  const percentual = (valor: number) => (total > 0 ? Math.round((valor / total) * 1000) / 10 : 0)

  return (
    <div className="donut">
      <svg viewBox="0 0 200 200" role="img" aria-label={titulo} className="donut-svg">
        <circle cx="100" cy="100" r={RAIO} fill="none" stroke="#e2e8f0" strokeWidth="26" />
        {total > 0 &&
          segmentos.map((s, i) => {
            if (s.valor <= 0) return null
            const comprimento = (s.valor / total) * CIRCUNFERENCIA
            const lacuna = positivos.length > 1 ? 2.5 : 0
            const inicio = acumulado
            acumulado += comprimento
            return (
              <circle
                key={s.rotulo}
                cx="100"
                cy="100"
                r={RAIO}
                fill="none"
                stroke={s.cor}
                strokeWidth={foco === i ? 32 : 26}
                strokeDasharray={`${Math.max(0, comprimento - lacuna)} ${CIRCUNFERENCIA - Math.max(0, comprimento - lacuna)}`}
                strokeDashoffset={-inicio}
                transform="rotate(-90 100 100)"
                className="donut-trecho"
                opacity={foco !== null && foco !== i ? 0.4 : 1}
                onMouseEnter={() => setFoco(i)}
                onMouseLeave={() => setFoco(null)}
              />
            )
          })}
        <text x="100" y="92" className="donut-rotulo">
          {emFoco ? emFoco.rotulo : (rotuloCentro ?? '')}
        </text>
        <text x="100" y="114" className="donut-valor">
          {emFoco ? `${percentual(emFoco.valor)}%` : (valorCentro ?? (total > 0 ? moeda(total) : 'Sem dados'))}
        </text>
        {emFoco && (
          <text x="100" y="132" className="donut-rotulo">
            {moeda(emFoco.valor)}
          </text>
        )}
      </svg>

      <ul className="donut-legenda">
        {segmentos.map((s, i) => (
          <li
            key={s.rotulo}
            className={foco === i ? 'ativo' : undefined}
            onMouseEnter={() => setFoco(i)}
            onMouseLeave={() => setFoco(null)}
          >
            <span className="ponto" style={{ background: s.cor }} />
            <span className="donut-legenda-nome">{s.rotulo}</span>
            <span className="donut-legenda-valor">{percentual(s.valor)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
