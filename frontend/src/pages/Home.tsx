import { useMemo, useState } from 'react'
import Alerta from '../components/Alerta.tsx'
import Analise from '../components/Analise.tsx'
import CabecalhoPagina from '../components/CabecalhoPagina.tsx'
import CartaoResumo from '../components/CartaoResumo.tsx'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais.tsx'
import Cartao from '../components/graficos/Cartao.tsx'
import GraficoArea from '../components/graficos/GraficoArea.tsx'
import GraficoBarras from '../components/graficos/GraficoBarras.tsx'
import GraficoDonut from '../components/graficos/GraficoDonut.tsx'
import SeletorPeriodo from '../components/graficos/SeletorPeriodo.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { useFinancas } from '../hooks/useFinancas.ts'
import { useLista } from '../hooks/useLista.ts'
import { resumoApi } from '../services/api.ts'
import { agruparPor, chaveMes, filtrarPorMeses, rotuloMes, somar, somarPorMes, ultimosMeses } from '../services/agregar.ts'
import { moeda } from '../services/formatar.ts'

const COR_RECEITA = '#059669'
const COR_DESPESA = '#e11d48'
const COR_INVESTIMENTO = '#d97706'
const COR_SALDO = '#2563eb'

const SERIES = [
  { chave: 'receitas', rotulo: 'Receitas', cor: COR_RECEITA },
  { chave: 'despesas', rotulo: 'Despesas', cor: COR_DESPESA },
  { chave: 'investido', rotulo: 'Investido', cor: COR_INVESTIMENTO },
]

const GUIA_INICIO = [
  'Os cartões somam o período escolhido no alto da página (3, 6 ou 12 meses). "Sobrou" é o que restou das receitas depois de descontar despesas e investimentos.',
  'O gráfico de barras compara, mês a mês, o que entrou, o que saiu e o que foi investido. Clique em um mês para focar nele: os cartões, esta análise, a rosca e o ranking passam a mostrar só aquele mês.',
  'A rosca mostra como a renda foi dividida entre despesas, investimentos e o que sobrou. Passe o mouse em uma fatia para ver o valor.',
  'O saldo acumulado mostra quanto você tinha ao fim de cada mês. O mês atual ainda está em andamento, por isso costuma parecer mais alto.',
  'O ranking lista onde mais saiu dinheiro, somando as despesas de mesma descrição.',
]

const pct = (parte: number, todo: number) => (todo > 0 ? Math.round((parte / todo) * 100) : 0)

// Página inicial: um painel que conta a história do dinheiro do usuário.
// Tudo é interativo: o período (3, 6 ou 12 meses) e o clique num mês refazem todos os gráficos.
export default function Home() {
  const { usuario } = useAuth()
  const { receitas, despesas, investimentos, carregando, erro } = useFinancas(usuario.idUsuario)
  const resumo = useLista(async () => [await resumoApi.buscar(usuario.idUsuario)], [usuario.idUsuario])
  const saldoGeral = resumo.itens[0]?.saldo
  const saldoContas = resumo.itens[0]?.saldoContas
  const totalDividas = resumo.itens[0]?.totalDividas

  const [periodo, setPeriodo] = useState(6)
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null)

  const painel = useMemo(() => {
    const meses = ultimosMeses(periodo)
    const chaves = meses.map((m) => m.chave)
    const porMes = {
      receitas: somarPorMes(receitas, 'valor'),
      despesas: somarPorMes(despesas, 'valor'),
      investido: somarPorMes(investimentos, 'valorInvestido'),
    }

    // Saldo acumulado: parte do que já existia antes do primeiro mês mostrado
    const antes = <T extends { data: string }>(lista: T[], campo: keyof T) => somar(lista.filter((i) => chaveMes(i.data) < chaves[0]), campo)
    let corrente = antes(receitas, 'valor') - antes(despesas, 'valor') - antes(investimentos, 'valorInvestido')
    const saldoPorMes = meses.map((m) => {
      corrente += (porMes.receitas[m.chave] ?? 0) - (porMes.despesas[m.chave] ?? 0) - (porMes.investido[m.chave] ?? 0)
      return { chave: m.chave, rotulo: m.rotulo, valor: corrente }
    })

    // O que os cartões, a rosca e o ranking mostram: o mês focado ou o período inteiro
    const escopo = mesSelecionado ? [mesSelecionado] : chaves
    const rec = filtrarPorMeses(receitas, escopo)
    const desp = filtrarPorMeses(despesas, escopo)
    const inv = filtrarPorMeses(investimentos, escopo)
    const totalReceitas = somar(rec, 'valor')
    const totalDespesas = somar(desp, 'valor')
    const totalInvestido = somar(inv, 'valorInvestido')

    const maioresDespesas = agruparPor(desp, (d) => d.descricao, 'valor')
    // O mês atual ainda não terminou, então fica de fora da comparação de "melhor mês"
    const mesAtual = meses[meses.length - 1].chave
    const melhorMes = meses
      .filter((m) => m.chave !== mesAtual || meses.length === 1)
      .map((m) => ({ ...m, sobra: (porMes.receitas[m.chave] ?? 0) - (porMes.despesas[m.chave] ?? 0) - (porMes.investido[m.chave] ?? 0) }))
      .filter((m) => (porMes.receitas[m.chave] ?? 0) > 0)
      .sort((a, b) => b.sobra - a.sobra)[0]

    return {
      meses,
      porMes,
      saldoPorMes,
      totalReceitas,
      totalDespesas,
      totalInvestido,
      sobra: totalReceitas - totalDespesas - totalInvestido,
      maioresDespesas,
      melhorMes,
    }
  }, [receitas, despesas, investimentos, periodo, mesSelecionado])

  const semDados = !carregando && receitas.length + despesas.length + investimentos.length === 0
  const nomeEscopo = mesSelecionado ? rotuloMes(mesSelecionado) : `últimos ${periodo} meses`
  // Versão com preposição para as frases: "em nov/26" ou "nos últimos 6 meses"
  const emEscopo = mesSelecionado ? `em ${nomeEscopo}` : `nos ${nomeEscopo}`

  function mudarPeriodo(meses: number) {
    setPeriodo(meses)
    setMesSelecionado(null)
  }

  return (
    <>
      <CabecalhoPagina titulo={`Olá, ${usuario.nome}`} subtitulo="A história do seu dinheiro, mês a mês.">
        <SeletorPeriodo valor={periodo} opcoes={[3, 6, 12]} aoMudar={mudarPeriodo} />
      </CabecalhoPagina>

      {carregando && <p className="estado">Carregando seus números...</p>}
      <Alerta tipo="erro">{erro || resumo.erro}</Alerta>

      {semDados && (
        <Alerta tipo="sucesso">
          Você ainda não tem lançamentos. Cadastre uma receita ou uma despesa e os gráficos aparecem aqui.
        </Alerta>
      )}

      {!carregando && !erro && !semDados && (
        <>
          <section className="foco-linha">
            <span>
              Mostrando: <strong>{nomeEscopo}</strong>
            </span>
            {mesSelecionado && (
              <button type="button" className="botao botao-pequeno botao-contorno" onClick={() => setMesSelecionado(null)}>
                Voltar ao período todo
              </button>
            )}
            {saldoContas !== undefined && (
              <span className="saldo-geral">
                Saldo nas contas: <strong>{moeda(saldoContas)}</strong>
                {totalDividas > 0 && <> | Dívidas em aberto: <strong>{moeda(totalDividas)}</strong></>}
                {saldoGeral !== undefined && <> | Saldo apurado: <strong>{moeda(saldoGeral)}</strong></>}
              </span>
            )}
          </section>

          <section className="grade-cartoes">
            <CartaoResumo titulo="Receitas" valor={moeda(painel.totalReceitas)} cor="verde" detalhe={`Entradas ${emEscopo}`} />
            <CartaoResumo titulo="Despesas" valor={moeda(painel.totalDespesas)} cor="rosa" detalhe={`${pct(painel.totalDespesas, painel.totalReceitas)}% da renda`} />
            <CartaoResumo titulo="Investido" valor={moeda(painel.totalInvestido)} cor="ambar" detalhe={`${pct(painel.totalInvestido, painel.totalReceitas)}% da renda`} />
            <CartaoResumo titulo={painel.sobra >= 0 ? 'Sobrou' : 'Faltou'} valor={moeda(Math.abs(painel.sobra))} cor="azul" detalhe="Receitas menos despesas e investimentos" />
          </section>

          <Analise guia={GUIA_INICIO}>
              <strong>{emEscopo[0].toUpperCase() + emEscopo.slice(1)}</strong> você recebeu <strong>{moeda(painel.totalReceitas)}</strong> e gastou{' '}
              <strong>{moeda(painel.totalDespesas)}</strong> ({pct(painel.totalDespesas, painel.totalReceitas)}% da renda).{' '}
              {painel.totalInvestido > 0
                ? <>Investiu <strong>{moeda(painel.totalInvestido)}</strong>. </>
                : <>Ainda não houve investimentos. </>}
              {painel.sobra >= 0
                ? <>Sobraram <strong>{moeda(painel.sobra)}</strong>.</>
                : <>Os gastos e investimentos passaram da renda em <strong>{moeda(-painel.sobra)}</strong>.</>}
              {painel.maioresDespesas[0] && (
                <> Seu maior gasto foi <strong>{painel.maioresDespesas[0].rotulo}</strong> ({moeda(painel.maioresDespesas[0].valor)}).</>
              )}
              {!mesSelecionado && painel.melhorMes && (
                <> O mês em que mais sobrou dinheiro foi <strong>{painel.melhorMes.rotulo}</strong>.</>
              )}
          </Analise>

          <div className="grade-painel">
            <Cartao
              className="largo"
              titulo="Entradas e saídas por mês"
              subtitulo="Clique num mês para focar nele. Clique na legenda para esconder uma série."
            >
              <GraficoBarras
                titulo="Receitas, despesas e investimentos por mês"
                meses={painel.meses}
                series={SERIES}
                valores={painel.porMes}
                selecionado={mesSelecionado}
                aoSelecionar={setMesSelecionado}
              />
            </Cartao>

            <Cartao titulo="Para onde vai cada real" subtitulo={`Como a renda ${emEscopo} foi usada`}>
              <GraficoDonut
                titulo="Divisão da renda entre despesas, investimentos e sobra"
                rotuloCentro="Renda"
                valorCentro={moeda(painel.totalReceitas)}
                segmentos={[
                  { rotulo: 'Despesas', valor: painel.totalDespesas, cor: COR_DESPESA },
                  { rotulo: 'Investido', valor: painel.totalInvestido, cor: COR_INVESTIMENTO },
                  { rotulo: 'Sobra', valor: Math.max(0, painel.sobra), cor: COR_RECEITA },
                ]}
              />
            </Cartao>

            <Cartao className="largo" titulo="Saldo acumulado" subtitulo="Quanto você tinha ao fim de cada mês (receitas menos despesas e investimentos).">
              <GraficoArea
                titulo="Saldo acumulado por mês"
                pontos={painel.saldoPorMes}
                cor={COR_SALDO}
                rotuloValor="Saldo acumulado"
                selecionado={mesSelecionado}
                aoSelecionar={setMesSelecionado}
              />
            </Cartao>

            <Cartao titulo="Onde o dinheiro mais saiu" subtitulo={`Maiores despesas ${emEscopo}`}>
              <BarrasHorizontais itens={painel.maioresDespesas} cor={COR_DESPESA} limite={6} />
            </Cartao>
          </div>
        </>
      )}
    </>
  )
}
