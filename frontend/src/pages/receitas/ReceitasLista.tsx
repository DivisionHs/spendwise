import type { Receita } from '../../tipos.ts'
import { useMemo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import BarraBusca from '../../components/BarraBusca.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import PainelLancamentos from '../../components/PainelLancamentos.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { receitasApi } from '../../services/api.ts'
import { agruparPor, somar } from '../../services/agregar.ts'
import { fraseVariacao, mediaMensal, porcentagem, variacaoMensal } from '../../services/analise.ts'
import { dataBr, moeda } from '../../services/formatar.ts'

const COLUNAS: ColunaLista<Receita>[] = [
  { chave: 'data', rotulo: 'Data', formatar: (r) => dataBr(r.data) },
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'valor', rotulo: 'Valor', formatar: (r) => <span className="celula-valor-verde">{moeda(r.valor)}</span> },
]

const GUIA = [
  'Os quatro cartões resumem todas as suas receitas: total, média por lançamento, o maior valor que já entrou e quantos lançamentos existem.',
  'O gráfico mostra quanto entrou em cada mês. Use os botões 3, 6 ou 12 meses para mudar o período e passe o mouse nas barras para ver o valor.',
  'O ranking soma as receitas de mesma descrição e mostra quais fontes mais pesam.',
  'A tabela lista cada lançamento. Digite na busca para filtrar pela descrição; "Editar" e "Excluir" ficam no fim de cada linha.',
]

const textoDescricao = (r: Receita) => r.descricao

// Consulta (GET) e exclusão (DELETE) das receitas do usuário logado, com análise, gráficos e busca.
export default function ReceitasLista() {
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const { itens, carregando, erro, recarregar } = useLista(
    () => receitasApi.listar(usuario.idUsuario),
    [usuario.idUsuario],
  )

  const filtrados = useMemo(
    () => itens.filter((r) => r.descricao.toLowerCase().includes(busca.trim().toLowerCase())),
    [itens, busca],
  )

  const analise = useMemo(() => {
    if (itens.length === 0) return null
    const total = somar(itens, 'valor')
    return {
      total,
      media: mediaMensal(itens, 'valor'),
      principal: agruparPor(itens, textoDescricao, 'valor')[0],
      variacao: variacaoMensal(itens, 'valor'),
    }
  }, [itens])

  async function excluir(receita: Receita) {
    await receitasApi.excluir(receita.idReceita)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Receitas" subtitulo="Tudo o que entrou na sua conta.">
        <Link to="/receitas/novo" className="botao botao-primario">
          Nova receita
        </Link>
      </CabecalhoPagina>

      {!carregando && !erro && (
        <>
          {analise && (
            <Analise guia={GUIA}>
              Você registrou <strong>{itens.length}</strong> {itens.length === 1 ? 'receita' : 'receitas'}, que somam{' '}
              <strong>{moeda(analise.total)}</strong>, em média <strong>{moeda(analise.media)}</strong> por mês. A principal fonte é{' '}
              <strong>{analise.principal.rotulo}</strong>, com {porcentagem(analise.principal.valor, analise.total)}% de tudo o que entrou.
              {analise.variacao && (
                <>
                  {' '}Em <strong>{analise.variacao.rotuloRecente}</strong> entraram <strong>{moeda(analise.variacao.valorRecente)}</strong>,{' '}
                  {fraseVariacao(analise.variacao)} do que em {analise.variacao.rotuloAnterior}.
                </>
              )}
            </Analise>
          )}
          <PainelLancamentos
            itens={itens}
            campoValor="valor"
            nomeSerie="Receitas"
            cor="#059669"
            corClasse="verde"
            textoAgrupar={textoDescricao}
            tituloRanking="De onde vem o dinheiro"
          />
          {itens.length > 0 && (
            <BarraBusca valor={busca} aoMudar={setBusca} total={itens.length} exibidos={filtrados.length} placeholder="Buscar receita pela descrição" />
          )}
        </>
      )}

      <ListaCrud
        colunas={COLUNAS}
        itens={filtrados}
        carregando={carregando}
        erro={erro}
        rotaEditar={(r) => `/receitas/${r.idReceita}/editar`}
        aoExcluir={excluir}
        descricaoItem={(r) => `a receita "${r.descricao}" de ${moeda(r.valor)}`}
        vazio={itens.length === 0 ? 'Nenhuma receita cadastrada ainda.' : 'Nenhuma receita encontrada para essa busca.'}
      />

      {/* Janela de cadastro/edicao (rotas filhas /novo e /:id/editar) abre por cima da lista */}
      <Outlet context={{ recarregar }} />
    </>
  )
}
