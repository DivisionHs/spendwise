import type { CategoriaInvestimento } from '../../tipos.ts'
import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import Icone from '../../components/Icone.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { categoriasApi, investimentosApi } from '../../services/api.ts'
import { moeda, risco } from '../../services/formatar.ts'

const GUIA = [
  'Cada categoria é um tipo de investimento (renda fixa, ações, fundos...) com um nível de risco: baixo (mais estável), moderado ou alto (oscila mais).',
  '"Seus aportes" e "Total investido por você" mostram quanto do seu dinheiro já foi para cada categoria.',
  'Uma categoria só pode ser excluída se nenhum investimento (de qualquer usuário) estiver usando ela.',
  'Para investir, cadastre a categoria aqui e depois escolha-a na tela de Investimentos.',
]

// Consulta (GET) e exclusão (DELETE) das categorias de investimento.
// Mostra também quanto o usuário logado já investiu em cada uma.
export default function CategoriasLista() {
  const { usuario } = useAuth()
  const ehMaster = usuario.papel === 'MASTER' // as categorias sao compartilhadas: só o master altera
  const { itens, carregando, erro, recarregar } = useLista(() => categoriasApi.listar(), [])
  const aportes = useLista(() => investimentosApi.listar(usuario.idUsuario), [usuario.idUsuario])

  const porCategoria = useMemo(() => {
    const mapa: Record<number, { quantidade: number; total: number }> = {}
    for (const inv of aportes.itens) {
      const id = inv.categoria?.idCatInvest
      mapa[id] = mapa[id] ?? { quantidade: 0, total: 0 }
      mapa[id].quantidade += 1
      mapa[id].total += Number(inv.valorInvestido)
    }
    return mapa
  }, [aportes.itens])

  const analise = useMemo(() => {
    if (itens.length === 0) return null
    const nivel = (n: string) => itens.filter((c) => String(c.risco).toUpperCase() === n).length
    const comAportes = itens.filter((c) => porCategoria[c.idCatInvest])
    const semAportes = itens.filter((c) => !porCategoria[c.idCatInvest])
    const maior = [...comAportes].sort((a, b) => porCategoria[b.idCatInvest].total - porCategoria[a.idCatInvest].total)[0]
    return { baixo: nivel('BAIXO'), moderado: nivel('MODERADO'), alto: nivel('ALTO'), comAportes, semAportes, maior }
  }, [itens, porCategoria])

  const colunas: ColunaLista<CategoriaInvestimento>[] = [
    { chave: 'nome', rotulo: 'Categoria' },
    {
      chave: 'risco',
      rotulo: 'Risco',
      formatar: (c) => <span className={`etiqueta etiqueta-${String(c.risco).toLowerCase()}`}>{risco(c.risco)}</span>,
    },
    { chave: 'aportes', rotulo: 'Seus aportes', formatar: (c) => porCategoria[c.idCatInvest]?.quantidade ?? 0 },
    {
      chave: 'total',
      rotulo: 'Total investido por você',
      formatar: (c) => moeda(porCategoria[c.idCatInvest]?.total ?? 0),
    },
  ]

  async function excluir(categoria: CategoriaInvestimento) {
    await categoriasApi.excluir(categoria.idCatInvest)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Categorias de investimento" subtitulo="Tipos de investimento e o risco de cada um.">
        <Link to="/investimentos" className="botao botao-contorno">
          Voltar aos investimentos
        </Link>
        {ehMaster && (
        <Link to="/categorias/novo" className="botao botao-primario">
          <Icone nome="mais" tamanho={18} />
          Nova categoria
        </Link>
        )}
      </CabecalhoPagina>

      {!carregando && !erro && analise && (
        <Analise guia={GUIA}>
          Existem <strong>{itens.length}</strong> {itens.length === 1 ? 'categoria' : 'categorias'}: {analise.baixo} de risco baixo,{' '}
          {analise.moderado} de risco moderado e {analise.alto} de risco alto.{' '}
          {analise.comAportes.length > 0 ? (
            <>
              Você já investiu em <strong>{analise.comAportes.length}</strong> {analise.comAportes.length === 1 ? 'categoria' : 'categorias'}; a que mais recebeu foi{' '}
              <strong>{analise.maior.nome}</strong> ({moeda(porCategoria[analise.maior.idCatInvest].total)}).
            </>
          ) : (
            <>Você ainda não investiu em nenhuma delas.</>
          )}
          {analise.semAportes.length > 0 && analise.comAportes.length > 0 && (
            <> Ainda sem aportes seus: {analise.semAportes.map((c) => c.nome).join(', ')}.</>
          )}
        </Analise>
      )}

      <ListaCrud
        colunas={colunas}
        itens={itens}
        carregando={carregando}
        erro={erro}
        rotaEditar={(c) => `/categorias/${c.idCatInvest}/editar`}
        aoExcluir={excluir}
        podeEditar={() => ehMaster}
        podeExcluir={() => ehMaster}
        motivoBloqueio={() => 'Só o administrador exclui categorias de investimento.'}
        descricaoItem={(c) => `a categoria "${c.nome}"`}
      />

      {/* Janela de cadastro/edicao (rotas filhas /novo e /:id/editar) abre por cima da lista */}
      <Outlet context={{ recarregar }} />
    </>
  )
}
