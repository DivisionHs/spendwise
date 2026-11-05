import type { OrcamentoStatus } from '../../tipos.ts'
import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import Progresso from '../../components/Progresso.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useDialogos } from '../../context/DialogosContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { orcamentosApi } from '../../services/api.ts'
import { somar } from '../../services/agregar.ts'
import { moeda } from '../../services/formatar.ts'

const ROTULO_SITUACAO = { OK: 'No limite', ATENCAO: 'Atenção', CRITICO: 'Crítico', EXCEDIDO: 'Excedido' }

const GUIA = [
  'Cada cartão mostra o limite de gastos do mês para uma categoria, quanto você já gastou e quanto resta. A barra muda de cor: verde abaixo de 80%, amarela a partir de 80% (atenção), vermelha a partir de 90% (crítico) e quando passa de 100% (excedido).',
  'O gasto vem das despesas do mês atual com aquela categoria. Ao cadastrar uma despesa que leva o orçamento a 80% ou mais, você recebe um aviso na hora.',
  'Só pode existir um orçamento por categoria.',
]

// Orçamentos: limite mensal por categoria, com barras de progresso (US03 da Fase 1, tela da Fase 2).
export default function OrcamentosPagina() {
  const { usuario } = useAuth()
  const { confirmar, notificar } = useDialogos()
  const { itens, carregando, erro, recarregar } = useLista(() => orcamentosApi.status(usuario.idUsuario), [usuario.idUsuario])

  const resumo = useMemo(() => {
    const limite = somar(itens, 'limite')
    const gasto = somar(itens, 'gasto')
    return { limite, gasto, restante: limite - gasto, percentual: limite > 0 ? Math.round((gasto / limite) * 1000) / 10 : 0 }
  }, [itens])

  async function excluir(orcamento: OrcamentoStatus) {
    const ok = await confirmar({
      titulo: 'Excluir orçamento?',
      mensagem: `Você vai excluir o orçamento de ${orcamento.rotulo}. Esta ação não pode ser desfeita.`,
      textoConfirmar: 'Sim, excluir',
      perigo: true,
    })
    if (!ok) return
    try {
      await orcamentosApi.excluir(orcamento.idOrcamento)
      await recarregar()
      notificar('sucesso', 'Orçamento excluído com sucesso.')
    } catch (e) {
      notificar('erro', e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  const emRisco = itens.filter((o) => o.situacao !== 'OK')

  return (
    <>
      <CabecalhoPagina titulo="Orçamentos" subtitulo="Seus limites de gastos por categoria neste mês.">
        <Link to="/orcamentos/novo" className="botao botao-primario">
          Novo orçamento
        </Link>
      </CabecalhoPagina>

      {carregando && <p className="estado">Carregando...</p>}
      {erro && <p className="estado">{erro}</p>}

      {!carregando && !erro && itens.length === 0 && (
        <p className="estado">Nenhum orçamento ainda. Crie um limite para uma categoria e acompanhe seus gastos.</p>
      )}

      {!carregando && !erro && itens.length > 0 && (
        <>
          <Analise guia={GUIA}>
            Você planejou <strong>{moeda(resumo.limite)}</strong> em <strong>{itens.length}</strong>{' '}
            {itens.length === 1 ? 'categoria' : 'categorias'} e já gastou <strong>{moeda(resumo.gasto)}</strong> ({resumo.percentual}%) neste mês.{' '}
            {emRisco.length > 0 ? (
              <>
                Pedem atenção: <strong>{emRisco.map((o) => o.rotulo).join(', ')}</strong>.
              </>
            ) : (
              <>Todas as categorias estão dentro do limite.</>
            )}
          </Analise>

          <section className="orcamento-total">
            <div>
              <span>Orçamento total</span>
              <strong>{moeda(resumo.limite)}</strong>
            </div>
            <div>
              <span>Utilizado</span>
              <strong>{moeda(resumo.gasto)}</strong>
            </div>
            <div>
              <span>Restante</span>
              <strong>{moeda(resumo.restante)}</strong>
            </div>
            <div className="orcamento-total-barra">
              <span>{resumo.percentual}% consumido</span>
              <Progresso percentual={resumo.percentual} situacao={resumo.percentual > 100 ? 'excedido' : resumo.percentual >= 80 ? 'atencao' : 'ok'} rotulo="Orçamento total consumido" />
            </div>
          </section>

          <div className="grade-orcamentos">
            {itens.map((o) => (
              <article className="orcamento-cartao" key={o.idOrcamento}>
                <header>
                  <h2>{o.rotulo}</h2>
                  <span className={`etiqueta etiqueta-${o.situacao.toLowerCase()}`}>{ROTULO_SITUACAO[o.situacao]}</span>
                </header>
                <p className="orcamento-valor">
                  <strong>{moeda(o.gasto)}</strong> <small>/ {moeda(o.limite)}</small>
                </p>
                <Progresso percentual={o.percentual} situacao={o.situacao.toLowerCase() as 'ok' | 'atencao' | 'critico' | 'excedido'} rotulo={`Orçamento de ${o.rotulo}`} />
                <p className="orcamento-rodape">
                  <span>{o.percentual}%</span>
                  <span>{o.restante >= 0 ? `Restam ${moeda(o.restante)}` : `Excedeu ${moeda(-o.restante)}`}</span>
                </p>
                <div className="orcamento-acoes">
                  <Link className="botao botao-pequeno botao-contorno" to={`/orcamentos/${o.idOrcamento}/editar`}>
                    Editar
                  </Link>
                  <button type="button" className="botao botao-pequeno botao-perigo" onClick={() => excluir(o)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <Outlet context={{ recarregar }} />
    </>
  )
}