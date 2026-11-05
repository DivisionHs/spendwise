import { useMemo, useState, type ReactNode } from 'react'
import { agruparPor, somar, somarPorMes, ultimosMeses } from '../services/agregar.ts'
import { moeda } from '../services/formatar.ts'
import BarrasHorizontais from './graficos/BarrasHorizontais.tsx'
import Cartao from './graficos/Cartao.tsx'
import GraficoBarras from './graficos/GraficoBarras.tsx'
import SeletorPeriodo from './graficos/SeletorPeriodo.tsx'

// Painel que fica acima da tabela de receitas, despesas ou investimentos:
// métricas, gráfico por mês (com seletor de período) e um ranking ou gráfico lateral.
// Props:
//   itens           lançamentos já carregados da API
//   campoValor      'valor' (receita/despesa) ou 'valorInvestido'
//   nomeSerie       rótulo da série no gráfico (ex.: "Receitas")
//   cor, corClasse  cor hexadecimal e sufixo da classe CSS ('verde' | 'rosa' | 'ambar')
//   textoAgrupar    (item) => texto usado no ranking (descrição ou categoria)
//   tituloRanking   título do ranking lateral
//   lateral         (opcional) nó React que substitui o ranking
//   children        (opcional) conteúdo extra abaixo
interface Props<T> {
  itens: T[]
  campoValor: keyof T
  nomeSerie: string
  cor: string
  corClasse: 'verde' | 'rosa' | 'ambar'
  textoAgrupar: (item: T) => string | undefined
  tituloRanking?: string
  lateral?: ReactNode
  children?: ReactNode
}

export default function PainelLancamentos<T extends { data: string }>({
  itens,
  campoValor,
  nomeSerie,
  cor,
  corClasse,
  textoAgrupar,
  tituloRanking,
  lateral,
  children,
}: Props<T>) {
  const [periodo, setPeriodo] = useState(6)

  const dados = useMemo(() => {
    const meses = ultimosMeses(periodo)
    const porMes = somarPorMes(itens, campoValor)
    const total = somar(itens, campoValor)
    const maior = itens.reduce<(typeof itens)[number] | null>((m, i) => (Number(i[campoValor]) > Number(m?.[campoValor] ?? 0) ? i : m), null)
    return {
      meses,
      valores: { serie: porMes },
      total,
      media: itens.length ? total / itens.length : 0,
      maior,
      ranking: agruparPor(itens, textoAgrupar, campoValor),
    }
  }, [itens, campoValor, periodo, textoAgrupar])

  if (itens.length === 0) return null

  return (
    <>
      <section className="faixa-metricas">
        <div className={`metrica metrica-${corClasse}`}>
          <span>Total</span>
          <strong>{moeda(dados.total)}</strong>
        </div>
        <div className={`metrica metrica-${corClasse}`}>
          <span>Média por lançamento</span>
          <strong>{moeda(dados.media)}</strong>
        </div>
        <div className={`metrica metrica-${corClasse}`}>
          <span>Maior lançamento</span>
          <strong>{moeda(Number(dados.maior?.[campoValor]))}</strong>
        </div>
        <div className={`metrica metrica-${corClasse}`}>
          <span>Lançamentos</span>
          <strong>{itens.length}</strong>
        </div>
      </section>

      <div className="grade-painel">
        <Cartao
          className="largo"
          titulo={`${nomeSerie} por mês`}
          subtitulo="Passe o mouse sobre as barras para ver os valores."
          acao={<SeletorPeriodo valor={periodo} opcoes={[3, 6, 12]} aoMudar={setPeriodo} />}
        >
          <GraficoBarras
            titulo={`${nomeSerie} por mês`}
            meses={dados.meses}
            series={[{ chave: 'serie', rotulo: nomeSerie, cor }]}
            valores={dados.valores}
          />
        </Cartao>

        {lateral ?? (
          <Cartao titulo={tituloRanking ?? ''} subtitulo="Soma de todos os lançamentos">
            <BarrasHorizontais itens={dados.ranking} cor={cor} limite={6} />
          </Cartao>
        )}
      </div>

      {children}
    </>
  )
}
