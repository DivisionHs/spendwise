import type { ItemRanking } from '../../services/agregar.ts'
import { moeda } from '../../services/formatar.ts'

// Ranking em barras horizontais (maiores despesas, investimentos por categoria...).
// Props: itens [{ rotulo, valor }] já ordenados, cor, limite (quantos mostrar)
interface Props {
  itens: ItemRanking[]
  cor?: string
  limite?: number
  vazio?: string
}

export default function BarrasHorizontais({ itens, cor = '#e11d48', limite = 6, vazio = 'Sem dados neste período.' }: Props) {
  const lista = itens.slice(0, limite)
  if (lista.length === 0) return <p className="estado">{vazio}</p>
  const maior = Math.max(...lista.map((i) => i.valor), 1)

  return (
    <ul className="ranking">
      {lista.map((item, i) => (
        <li key={item.rotulo} title={`${item.rotulo}: ${moeda(item.valor)}`}>
          <span className="ranking-rotulo">{item.rotulo}</span>
          <span className="ranking-trilha">
            <span
              className="ranking-barra"
              style={{ width: `${(item.valor / maior) * 100}%`, background: cor, animationDelay: `${i * 60}ms` }}
            />
          </span>
          <span className="ranking-valor">{moeda(item.valor)}</span>
        </li>
      ))}
    </ul>
  )
}
