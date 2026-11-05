import type { Despesa } from '../../tipos.ts'
import { useMemo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import BarraBusca from '../../components/BarraBusca.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import PainelLancamentos from '../../components/PainelLancamentos.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { despesasApi, receitasApi } from '../../services/api.ts'
import { agruparPor, somar } from '../../services/agregar.ts'
import { fraseVariacao, mediaMensal, porcentagem, variacaoMensal } from '../../services/analise.ts'
import { CATEGORIAS_DESPESA, corCategoria, rotuloCategoria } from '../../services/categorias.ts'
import { dataBr, moeda } from '../../services/formatar.ts'

const COLUNAS: ColunaLista<Despesa>[] = [
  { chave: 'data', rotulo: 'Data', formatar: (d) => dataBr(d.data) },
  { chave: 'descricao', rotulo: 'Descrição' },
  {
    chave: 'categoria',
    rotulo: 'Categoria',
    formatar: (d) => (
      <span className="cartao-categoria">
        <span className="ponto" style={{ background: corCategoria(d.categoria) }} />
        {rotuloCategoria(d.categoria)}
      </span>
    ),
  },
  { chave: 'valor', rotulo: 'Valor', formatar: (d) => <span className="celula-valor-rosa">{moeda(d.valor)}</span> },
]

const GUIA = [
  'Os quatro cartões resumem todas as suas despesas: total, média por lançamento, a maior despesa e quantos lançamentos existem.',
  'O gráfico mostra quanto saiu em cada mês. Use os botões 3, 6 ou 12 meses para mudar o período e passe o mouse nas barras para ver o valor.',
  'O ranking soma as despesas por categoria e mostra onde o dinheiro mais sai. Ao cadastrar, cada despesa recebe uma categoria (Alimentação, Transporte, Moradia, Lazer, Saúde, Educação ou Outros).',
  'A tabela lista cada lançamento. Use a busca e o filtro de categoria para encontrar despesas; "Editar" e "Excluir" ficam no fim de cada linha.',
  'Se a despesa levar o orçamento da categoria a 80% do limite ou mais, um aviso aparece ao salvar.',
]

const textoCategoria = (d: Despesa) => rotuloCategoria(d.categoria)

// Consulta (GET) e exclusão (DELETE) das despesas do usuário logado, com análise, gráficos, busca e filtro por categoria.
export default function DespesasLista() {
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const { itens, carregando, erro, recarregar } = useLista(
    () => despesasApi.listar(usuario.idUsuario),
    [usuario.idUsuario],
  )
  // As receitas entram só para comparar: quanto da renda as despesas comprometem
  const receitas = useLista(() => receitasApi.listar(usuario.idUsuario), [usuario.idUsuario])

  const filtrados = useMemo(
    () =>
      itens.filter(
        (d) =>
          d.descricao.toLowerCase().includes(busca.trim().toLowerCase()) && (!categoria || d.categoria === categoria),
      ),
    [itens, busca, categoria],
  )

  const analise = useMemo(() => {
    if (itens.length === 0) return null
    const total = somar(itens, 'valor')
    const totalReceitas = somar(receitas.itens, 'valor')
    return {
      total,
      media: mediaMensal(itens, 'valor'),
      principal: agruparPor(itens, textoCategoria, 'valor')[0],
      variacao: variacaoMensal(itens, 'valor'),
      pesoNaRenda: totalReceitas > 0 ? porcentagem(total, totalReceitas) : null,
    }
  }, [itens, receitas.itens])

  async function excluir(despesa: Despesa) {
    await despesasApi.excluir(despesa.idDespesa)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Despesas" subtitulo="Tudo o que saiu da sua conta.">
        <Link to="/despesas/novo" className="botao botao-primario">
          Nova despesa
        </Link>
      </CabecalhoPagina>

      {!carregando && !erro && (
        <>
          {analise && (
            <Analise guia={GUIA}>
              Você registrou <strong>{itens.length}</strong> {itens.length === 1 ? 'despesa' : 'despesas'}, que somam{' '}
              <strong>{moeda(analise.total)}</strong>, em média <strong>{moeda(analise.media)}</strong> por mês
              {analise.pesoNaRenda !== null && <>, o equivalente a {analise.pesoNaRenda}% de tudo o que você recebeu</>}.{' '}
              A categoria de maior peso é <strong>{analise.principal.rotulo}</strong>, com {porcentagem(analise.principal.valor, analise.total)}% do total.
              {analise.variacao && (
                <>
                  {' '}Em <strong>{analise.variacao.rotuloRecente}</strong> você gastou <strong>{moeda(analise.variacao.valorRecente)}</strong>,{' '}
                  {fraseVariacao(analise.variacao)} do que em {analise.variacao.rotuloAnterior}.
                </>
              )}
            </Analise>
          )}
          <PainelLancamentos
            itens={itens}
            campoValor="valor"
            nomeSerie="Despesas"
            cor="#e11d48"
            corClasse="rosa"
            textoAgrupar={textoCategoria}
            tituloRanking="Despesas por categoria"
          />
          {itens.length > 0 && (
            <BarraBusca valor={busca} aoMudar={setBusca} total={itens.length} exibidos={filtrados.length} placeholder="Buscar despesa pela descrição">
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Filtrar por categoria" className="filtro-select">
                <option value="">Todas as categorias</option>
                {CATEGORIAS_DESPESA.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
            </BarraBusca>
          )}
        </>
      )}

      <ListaCrud
        colunas={COLUNAS}
        itens={filtrados}
        carregando={carregando}
        erro={erro}
        rotaEditar={(d) => `/despesas/${d.idDespesa}/editar`}
        aoExcluir={excluir}
        descricaoItem={(d) => `a despesa "${d.descricao}" de ${moeda(d.valor)}`}
        vazio={itens.length === 0 ? 'Nenhuma despesa cadastrada ainda.' : 'Nenhuma despesa encontrada para esse filtro.'}
      />

      {/* Janela de cadastro/edicao (rotas filhas /novo e /:id/editar) abre por cima da lista */}
      <Outlet context={{ recarregar }} />
    </>
  )
}