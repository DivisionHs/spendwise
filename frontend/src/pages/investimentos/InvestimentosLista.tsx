import type { Investimento } from '../../tipos.ts'
import { useMemo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import BarraBusca from '../../components/BarraBusca.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import Icone from '../../components/Icone.tsx'
import BarraEmpilhada from '../../components/graficos/BarraEmpilhada.tsx'
import Cartao from '../../components/graficos/Cartao.tsx'
import GraficoDonut from '../../components/graficos/GraficoDonut.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import PainelLancamentos from '../../components/PainelLancamentos.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { investimentosApi, receitasApi } from '../../services/api.ts'
import { agruparPor, somar } from '../../services/agregar.ts'
import { fraseVariacao, perfilCarteira, porcentagem, variacaoMensal } from '../../services/analise.ts'
import { dataBr, moeda, risco } from '../../services/formatar.ts'

const CORES_CATEGORIAS = ['#d97706', '#2563eb', '#059669', '#7c3aed', '#e11d48', '#0891b2']
const COR_RISCO = { BAIXO: '#059669', MODERADO: '#d97706', ALTO: '#e11d48' }

const COLUNAS: ColunaLista<Investimento>[] = [
  { chave: 'data', rotulo: 'Data', formatar: (i) => dataBr(i.data) },
  { chave: 'categoria', rotulo: 'Categoria', formatar: (i) => i.categoria?.nome },
  {
    chave: 'risco',
    rotulo: 'Risco',
    formatar: (i) => (
      <span className={`etiqueta etiqueta-${String(i.categoria?.risco).toLowerCase()}`}>{risco(i.categoria?.risco)}</span>
    ),
  },
  { chave: 'valorInvestido', rotulo: 'Valor investido', formatar: (i) => <span className="celula-valor-ambar">{moeda(i.valorInvestido)}</span> },
]

const GUIA = [
  'Os quatro cartões resumem todos os seus aportes: total investido, média por lançamento, o maior lançamento e a quantidade de lançamentos.',
  'O gráfico "Aportes por mês" mostra quanto você investiu em cada mês. Use os botões 3, 6 ou 12 meses para mudar o período.',
  '"Sua carteira" mostra em que categorias o dinheiro está. Passe o mouse em uma fatia para ver a parte de cada uma.',
  '"Risco da carteira" divide o total pelo nível de risco da categoria: baixo (mais estável), moderado ou alto (oscila mais). O perfil citado na análise vem dessa divisão.',
  'Esta análise só descreve a sua carteira. Ela não é recomendação de investimento.',
]

const textoCategoria = (i: Investimento) => i.categoria?.nome

// Consulta (GET) e exclusão (DELETE) dos investimentos do usuário logado,
// com análise, a carteira por categoria e por nível de risco.
export default function InvestimentosLista() {
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const { itens, carregando, erro, recarregar } = useLista(
    () => investimentosApi.listar(usuario.idUsuario),
    [usuario.idUsuario],
  )
  // As receitas entram só para comparar: quanto da renda foi para investimentos
  const receitas = useLista(() => receitasApi.listar(usuario.idUsuario), [usuario.idUsuario])

  const filtrados = useMemo(
    () => itens.filter((i) => String(i.categoria?.nome).toLowerCase().includes(busca.trim().toLowerCase())),
    [itens, busca],
  )

  const carteira = useMemo(() => {
    const porCategoria = agruparPor(itens, textoCategoria, 'valorInvestido')
    const porRisco = ['BAIXO', 'MODERADO', 'ALTO'].map((nivel) => ({
      rotulo: risco(nivel),
      valor: somar(itens.filter((i) => String(i.categoria?.risco).toUpperCase() === nivel), 'valorInvestido'),
      cor: COR_RISCO[nivel as keyof typeof COR_RISCO],
    }))
    return {
      segmentos: porCategoria.map((c, i) => ({ ...c, cor: CORES_CATEGORIAS[i % CORES_CATEGORIAS.length] })),
      porRisco,
      total: somar(itens, 'valorInvestido'),
    }
  }, [itens])

  const analise = useMemo(() => {
    if (itens.length === 0) return null
    const [baixo, moderado, alto] = carteira.porRisco.map((r) => r.valor)
    const totalReceitas = somar(receitas.itens, 'valor')
    return {
      principal: carteira.segmentos[0],
      perfil: perfilCarteira({ baixo, moderado, alto }),
      pBaixo: porcentagem(baixo, carteira.total),
      pModerado: porcentagem(moderado, carteira.total),
      pAlto: porcentagem(alto, carteira.total),
      pesoNaRenda: totalReceitas > 0 ? porcentagem(carteira.total, totalReceitas) : null,
      variacao: variacaoMensal(itens, 'valorInvestido'),
    }
  }, [itens, carteira, receitas.itens])

  async function excluir(investimento: Investimento) {
    await investimentosApi.excluir(investimento.idInvest)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Investimentos" subtitulo="Onde seu dinheiro está rendendo.">
        <Link to="/categorias" className="botao botao-contorno">
          <Icone nome="categorias" tamanho={18} />
          Categorias
        </Link>
        <Link to="/investimentos/novo" className="botao botao-primario">
          <Icone nome="mais" tamanho={18} />
          Novo investimento
        </Link>
      </CabecalhoPagina>

      {!carregando && !erro && (
        <>
          {analise && (
            <Analise guia={GUIA}>
              Você já investiu <strong>{moeda(carteira.total)}</strong> em <strong>{itens.length}</strong> {itens.length === 1 ? 'aporte' : 'aportes'}
              {analise.pesoNaRenda !== null && <>, o equivalente a {analise.pesoNaRenda}% de tudo o que recebeu</>}.{' '}
              A categoria com mais dinheiro é <strong>{analise.principal.rotulo}</strong>, com {porcentagem(analise.principal.valor, carteira.total)}% da carteira.
              {' '}Por risco, são {analise.pBaixo}% em baixo, {analise.pModerado}% em moderado e {analise.pAlto}% em alto: um perfil{' '}
              <strong>{analise.perfil}</strong>.
              {analise.variacao && (
                <>
                  {' '}Em <strong>{analise.variacao.rotuloRecente}</strong> você aportou <strong>{moeda(analise.variacao.valorRecente)}</strong>,{' '}
                  {fraseVariacao(analise.variacao)} do que em {analise.variacao.rotuloAnterior}.
                </>
              )}
            </Analise>
          )}

          <PainelLancamentos
            itens={itens}
            campoValor="valorInvestido"
            nomeSerie="Aportes"
            cor="#d97706"
            corClasse="ambar"
            textoAgrupar={textoCategoria}
            lateral={
              <Cartao titulo="Sua carteira" subtitulo="Quanto há em cada categoria">
                <GraficoDonut
                  titulo="Carteira de investimentos por categoria"
                  rotuloCentro="Total investido"
                  valorCentro={moeda(carteira.total)}
                  segmentos={carteira.segmentos}
                />
              </Cartao>
            }
          >
            <Cartao className="bloco" titulo="Risco da carteira" subtitulo="Quanto do que você investiu está em cada nível de risco">
              <BarraEmpilhada segmentos={carteira.porRisco} />
            </Cartao>
          </PainelLancamentos>

          {itens.length > 0 && (
            <BarraBusca valor={busca} aoMudar={setBusca} total={itens.length} exibidos={filtrados.length} placeholder="Buscar investimento pela categoria" />
          )}
        </>
      )}

      <ListaCrud
        colunas={COLUNAS}
        itens={filtrados}
        carregando={carregando}
        erro={erro}
        rotaEditar={(i) => `/investimentos/${i.idInvest}/editar`}
        aoExcluir={excluir}
        descricaoItem={(i) => `o investimento em ${i.categoria?.nome} de ${moeda(i.valorInvestido)}`}
        vazio={itens.length === 0 ? 'Nenhum investimento cadastrado ainda.' : 'Nenhum investimento encontrado para essa busca.'}
      />

      {/* Janela de cadastro/edicao (rotas filhas /novo e /:id/editar) abre por cima da lista */}
      <Outlet context={{ recarregar }} />
    </>
  )
}
