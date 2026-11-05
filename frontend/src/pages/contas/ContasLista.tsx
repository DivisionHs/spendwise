import type { Conta } from '../../tipos.ts'
import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { contasApi } from '../../services/api.ts'
import { somar } from '../../services/agregar.ts'
import { moeda } from '../../services/formatar.ts'

const COLUNAS: ColunaLista<Conta>[] = [
  { chave: 'banco', rotulo: 'Banco' },
  { chave: 'agencia', rotulo: 'Agência' },
  { chave: 'numeroConta', rotulo: 'Conta' },
  {
    chave: 'tipo',
    rotulo: 'Tipo',
    formatar: (c) => (
      <span className="etiqueta etiqueta-neutra">{c.tipo === 'POUPANCA' ? 'Poupança' : 'Corrente'}</span>
    ),
  },
  {
    chave: 'saldo',
    rotulo: 'Saldo atual',
    formatar: (c) => <span className={c.saldo < 0 ? 'celula-valor-rosa' : 'celula-valor-verde'}>{moeda(c.saldo)}</span>,
  },
]

const GUIA = [
  'Cada conta é uma conta bancária sua (corrente ou poupança) com o saldo atual.',
  'Receitas e despesas que você cadastra movimentam o saldo da sua conta corrente automaticamente: receita soma, despesa subtrai. Alterar ou excluir um lançamento ajusta o saldo de volta.',
  'Se você tiver mais de uma conta, os lançamentos vão para a primeira conta corrente.',
]

// Consulta (GET) e exclusão (DELETE) das contas bancárias do usuário logado.
export default function ContasLista() {
  const { usuario } = useAuth()
  const { itens, carregando, erro, recarregar } = useLista(() => contasApi.listar(usuario.idUsuario), [usuario.idUsuario])
  const total = useMemo(() => somar(itens, 'saldo'), [itens])

  async function excluir(conta: Conta) {
    await contasApi.excluir(conta.idConta)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Contas" subtitulo="Suas contas bancárias e o saldo de cada uma.">
        <Link to="/contas/novo" className="botao botao-primario">
          Nova conta
        </Link>
      </CabecalhoPagina>

      {!carregando && !erro && itens.length > 0 && (
        <Analise guia={GUIA}>
          Você tem <strong>{itens.length}</strong> {itens.length === 1 ? 'conta' : 'contas'} e um saldo total de{' '}
          <strong>{moeda(total)}</strong>.
          {itens.length > 1 && <> A conta com maior saldo é <strong>{[...itens].sort((a, b) => b.saldo - a.saldo)[0].banco}</strong>.</>}
        </Analise>
      )}

      <ListaCrud
        colunas={COLUNAS}
        itens={itens}
        carregando={carregando}
        erro={erro}
        rotaEditar={(c) => `/contas/${c.idConta}/editar`}
        aoExcluir={excluir}
        descricaoItem={(c) => `a conta ${c.numeroConta} do ${c.banco}`}
        vazio="Nenhuma conta cadastrada ainda."
      />

      <Outlet context={{ recarregar }} />
    </>
  )
}