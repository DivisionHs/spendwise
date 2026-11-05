import { useMemo, useState } from 'react'
import Alerta from '../../components/Alerta.tsx'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import CartaoResumo from '../../components/CartaoResumo.tsx'
import Cartao from '../../components/graficos/Cartao.tsx'
import GraficoArea from '../../components/graficos/GraficoArea.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useFinancas } from '../../hooks/useFinancas.ts'
import { chaveMes, rotuloMes, somar, ultimosMeses } from '../../services/agregar.ts'
import { CATEGORIAS_DESPESA } from '../../services/categorias.ts'
import { moeda } from '../../services/formatar.ts'

const GUIA = [
  'O relatório compara o mês escolhido com os 3 meses anteriores. Escolha outro mês no seletor para ver relatórios antigos.',
  '"Variação" é a diferença percentual do total de gastos em relação ao mês anterior (+ gastou mais, - gastou menos).',
  '"Maior aumento" aponta a categoria que mais subiu em reais em relação ao mês anterior.',
  'O botão "Imprimir ou salvar em PDF" abre a janela de impressão do navegador com este relatório.',
]

const sinal = (n: number) => (n > 0 ? `+${n}%` : `${n}%`)

// Relatório mensal de despesas (US04 da Fase 1): total do mês, variação, categoria com maior aumento
// e comparação com os três meses anteriores em gráfico de linha.
export default function Relatorio() {
  const { usuario } = useAuth()
  const { receitas, despesas, carregando, erro } = useFinancas(usuario.idUsuario)
  const meses = useMemo(() => ultimosMeses(12), [])
  // Começa no último mês completo (o atual ainda está em andamento)
  const [mesEscolhido, setMesEscolhido] = useState(meses[meses.length - 2].chave)

  const relatorio = useMemo(() => {
    const indice = meses.findIndex((m) => m.chave === mesEscolhido)
    const quatro = meses.slice(Math.max(0, indice - 3), indice + 1)
    const gastosPorMes = (chave: string) => despesas.filter((d) => chaveMes(d.data) === chave)
    const pontos = quatro.map((m) => ({ chave: m.chave, rotulo: m.rotulo, valor: somar(gastosPorMes(m.chave), 'valor') }))
    const atual = pontos[pontos.length - 1]
    const anterior = pontos.length > 1 ? pontos[pontos.length - 2] : null

    const porCategoria = CATEGORIAS_DESPESA.map((c) => {
      const valores = quatro.map((m) => somar(gastosPorMes(m.chave).filter((d) => d.categoria === c.valor), 'valor'))
      const ultimo = valores[valores.length - 1]
      const anteriorValor = valores.length > 1 ? valores[valores.length - 2] : 0
      return { ...c, valores, ultimo, aumento: ultimo - anteriorValor }
    })
    const maiorAumento = [...porCategoria].sort((a, b) => b.aumento - a.aumento)[0]
    const receitasDoMes = somar(receitas.filter((r) => chaveMes(r.data) === mesEscolhido), 'valor')
    const variacao = anterior && anterior.valor > 0 ? Math.round(((atual.valor - anterior.valor) / anterior.valor) * 100) : null

    return { quatro, pontos, atual, anterior, porCategoria, maiorAumento, receitasDoMes, variacao }
  }, [meses, mesEscolhido, despesas, receitas])

  const temDados = relatorio.atual.valor > 0 || relatorio.pontos.some((p) => p.valor > 0)

  return (
    <>
      <CabecalhoPagina titulo="Relatório mensal" subtitulo="Seus gastos do mês comparados com os meses anteriores.">
        <select value={mesEscolhido} onChange={(e) => setMesEscolhido(e.target.value)} aria-label="Mês do relatório" className="filtro-select">
          {[...meses].reverse().map((m) => (
            <option key={m.chave} value={m.chave}>
              {m.rotulo}
            </option>
          ))}
        </select>
        <button type="button" className="botao botao-contorno" onClick={() => window.print()}>
          Imprimir ou salvar em PDF
        </button>
      </CabecalhoPagina>

      {carregando && <p className="estado">Carregando...</p>}
      <Alerta tipo="erro">{erro}</Alerta>

      {!carregando && !erro && (
        <>
          <Analise guia={GUIA}>
            {temDados ? (
              <>
                Em <strong>{rotuloMes(mesEscolhido)}</strong> você gastou <strong>{moeda(relatorio.atual.valor)}</strong>
                {relatorio.variacao !== null && relatorio.anterior && (
                  <>
                    , {relatorio.variacao >= 0 ? 'uma alta' : 'uma queda'} de <strong>{Math.abs(relatorio.variacao)}%</strong> sobre{' '}
                    {relatorio.anterior.rotulo} ({moeda(relatorio.anterior.valor)})
                  </>
                )}
                .{' '}
                {relatorio.maiorAumento.aumento > 0 && (
                  <>
                    A categoria que mais subiu foi <strong>{relatorio.maiorAumento.rotulo}</strong> (+{moeda(relatorio.maiorAumento.aumento)}).{' '}
                  </>
                )}
                {relatorio.receitasDoMes > 0 && (
                  <>
                    As receitas do mês foram {moeda(relatorio.receitasDoMes)}, o que deixou {moeda(relatorio.receitasDoMes - relatorio.atual.valor)} depois das despesas.
                  </>
                )}
              </>
            ) : (
              <>Não há despesas neste período para gerar o relatório.</>
            )}
          </Analise>

          <section className="grade-cartoes">
            <CartaoResumo titulo="Total de gastos" valor={moeda(relatorio.atual.valor)} cor="rosa" detalhe={rotuloMes(mesEscolhido)} />
            <CartaoResumo
              titulo="Variação"
              valor={relatorio.variacao === null ? '-' : sinal(relatorio.variacao)}
              cor={relatorio.variacao !== null && relatorio.variacao > 0 ? 'rosa' : 'verde'}
              detalhe={relatorio.anterior ? `Em relação a ${relatorio.anterior.rotulo}` : 'Sem mês anterior'}
            />
            <CartaoResumo
              titulo="Maior aumento"
              valor={relatorio.maiorAumento.aumento > 0 ? relatorio.maiorAumento.rotulo : 'Nenhum'}
              cor="ambar"
              detalhe={relatorio.maiorAumento.aumento > 0 ? `+${moeda(relatorio.maiorAumento.aumento)} no mês` : 'Nenhuma categoria subiu'}
            />
            <CartaoResumo titulo="Receitas do mês" valor={moeda(relatorio.receitasDoMes)} cor="verde" detalhe={rotuloMes(mesEscolhido)} />
          </section>

          <Cartao className="bloco" titulo="Comparação com os 3 meses anteriores" subtitulo="Total de despesas por mês">
            <GraficoArea titulo="Total de despesas dos últimos quatro meses" pontos={relatorio.pontos} cor="#e11d48" rotuloValor="Despesas" />
          </Cartao>

          <Cartao className="bloco" titulo="Despesas por categoria" subtitulo={`Do mês ${rotuloMes(relatorio.quatro[0].chave)} ao mês ${rotuloMes(mesEscolhido)}`}>
            <div className="tabela-caixa">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    {relatorio.quatro.map((m) => (
                      <th key={m.chave}>{m.rotulo}</th>
                    ))}
                    <th>Variação no mês</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.porCategoria.map((c) => (
                    <tr key={c.valor}>
                      <td>
                        <span className="cartao-categoria">
                          <span className="ponto" style={{ background: c.cor }} />
                          {c.rotulo}
                        </span>
                      </td>
                      {c.valores.map((v, i) => (
                        <td key={relatorio.quatro[i].chave}>{moeda(v)}</td>
                      ))}
                      <td>
                        <span className={c.aumento > 0 ? 'celula-valor-rosa' : c.aumento < 0 ? 'celula-valor-verde' : ''}>
                          {c.aumento > 0 ? '+' : c.aumento < 0 ? '-' : ''} {moeda(Math.abs(c.aumento))}
                        </span>
                      </td>
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
