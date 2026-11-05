import { useMemo, useState } from 'react'
import Alerta from '../../components/Alerta.tsx'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import CartaoResumo from '../../components/CartaoResumo.tsx'
import Cartao from '../../components/graficos/Cartao.tsx'
import GraficoBarras from '../../components/graficos/GraficoBarras.tsx'
import GraficoDonut from '../../components/graficos/GraficoDonut.tsx'
import SeletorPeriodo from '../../components/graficos/SeletorPeriodo.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useFinancas } from '../../hooks/useFinancas.ts'
import { chaveMes, filtrarPorMeses, somar, ultimosMeses } from '../../services/agregar.ts'
import { CATEGORIAS_DESPESA, corCategoria, rotuloCategoria } from '../../services/categorias.ts'
import { moeda } from '../../services/formatar.ts'

const GUIA = [
  'Os cartões resumem o período escolhido: receitas, despesas, o que sobrou e o gasto do mês atual.',
  'A rosca mostra a parte de cada categoria no total de despesas do período. Passe o mouse numa fatia para ver o valor.',
  'O gráfico de barras compara, mês a mês, as quatro categorias em que você mais gastou. Clique na legenda para esconder uma categoria.',
]

// Centro de Análise (tela da Fase 2): onde o dinheiro vai, por categoria, e como isso evolui mês a mês (US02).
export default function CentroAnalise() {
  const { usuario } = useAuth()
  const { receitas, despesas, carregando, erro } = useFinancas(usuario.idUsuario)
  const [periodo, setPeriodo] = useState(6)

  const painel = useMemo(() => {
    const meses = ultimosMeses(periodo)
    const chaves = meses.map((m) => m.chave)
    const rec = filtrarPorMeses(receitas, chaves)
    const desp = filtrarPorMeses(despesas, chaves)
    const totalDespesas = somar(desp, 'valor')

    const porCategoria = CATEGORIAS_DESPESA.map((c) => ({
      rotulo: c.rotulo,
      valor: somar(desp.filter((d) => d.categoria === c.valor), 'valor'),
      cor: c.cor,
      chave: c.valor,
    })).sort((a, b) => b.valor - a.valor)

    const principais = porCategoria.filter((c) => c.valor > 0).slice(0, 4)
    const valores: Record<string, Record<string, number>> = {}
    for (const c of principais) {
      valores[c.chave] = {}
      for (const d of desp.filter((x) => x.categoria === c.chave)) {
        const mes = chaveMes(d.data)
        valores[c.chave][mes] = (valores[c.chave][mes] ?? 0) + Number(d.valor)
      }
    }

    const mesAtual = chaves[chaves.length - 1]
    return {
      meses,
      totalReceitas: somar(rec, 'valor'),
      totalDespesas,
      gastoDoMes: somar(despesas.filter((d) => chaveMes(d.data) === mesAtual), 'valor'),
      porCategoria,
      series: principais.map((c) => ({ chave: c.chave, rotulo: c.rotulo, cor: corCategoria(c.chave) })),
      valores,
    }
  }, [receitas, despesas, periodo])

  const sobrou = painel.totalReceitas - painel.totalDespesas
  const maior = painel.porCategoria[0]

  return (
    <>
      <CabecalhoPagina titulo="Centro de Análise" subtitulo="Para onde o seu dinheiro vai e como isso muda no tempo.">
        <SeletorPeriodo valor={periodo} opcoes={[3, 6, 12]} aoMudar={setPeriodo} />
      </CabecalhoPagina>

      {carregando && <p className="estado">Carregando...</p>}
      <Alerta tipo="erro">{erro}</Alerta>

      {!carregando && !erro && (
        <>
          <Analise guia={GUIA}>
            {painel.totalDespesas > 0 ? (
              <>
                Nos últimos {periodo} meses, suas despesas somaram <strong>{moeda(painel.totalDespesas)}</strong>.{' '}
                <strong>{maior.rotulo}</strong> é a categoria que mais pesa, com{' '}
                <strong>{Math.round((maior.valor / painel.totalDespesas) * 100)}%</strong> ({moeda(maior.valor)}).{' '}
                {sobrou >= 0 ? (
                  <>Depois das despesas, sobraram <strong>{moeda(sobrou)}</strong> da renda.</>
                ) : (
                  <>As despesas passaram da renda em <strong>{moeda(-sobrou)}</strong>.</>
                )}
              </>
            ) : (
              <>Ainda não há despesas neste período.</>
            )}
          </Analise>

          <section className="grade-cartoes">
            <CartaoResumo titulo="Receitas" valor={moeda(painel.totalReceitas)} cor="verde" detalhe={`Nos últimos ${periodo} meses`} />
            <CartaoResumo titulo="Despesas" valor={moeda(painel.totalDespesas)} cor="rosa" detalhe={`Nos últimos ${periodo} meses`} />
            <CartaoResumo titulo={sobrou >= 0 ? 'Sobrou' : 'Faltou'} valor={moeda(Math.abs(sobrou))} cor="azul" detalhe="Receitas menos despesas" />
            <CartaoResumo titulo="Gasto do mês" valor={moeda(painel.gastoDoMes)} cor="ambar" detalhe="Mês atual, até hoje" />
          </section>

          <div className="grade-painel">
            <Cartao titulo="Distribuição por categoria" subtitulo="Gastos do período por categoria">
              <GraficoDonut
                titulo="Distribuição das despesas por categoria"
                rotuloCentro="Total"
                valorCentro={moeda(painel.totalDespesas)}
                segmentos={painel.porCategoria.filter((c) => c.valor > 0)}
              />
            </Cartao>
            <Cartao className="largo" titulo="Evolução mensal por categoria" subtitulo="As quatro categorias em que você mais gastou">
              {painel.series.length > 0 ? (
                <GraficoBarras
                  titulo="Despesas por mês nas principais categorias"
                  meses={painel.meses}
                  series={painel.series}
                  valores={painel.valores}
                />
              ) : (
                <p className="estado">Sem despesas no período.</p>
              )}
            </Cartao>
          </div>

          <Cartao className="bloco" titulo="Resumo por categoria" subtitulo={`Totais dos últimos ${periodo} meses`}>
            <div className="tabela-caixa">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Total gasto</th>
                    <th>% das despesas</th>
                  </tr>
                </thead>
                <tbody>
                  {painel.porCategoria.map((c) => (
                    <tr key={c.chave}>
                      <td>
                        <span className="cartao-categoria">
                          <span className="ponto" style={{ background: c.cor }} />
                          {rotuloCategoria(c.chave)}
                        </span>
                      </td>
                      <td>{moeda(c.valor)}</td>
                      <td>{painel.totalDespesas > 0 ? `${Math.round((c.valor / painel.totalDespesas) * 1000) / 10}%` : '0%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Cartao>
        </>
      )}
    </>
  )
}
