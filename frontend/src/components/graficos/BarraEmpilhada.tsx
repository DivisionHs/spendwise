import { moeda } from '../../services/formatar.ts'

// Uma barra única dividida em partes (ex.: carteira por nível de risco).
// Props: segmentos [{ rotulo, valor, cor }]
interface Props {
  segmentos: { rotulo: string; valor: number; cor: string }[]
  vazio?: string
}

export default function BarraEmpilhada({ segmentos, vazio = 'Sem dados.' }: Props) {
  const total = segmentos.reduce((soma, s) => soma + s.valor, 0)
  if (total <= 0) return <p className="estado">{vazio}</p>

  return (
    <div className="empilhada">
      <div className="empilhada-barra" role="img" aria-label="Distribuição por nível de risco">
        {segmentos
          .filter((s) => s.valor > 0)
          .map((s) => (
            <span
              key={s.rotulo}
              className="empilhada-parte"
              style={{ width: `${(s.valor / total) * 100}%`, background: s.cor }}
              title={`${s.rotulo}: ${moeda(s.valor)} (${Math.round((s.valor / total) * 100)}%)`}
            >
              {s.valor / total >= 0.12 ? `${Math.round((s.valor / total) * 100)}%` : ''}
            </span>
          ))}
      </div>
      <ul className="empilhada-legenda">
        {segmentos.map((s) => (
          <li key={s.rotulo}>
            <span className="ponto" style={{ background: s.cor }} />
            {s.rotulo}: <strong>{moeda(s.valor)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
