import type { Usuario } from '../../tipos.ts'
import { useMemo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import BarraBusca from '../../components/BarraBusca.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { despesasApi, investimentosApi, receitasApi, usuariosApi } from '../../services/api.ts'
import { cep } from '../../services/formatar.ts'

const GUIA = [
  'O cartão "Seu perfil" mostra os seus dados e um resumo dos seus lançamentos. Use "Editar meu perfil" para mudar nome, e-mail, CEP ou senha (senha em branco mantém a atual).',
  'A coluna "Lançamentos" conta as receitas, despesas e investimentos de cada pessoa.',
  'Você não pode excluir o próprio usuário, nem quem já tem lançamentos: o sistema bloqueia para não apagar o histórico financeiro. Passe o mouse no botão "Excluir" desabilitado para ver o motivo.',
  'A busca filtra por nome ou e-mail.',
]

const inicial = (nome: string) => nome.trim().charAt(0).toUpperCase()

// Consulta (GET) e exclusão (DELETE) de usuários, com o perfil de quem está logado,
// uma análise, busca e a contagem de lançamentos de cada usuário.
export default function UsuariosLista() {
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  // Papel MASTER (administrador) ve todos os usuarios; os demais veem so o proprio perfil.
  // A API tambem recusa (403) o que o papel nao permite, entao cada um carrega so o que pode.
  const ehMaster = usuario.papel === 'MASTER'
  const { itens: todosUsuarios, carregando, erro, recarregar } = useLista(
    () => (ehMaster ? usuariosApi.listar() : usuariosApi.buscar(usuario.idUsuario).then((u) => [u])),
    [ehMaster, usuario.idUsuario],
  )
  const itens = useMemo(
    () => (ehMaster ? todosUsuarios : todosUsuarios.filter((u) => u.idUsuario === usuario.idUsuario)),
    [ehMaster, todosUsuarios, usuario.idUsuario],
  )
  // Para contar lançamentos: o master conta os de todos; os demais, só os próprios
  const receitas = useLista(() => (ehMaster ? receitasApi.listarTodas() : receitasApi.listar(usuario.idUsuario)), [ehMaster, usuario.idUsuario])
  const despesas = useLista(() => (ehMaster ? despesasApi.listarTodas() : despesasApi.listar(usuario.idUsuario)), [ehMaster, usuario.idUsuario])
  const investimentos = useLista(() => (ehMaster ? investimentosApi.listarTodos() : investimentosApi.listar(usuario.idUsuario)), [ehMaster, usuario.idUsuario])

  const contagem = useMemo(() => {
    const mapa: Record<number, { receitas: number; despesas: number; investimentos: number; total: number }> = {}
    const somarTipo = (lista: { usuario?: Usuario }[], tipo: 'receitas' | 'despesas' | 'investimentos') => {
      for (const item of lista) {
        if (item.usuario?.idUsuario === undefined) continue
        const id = item.usuario.idUsuario
        mapa[id] = mapa[id] ?? { receitas: 0, despesas: 0, investimentos: 0, total: 0 }
        mapa[id][tipo] += 1
        mapa[id].total += 1
      }
    }
    somarTipo(receitas.itens, 'receitas')
    somarTipo(despesas.itens, 'despesas')
    somarTipo(investimentos.itens, 'investimentos')
    return mapa
  }, [receitas.itens, despesas.itens, investimentos.itens])

  const totalDe = (u: Usuario) => contagem[u.idUsuario]?.total ?? 0
  const meu = itens.find((u) => u.idUsuario === usuario.idUsuario) ?? usuario
  const meusLancamentos = contagem[usuario.idUsuario] ?? { receitas: 0, despesas: 0, investimentos: 0, total: 0 }

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return itens.filter((u) => u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo))
  }, [itens, busca])

  const analise = useMemo(() => {
    if (itens.length === 0) return null
    const comLancamentos = itens.filter((u) => totalDe(u) > 0)
    const maisAtivo = [...comLancamentos].sort((a, b) => totalDe(b) - totalDe(a))[0]
    return { comLancamentos: comLancamentos.length, semLancamentos: itens.length - comLancamentos.length, maisAtivo }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, contagem])

  const colunas: ColunaLista<Usuario>[] = [
    {
      chave: 'nome',
      rotulo: 'Nome',
      formatar: (u) => (
        <>
          <span className="avatar">{inicial(u.nome)}</span>
          {u.nome}
          {u.idUsuario === usuario.idUsuario && <span className="etiqueta etiqueta-voce">Você</span>}
        </>
      ),
    },
    { chave: 'email', rotulo: 'E-mail' },
    { chave: 'cep', rotulo: 'CEP', formatar: (u) => cep(u.cep) },
    { chave: 'lancamentos', rotulo: 'Lançamentos', formatar: (u) => totalDe(u) },
  ]

  async function excluir(item: Usuario) {
    await usuariosApi.excluir(item.idUsuario)
    await recarregar()
  }

  const motivoBloqueio = (u: Usuario) =>
    u.idUsuario === usuario.idUsuario
      ? 'Você não pode excluir o próprio usuário.'
      : 'Este usuário tem lançamentos e não pode ser excluído.'

  return (
    <>
      <CabecalhoPagina
        titulo={ehMaster ? 'Usuários' : 'Meu perfil'}
        subtitulo={ehMaster ? 'Pessoas cadastradas no SpendWise.' : 'Seus dados e o resumo dos seus lançamentos.'}
      >
        {ehMaster && (
          <Link to="/usuarios/novo" className="botao botao-primario">
            Novo usuário
          </Link>
        )}
      </CabecalhoPagina>

      <section className="perfil">
        <span className="avatar avatar-grande">{inicial(meu.nome)}</span>
        <div className="perfil-dados">
          <span className="perfil-rotulo">Seu perfil{meu.papel === 'MASTER' && <span className="etiqueta-master">Master</span>}</span>
          <strong>{meu.nome}</strong>
          <span>{meu.email}</span>
          <span>CEP {cep(meu.cep)}</span>
        </div>
        <div className="perfil-resumo">
          <div>
            <strong>{meusLancamentos.receitas}</strong>
            <span>receitas</span>
          </div>
          <div>
            <strong>{meusLancamentos.despesas}</strong>
            <span>despesas</span>
          </div>
          <div>
            <strong>{meusLancamentos.investimentos}</strong>
            <span>investimentos</span>
          </div>
        </div>
        <Link to={`/usuarios/${usuario.idUsuario}/editar`} className="botao botao-contorno">
          Editar meu perfil
        </Link>
      </section>

      {ehMaster && !carregando && !erro && analise && (
        <Analise guia={GUIA}>
          O SpendWise tem <strong>{itens.length}</strong> {itens.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}.{' '}
          {analise.comLancamentos > 0 ? (
            <>
              <strong>{analise.comLancamentos}</strong> {analise.comLancamentos === 1 ? 'já tem' : 'já têm'} lançamentos
              {analise.semLancamentos > 0 && <> e {analise.semLancamentos} ainda não {analise.semLancamentos === 1 ? 'tem' : 'têm'}</>}.{' '}
              Quem mais movimenta é <strong>{analise.maisAtivo.nome}</strong>, com {totalDe(analise.maisAtivo)} lançamentos.
            </>
          ) : (
            <>Ninguém tem lançamentos ainda.</>
          )}
        </Analise>
      )}

      {ehMaster && !carregando && !erro && itens.length > 0 && (
        <BarraBusca valor={busca} aoMudar={setBusca} total={itens.length} exibidos={filtrados.length} placeholder="Buscar por nome ou e-mail" />
      )}

      {/* A tabela de usuarios e do MASTER; quem tem papel comum ve so o cartao do proprio perfil */}
      {ehMaster && (
        <ListaCrud
          colunas={colunas}
          itens={filtrados}
          carregando={carregando}
          erro={erro}
          rotaEditar={(u) => `/usuarios/${u.idUsuario}/editar`}
          aoExcluir={excluir}
          descricaoItem={(u) => `o usuário ${u.nome}`}
          podeExcluir={(u) => u.idUsuario !== usuario.idUsuario && totalDe(u) === 0}
          motivoBloqueio={motivoBloqueio}
          vazio="Nenhum usuário encontrado para essa busca."
        />
      )}

      {/* Janela de cadastro/edicao (rotas filhas /novo e /:id/editar) abre por cima da lista */}
      <Outlet context={{ recarregar }} />
    </>
  )
}
