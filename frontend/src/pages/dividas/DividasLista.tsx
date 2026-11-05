import type { Divida } from '../../tipos.ts'
import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { dividasApi } from '../../services/api.ts'
import { somar } from '../../services/agregar.ts'
import { dataBr, moeda } from '../../services/formatar.ts'

function diasAte(iso: string) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [a, m, d] = iso.split('-').map(Number)
  return Math.round((new Date(a, m - 1, d).getTime() - hoje.getTime()) / 86_400_000)
}

function situacao(divida: Divida) {
  if (divida.quitada) return { texto: 'Quitada', classe: 'ok' }
  if (divida.vencida) return { texto: 'Vencida', classe: 'critico' }
  const dias = diasAte(divida.vencimento)
  if (dias <= 7) return { texto: `Vence em ${dias} dia(s)`, classe: 'atencao' }
  return { texto: 'Em dia', classe: 'neutra' }
}

const COLUNAS: ColunaLista<Divida>[] = [
  { chave: 'descricao', rotulo: 'Dívida' },
  { chave: 'vencimento', rotulo: 'Vencimento', formatar: (d) => dataBr(d.vencimento) },
  {
    chave: 'situacao',
    rotulo: 'Situação',
    formatar: (d) => {
      const s = situacao(d)
      return <span className={`etiqueta etiqueta-${s.classe}`}>{s.texto}</span>
    },
  },
  { chave: 'valor', rotulo: 'Falta pagar', formatar: (d) => <span className="celula-valor-rosa">{moeda(d.valor)}</span> },
]

const GUIA = [
  'O valor de cada dívida é o que ainda falta pagar. Use "Pagar" para registrar um pagamento parcial ou total: o valor é abatido e, se zerar, a dívida fica quitada.',
  'Dívidas vencidas aparecem em vermelho e as que vencem em até 7 dias em amarelo. Elas também geram alertas na tela "Alertas e Insights".',
]

// Consulta (GET) e exclusão (DELETE) das dívidas do usuário logado, com pagamento parcial.
export default function DividasLista() {
  const { usuario } = useAuth()
  const { itens, carregando, erro, recarregar } = useLista(() => dividasApi.listar(usuario.idUsuario), [usuario.idUsuario])

  const resumo = useMemo(() => {
    const abertas = itens.filter((d) => !d.quitada)
    return {
      abertas,
      total: somar(abertas, 'valor'),
      vencidas: abertas.filter((d) => d.vencida).length,
      proxima: [...abertas].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0],
    }
  }, [itens])

  async function excluir(divida: Divida) {
    await dividasApi.excluir(divida.idDivida)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Dívidas" subtitulo="O que você ainda precisa pagar.">
        <Link to="/dividas/novo" className="botao botao-primario">
          Nova dívida
        </Link>
      </CabecalhoPagina>

      {!carregando && !erro && itens.length > 0 && (
        <Analise guia={GUIA}>
          {resumo.abertas.length > 0 ? (
            <>
              Você tem <strong>{resumo.abertas.length}</strong> {resumo.abertas.length === 1 ? 'dívida em aberto' : 'dívidas em aberto'}, somando{' '}
              <strong>{moeda(resumo.total)}</strong>.{' '}
              {resumo.vencidas > 0 && <><strong>{resumo.vencidas}</strong> já {resumo.vencidas === 1 ? 'venceu' : 'venceram'}. </>}
              A próxima a vencer é <strong>{resumo.proxima.descricao}</strong>, em {dataBr(resumo.proxima.vencimento)}.
            </>
          ) : (
            <>Todas as suas dívidas estão quitadas.</>
          )}
        </Analise>
      )}

      <ListaCrud
        colunas={COLUNAS}
        itens={itens}
        carregando={carregando}
        erro={erro}
        rotaEditar={(d) => `/dividas/${d.idDivida}/editar`}
        aoExcluir={excluir}
        descricaoItem={(d) => `a dívida "${d.descricao}"`}
        acoesExtras={(d) =>
          d.quitada ? null : (
            <Link className="botao botao-pequeno botao-primario" to={`/dividas/${d.idDivida}/pagar`}>
              Pagar
            </Link>
          )
        }
        vazio="Nenhuma dívida cadastrada. Que bom!"
      />

      <Outlet context={{ recarregar }} />
    </>
  )
}